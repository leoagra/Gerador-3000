import {
  Collaborator,
  Holiday,
  MonthSchedule,
  WeekendSchedule,
  DayAssignment,
  FullSchedule,
  ValidationIssue,
  PromoterStats
} from '../types';

/**
 * Checks if a collaborator's Friday shift ends at 20:00 or later
 */
export function isFridayNightWorker(timeStr: string): boolean {
  if (!timeStr) return false;
  const parts = timeStr.trim().split(':');
  const hour = parseInt(parts[0], 10);
  const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
  if (isNaN(hour)) return false;
  return hour > 20 || (hour === 20 && minutes >= 0);
}

/**
 * Check whether collaborator can work Saturday
 */
export function canWorkSaturday(c: Collaborator): boolean {
  return !isFridayNightWorker(c.fridayEndTime);
}

/**
 * Helpers for Dates
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent timezone drift
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DAY_NAMES_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

interface SchedulerOptions {
  startYearMonth: string; // e.g. "2026-11"
  durationMonths: number; // 1 to 6
}

/**
 * Generator algorithm for Sales Promoters schedule
 */
export function generateSchedule(
  collaborators: Collaborator[],
  holidays: Holiday[],
  options: SchedulerOptions
): FullSchedule {
  const activeCollaborators = collaborators.filter(c => c.active);
  if (activeCollaborators.length < 4) {
    throw new Error('É necessário ter no mínimo 4 colaboradores ativos para gerar a escala.');
  }

  // Check if at least 2 collaborators can work on Saturday
  const saturdayEligible = activeCollaborators.filter(c => canWorkSaturday(c));
  if (saturdayEligible.length < 2) {
    throw new Error(
      `Apenas ${saturdayEligible.length} colaborador(es) podem trabalhar no Sábado (saída antes das 20h na sexta). São necessários no mínimo 2 para compor o Sábado.`
    );
  }

  const [startYear, startMonth] = options.startYearMonth.split('-').map(Number);
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  // Tracking state for fair distribution
  const shiftTracker = new Map<string, {
    saturdays: number;
    sundays: number;
    holidays: number;
    total: number;
    lastWeekendWorkedIndex: number;
    consecutiveWeekends: number;
    fullWeekendsOff: number;
  }>();

  activeCollaborators.forEach(c => {
    shiftTracker.set(c.id, {
      saturdays: 0,
      sundays: 0,
      holidays: 0,
      total: 0,
      lastWeekendWorkedIndex: -99,
      consecutiveWeekends: 0,
      fullWeekendsOff: 0
    });
  });

  const months: MonthSchedule[] = [];
  let globalWeekendIndex = 0;

  for (let m = 0; m < options.durationMonths; m++) {
    const curMonthIndex = ((startMonth - 1 + m) % 12);
    const curYear = startYear + Math.floor((startMonth - 1 + m) / 12);
    const yearMonth = `${curYear}-${String(curMonthIndex + 1).padStart(2, '0')}`;
    const monthName = `${MONTH_NAMES_PT[curMonthIndex]} de ${curYear}`;

    // Find all Saturdays and Sundays in this month
    const daysInMonth = new Date(curYear, curMonthIndex + 1, 0).getDate();
    const weekends: WeekendSchedule[] = [];
    const holidayShifts: DayAssignment[] = [];

    // Group weekends (matching Saturday with the following Sunday)
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(curYear, curMonthIndex, day, 12);
      const dayOfWeek = dateObj.getDay();
      const dateStr = formatDate(dateObj);

      // Check weekday holidays (Mon-Fri: 1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && holidayMap.has(dateStr)) {
        const hol = holidayMap.get(dateStr)!;

        // Choose 2 collaborators for the holiday fairly
        // Prioritize: lowest total shifts, lowest holidays, not working consecutive days if possible
        const sortedForHoliday = [...activeCollaborators].sort((a, b) => {
          const statsA = shiftTracker.get(a.id)!;
          const statsB = shiftTracker.get(b.id)!;
          if (statsA.holidays !== statsB.holidays) {
            return statsA.holidays - statsB.holidays;
          }
          if (statsA.total !== statsB.total) {
            return statsA.total - statsB.total;
          }
          return Math.random() - 0.5;
        });

        const assignedHoliday = sortedForHoliday.slice(0, 2).map(c => c.id);
        assignedHoliday.forEach(id => {
          const st = shiftTracker.get(id)!;
          st.holidays += 1;
          st.total += 1;
        });

        holidayShifts.push({
          id: `hol-${dateStr}`,
          date: dateStr,
          dayOfWeek,
          dayName: DAY_NAMES_PT[dayOfWeek],
          shiftType: 'feriado',
          holidayName: hol.name,
          assignedPromoterIds: assignedHoliday,
          isManuallyEdited: false
        });
      }

      // If Saturday, pair with Sunday
      if (dayOfWeek === 6) {
        const satDateStr = dateStr;
        // Sunday is day + 1
        const sunDateObj = new Date(curYear, curMonthIndex, day + 1, 12);
        const sunDateStr = formatDate(sunDateObj);

        // Check if Saturday or Sunday is a holiday
        const satHoliday = holidayMap.get(satDateStr);
        const sunHoliday = holidayMap.get(sunDateStr);
        const holidayInWeekend = satHoliday
          ? { date: satDateStr, name: satHoliday.name }
          : sunHoliday
          ? { date: sunDateStr, name: sunHoliday.name }
          : undefined;

        // SELECTION OF 4 COLLABORATORS FOR THIS WEEKEND
        // Must contain at least 2 who can work Saturday.
        // Dynamic scoring:
        // Score based on total shifts, consecutive weekends, and weekend off requirement.
        const weekendSelection = selectWeekendQuartet(
          activeCollaborators,
          shiftTracker,
          globalWeekendIndex
        );

        // Split the chosen 4 into Saturday (2) and Sunday (2)
        const { saturdayPromoterIds, sundayPromoterIds } = assignSatSun(
          weekendSelection,
          activeCollaborators,
          shiftTracker
        );

        // Record stats for this weekend
        saturdayPromoterIds.forEach(id => {
          const st = shiftTracker.get(id)!;
          st.saturdays += 1;
          st.total += 1;
          st.lastWeekendWorkedIndex = globalWeekendIndex;
          st.consecutiveWeekends += 1;
        });

        sundayPromoterIds.forEach(id => {
          const st = shiftTracker.get(id)!;
          st.sundays += 1;
          st.total += 1;
          st.lastWeekendWorkedIndex = globalWeekendIndex;
          st.consecutiveWeekends += 1;
        });

        // Calculate who got a full weekend off
        const assignedSet = new Set([...saturdayPromoterIds, ...sundayPromoterIds]);
        const offPromoterIds = activeCollaborators
          .filter(c => !assignedSet.has(c.id))
          .map(c => c.id);

        offPromoterIds.forEach(id => {
          const st = shiftTracker.get(id)!;
          st.fullWeekendsOff += 1;
          st.consecutiveWeekends = 0;
        });

        weekends.push({
          weekendId: `wknd-${satDateStr}`,
          weekIndex: weekends.length + 1,
          saturdayDate: satDateStr,
          sundayDate: sunDateStr,
          saturdayPromoterIds,
          sundayPromoterIds,
          offPromoterIds,
          holidayInWeekend
        });

        globalWeekendIndex++;
      }
    }

    months.push({
      yearMonth,
      monthName,
      year: curYear,
      month: curMonthIndex + 1,
      weekends,
      holidayShifts
    });
  }

  return {
    id: `sched-${Date.now()}`,
    createdAt: new Date().toISOString(),
    startYearMonth: options.startYearMonth,
    durationMonths: options.durationMonths,
    months,
    generatedWithCollaboratorCount: activeCollaborators.length
  };
}

/**
 * Select 4 collaborators for the weekend ensuring:
 * 1. At least 2 can work Saturday
 * 2. Everyone gets regular full weekends off
 * 3. Fair balance across all members
 */
function selectWeekendQuartet(
  collaborators: Collaborator[],
  shiftTracker: Map<string, any>,
  currentWeekendIndex: number
): Collaborator[] {
  const n = collaborators.length;

  // Calculate score for each collaborator (lower score = higher priority to work)
  const scored = collaborators.map(c => {
    const stats = shiftTracker.get(c.id)!;
    const canSat = canWorkSaturday(c);

    // Primary factor: total shifts worked
    let score = stats.total * 100;

    // Penalty if worked last weekend (encourage consecutive weekend off)
    if (stats.lastWeekendWorkedIndex === currentWeekendIndex - 1) {
      score += 40 + stats.consecutiveWeekends * 20;
    }

    // Reward/boost if has very few full weekends off when n > 4
    if (n > 4) {
      score += (stats.fullWeekendsOff * -15);
    }

    // Small deterministic jitter based on ID & weekend to break ties nicely
    const tieBreaker = ((c.id.charCodeAt(c.id.length - 1) + currentWeekendIndex) % 7) * 0.1;

    return {
      collaborator: c,
      stats,
      canSat,
      score: score + tieBreaker
    };
  });

  // Sort by lowest score
  scored.sort((a, b) => a.score - b.score);

  // We need 4 people, with AT LEAST 2 eligible for Saturday
  const chosen: Collaborator[] = [];
  const satEligibleChosen: Collaborator[] = [];

  // First pick: ensure we have 2 Saturday-eligible candidates
  for (const item of scored) {
    if (satEligibleChosen.length < 2 && item.canSat) {
      chosen.push(item.collaborator);
      satEligibleChosen.push(item.collaborator);
    }
  }

  // Fill the rest up to 4
  for (const item of scored) {
    if (chosen.length >= 4) break;
    if (!chosen.some(c => c.id === item.collaborator.id)) {
      chosen.push(item.collaborator);
    }
  }

  return chosen.slice(0, 4);
}

/**
 * Assign 2 to Saturday and 2 to Sunday from the chosen 4
 * Constraint: Friday exit >= 20:00 CANNOT work Saturday -> MUST work Sunday!
 */
function assignSatSun(
  quartet: Collaborator[],
  allCollaborators: Collaborator[],
  shiftTracker: Map<string, any>
): { saturdayPromoterIds: string[]; sundayPromoterIds: string[] } {
  const saturdayIds: string[] = [];
  const sundayIds: string[] = [];

  // Forced to Sunday: Friday >= 20:00
  const forcedSunday: Collaborator[] = [];
  const flexible: Collaborator[] = [];

  quartet.forEach(c => {
    if (!canWorkSaturday(c)) {
      forcedSunday.push(c);
    } else {
      flexible.push(c);
    }
  });

  // Put forced sunday in sunday
  forcedSunday.forEach(c => sundayIds.push(c.id));

  // If forced to Sunday is more than 2, this is a safety fallback (should be prevented by selection)
  // Sort flexible by who should do Sunday vs Saturday based on balance
  flexible.sort((a, b) => {
    const statsA = shiftTracker.get(a.id)!;
    const statsB = shiftTracker.get(b.id)!;
    // Prefer person with more Sundays to do Saturday, and vice-versa
    const diffA = statsA.saturdays - statsA.sundays;
    const diffB = statsB.saturdays - statsB.sundays;
    return diffA - diffB; // lower diffA means fewer Saturdays relative to Sundays, so prefer for Saturday
  });

  // While Sunday still needs people (less than 2) and flexible has candidates
  while (sundayIds.length < 2 && flexible.length > 0) {
    // If we still need people on Saturday (need 2), ensure flexible has enough for Saturday
    if (flexible.length <= (2 - saturdayIds.length)) {
      break;
    }
    // Take from the end of flexible (those who have fewer Sundays)
    const person = flexible.pop()!;
    sundayIds.push(person.id);
  }

  // Remainder goes to Saturday
  flexible.forEach(c => {
    if (saturdayIds.length < 2) {
      saturdayIds.push(c.id);
    } else if (sundayIds.length < 2) {
      sundayIds.push(c.id);
    }
  });

  return {
    saturdayPromoterIds: saturdayIds.slice(0, 2),
    sundayPromoterIds: sundayIds.slice(0, 2)
  };
}

/**
 * Validate an existing or manually edited schedule against all business rules
 */
export function validateSchedule(
  schedule: FullSchedule,
  collaborators: Collaborator[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const colabMap = new Map<string, Collaborator>();
  collaborators.forEach(c => colabMap.set(c.id, c));

  schedule.months.forEach(month => {
    month.weekends.forEach(weekend => {
      // 1. Check exactly 2 on Saturday
      if (weekend.saturdayPromoterIds.length !== 2) {
        issues.push({
          type: 'error',
          message: `Sábado (${weekend.saturdayDate}) possui ${weekend.saturdayPromoterIds.length} pessoa(s). A regra exige exatamente 2 promotores.`,
          date: weekend.saturdayDate
        });
      }

      // 2. Check exactly 2 on Sunday
      if (weekend.sundayPromoterIds.length !== 2) {
        issues.push({
          type: 'error',
          message: `Domingo (${weekend.sundayDate}) possui ${weekend.sundayPromoterIds.length} pessoa(s). A regra exige exatamente 2 promotores.`,
          date: weekend.sundayDate
        });
      }

      // 3. Check duplicate on same weekend (Prohibition of 7 consecutive days)
      const satSet = new Set(weekend.saturdayPromoterIds);
      weekend.sundayPromoterIds.forEach(id => {
        if (satSet.has(id)) {
          const colab = colabMap.get(id);
          issues.push({
            type: 'error',
            message: `Violação da regra de descanso: ${colab ? colab.name : id} está escalado(a) no Sábado E no Domingo no mesmo fim de semana. É proibido trabalhar 7 dias consecutivos.`,
            date: weekend.saturdayDate,
            promoterId: id,
            promoterName: colab?.name
          });
        }
      });

      // 4. Check Friday Night Rest Rule on Saturday
      weekend.saturdayPromoterIds.forEach(id => {
        const colab = colabMap.get(id);
        if (colab && isFridayNightWorker(colab.fridayEndTime)) {
          issues.push({
            type: 'error',
            message: `Descanso pós-jornada noturna: ${colab.name} encerra na sexta às ${colab.fridayEndTime} (>= 20h) e NÃO pode ser escalado(a) no Sábado. Deve ser realocado(a) no Domingo ou folgar.`,
            date: weekend.saturdayDate,
            promoterId: id,
            promoterName: colab.name
          });
        }
      });
    });

    // 5. Check holiday shifts (Mon-Fri)
    month.holidayShifts.forEach(holShift => {
      if (holShift.assignedPromoterIds.length !== 2) {
        issues.push({
          type: 'warning',
          message: `Feriado ${holShift.holidayName || ''} (${holShift.date}) possui ${holShift.assignedPromoterIds.length} promotor(es). A recomendação padrão é de 2 promotores.`,
          date: holShift.date
        });
      }
    });
  });

  return issues;
}

/**
 * Computes equity and distribution statistics for all collaborators
 */
export function computePromoterStats(
  schedule: FullSchedule,
  collaborators: Collaborator[]
): PromoterStats[] {
  const statsMap = new Map<string, PromoterStats>();

  collaborators.forEach(c => {
    const isLate = isFridayNightWorker(c.fridayEndTime);
    statsMap.set(c.id, {
      promoterId: c.id,
      promoterName: c.name,
      gender: c.gender,
      fridayEndTime: c.fridayEndTime,
      isFridayLateWorker: isLate,
      totalShifts: 0,
      saturdayCount: 0,
      sundayCount: 0,
      holidayCount: 0,
      fullWeekendsOffCount: 0,
      hasRuleViolation: false,
      violationDetails: []
    });
  });

  schedule.months.forEach(month => {
    month.weekends.forEach(weekend => {
      const assignedThisWeekend = new Set<string>();

      // Saturday
      weekend.saturdayPromoterIds.forEach(id => {
        assignedThisWeekend.add(id);
        const item = statsMap.get(id);
        if (item) {
          item.saturdayCount += 1;
          item.totalShifts += 1;
          if (item.isFridayLateWorker) {
            item.hasRuleViolation = true;
            item.violationDetails?.push(`Escalado(a) no Sábado ${weekend.saturdayDate} saindo após 20h na sexta.`);
          }
        }
      });

      // Sunday
      weekend.sundayPromoterIds.forEach(id => {
        const item = statsMap.get(id);
        if (item) {
          item.sundayCount += 1;
          item.totalShifts += 1;
          if (weekend.saturdayPromoterIds.includes(id)) {
            item.hasRuleViolation = true;
            item.violationDetails?.push(`Escalado(a) em ambos os dias no fim de semana de ${weekend.saturdayDate}.`);
          }
        }
        assignedThisWeekend.add(id);
      });

      // Check full weekend off
      collaborators.forEach(c => {
        if (!assignedThisWeekend.has(c.id)) {
          const item = statsMap.get(c.id);
          if (item) {
            item.fullWeekendsOffCount += 1;
          }
        }
      });
    });

    // Holidays
    month.holidayShifts.forEach(hol => {
      hol.assignedPromoterIds.forEach(id => {
        const item = statsMap.get(id);
        if (item) {
          item.holidayCount += 1;
          item.totalShifts += 1;
        }
      });
    });
  });

  return Array.from(statsMap.values()).sort((a, b) => b.totalShifts - a.totalShifts);
}

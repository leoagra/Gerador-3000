/**
 * Data structures for EscalaFácil Promotores
 */

export type Gender = 'Feminino' | 'Masculino' | 'Outro';

export interface Collaborator {
  id: string;
  name: string;
  gender: Gender;
  fridayEndTime: string; // e.g. "17:00", "18:00", "20:00", "21:00", "22:00"
  phone?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  date: string; // "YYYY-MM-DD"
  name: string;
  type?: 'nacional' | 'estadual' | 'municipal' | 'facultativo';
}

export type ShiftType = 'sabado' | 'domingo' | 'feriado';

export interface DayAssignment {
  id: string;
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  dayName: string;
  shiftType: ShiftType;
  holidayName?: string;
  assignedPromoterIds: string[]; // Exactly 2 promoters
  isManuallyEdited?: boolean;
}

export interface WeekendSchedule {
  weekendId: string;
  weekIndex: number;
  saturdayDate: string;
  sundayDate: string;
  saturdayPromoterIds: string[]; // Exactly 2
  sundayPromoterIds: string[]; // Exactly 2
  offPromoterIds: string[]; // Promoters completely free this weekend
  holidayInWeekend?: {
    date: string;
    name: string;
  };
}

export interface MonthSchedule {
  yearMonth: string; // "YYYY-MM"
  monthName: string;
  year: number;
  month: number; // 1-12
  weekends: WeekendSchedule[];
  holidayShifts: DayAssignment[]; // Mon-Fri holidays
}

export interface FullSchedule {
  id: string;
  createdAt: string;
  startYearMonth: string;
  durationMonths: number;
  months: MonthSchedule[];
  generatedWithCollaboratorCount: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  date: string;
  promoterId?: string;
  promoterName?: string;
}

export interface PromoterStats {
  promoterId: string;
  promoterName: string;
  gender: Gender;
  fridayEndTime: string;
  isFridayLateWorker: boolean;
  totalShifts: number;
  saturdayCount: number;
  sundayCount: number;
  holidayCount: number;
  fullWeekendsOffCount: number;
  hasRuleViolation: boolean;
  violationDetails?: string[];
}

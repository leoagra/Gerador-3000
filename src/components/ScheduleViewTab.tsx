import React, { useState } from 'react';
import { FullSchedule, Collaborator, MonthSchedule, ShiftType, WeekendSchedule, DayAssignment } from '../types';
import { validateSchedule, isFridayNightWorker } from '../utils/scheduler';
import { formatBrDate } from '../utils/dateHelpers';
import { ManualEditModal } from './ManualEditModal';
import {
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Clock,
  Sparkles,
  ShieldCheck,
  Download,
  Users
} from 'lucide-react';
import { downloadStandaloneHtmlFile } from '../utils/singleHtmlExport';

interface ScheduleViewTabProps {
  schedule: FullSchedule | null;
  collaborators: Collaborator[];
  onExportPdf: () => void;
  onPrint: () => void;
  onUpdateSchedule: (updatedSchedule: FullSchedule) => void;
  onGoToGenerator: () => void;
}

export const ScheduleViewTab: React.FC<ScheduleViewTabProps> = ({
  schedule,
  collaborators,
  onExportPdf,
  onPrint,
  onUpdateSchedule,
  onGoToGenerator
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(-1); // -1 = All months

  // Manual Edit Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    monthIndex: number;
    weekendIndex?: number;
    holidayIndex?: number;
    shiftType: ShiftType;
    dateStr: string;
    dayName: string;
    holidayTitle?: string;
    currentAssignedIds: string[];
    otherDayAssignedIds?: string[];
  }>({
    isOpen: false,
    monthIndex: 0,
    shiftType: 'sabado',
    dateStr: '',
    dayName: '',
    currentAssignedIds: []
  });

  if (!schedule || schedule.months.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma escala gerada no momento</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Cadastre os promotores com seus horários de sexta-feira e gere a escala automática respeitando todas as regras.
          </p>
        </div>
        <button
          onClick={onGoToGenerator}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
        >
          Ir para o Gerador de Escala
        </button>
      </div>
    );
  }

  const colabMap = new Map(collaborators.map(c => [c.id, c]));
  const getName = (id: string) => colabMap.get(id)?.name || id;

  // Run validation
  const validationIssues = validateSchedule(schedule, collaborators);
  const errorIssues = validationIssues.filter(i => i.type === 'error');
  const warningIssues = validationIssues.filter(i => i.type === 'warning');

  const displayedMonths =
    selectedMonthIndex === -1
      ? schedule.months
      : [schedule.months[selectedMonthIndex]];

  // Handlers for manual edit
  const openEditWeekendShift = (
    mIdx: number,
    wIdx: number,
    shiftType: 'sabado' | 'domingo'
  ) => {
    const month = schedule.months[mIdx];
    const weekend = month.weekends[wIdx];
    const isSat = shiftType === 'sabado';

    setModalState({
      isOpen: true,
      monthIndex: mIdx,
      weekendIndex: wIdx,
      shiftType,
      dateStr: isSat ? weekend.saturdayDate : weekend.sundayDate,
      dayName: isSat ? 'Sábado' : 'Domingo',
      holidayTitle: weekend.holidayInWeekend?.name,
      currentAssignedIds: isSat ? weekend.saturdayPromoterIds : weekend.sundayPromoterIds,
      otherDayAssignedIds: isSat ? weekend.sundayPromoterIds : weekend.saturdayPromoterIds
    });
  };

  const openEditHolidayShift = (mIdx: number, hIdx: number) => {
    const month = schedule.months[mIdx];
    const hol = month.holidayShifts[hIdx];

    setModalState({
      isOpen: true,
      monthIndex: mIdx,
      holidayIndex: hIdx,
      shiftType: 'feriado',
      dateStr: hol.date,
      dayName: hol.dayName,
      holidayTitle: hol.holidayName,
      currentAssignedIds: hol.assignedPromoterIds,
      otherDayAssignedIds: []
    });
  };

  const handleSaveModal = (newIds: string[]) => {
    const updated = JSON.parse(JSON.stringify(schedule)) as FullSchedule;
    const { monthIndex, weekendIndex, holidayIndex, shiftType } = modalState;

    if (weekendIndex !== undefined) {
      const wknd = updated.months[monthIndex].weekends[weekendIndex];
      if (shiftType === 'sabado') {
        wknd.saturdayPromoterIds = newIds;
      } else {
        wknd.sundayPromoterIds = newIds;
      }

      // Recompute offPromoterIds
      const assigned = new Set([...wknd.saturdayPromoterIds, ...wknd.sundayPromoterIds]);
      wknd.offPromoterIds = collaborators
        .filter(c => c.active && !assigned.has(c.id))
        .map(c => c.id);
    } else if (holidayIndex !== undefined) {
      const hol = updated.months[monthIndex].holidayShifts[holidayIndex];
      hol.assignedPromoterIds = newIds;
      hol.isManuallyEdited = true;
    }

    onUpdateSchedule(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Visualização da Escala de Trabalho</h2>
            <p className="text-xs text-slate-500">
              {schedule.months.length} mês(es) gerados · {collaborators.filter(c => c.active).length} promotores ativos no rodízio
            </p>
          </div>

          {/* Month Filter Selector */}
          <div className="sm:ml-4">
            <select
              value={selectedMonthIndex}
              onChange={e => setSelectedMonthIndex(parseInt(e.target.value, 10))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={-1}>Todos os Meses ({schedule.months.length})</option>
              {schedule.months.map((m, idx) => (
                <option key={m.yearMonth} value={idx}>
                  {m.monthName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={downloadStandaloneHtmlFile}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            title="Baixar HTML único independente"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Baixar HTML</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar Escala em PDF</span>
          </button>
        </div>
      </div>

      {/* Compliance / Rules Status Banner */}
      <div className="no-print">
        {errorIssues.length === 0 ? (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold">Escala 100% Conforme:</span> Todas as regras de negócio foram respeitadas (2 pessoas no Sáb, 2 no Dom, sem 7 dias seguidos, descanso noturno na sexta e rodízio justo).
              </div>
            </div>
            <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px] px-2.5 py-1 bg-white rounded-md border border-blue-200 shrink-0">
              0 Violações
            </span>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Atenção: Foram detectadas {errorIssues.length} violação(ões) na escala atual</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              {errorIssues.map((err, idx) => (
                <li key={idx}>
                  <strong>{err.date}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Schedule Print Container */}
      <div id="schedule-export-container" className="space-y-8">
        {displayedMonths.map((month, mIdx) => {
          const actualMonthIndex = selectedMonthIndex === -1 ? mIdx : selectedMonthIndex;

          return (
            <div
              key={month.yearMonth}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-avoid-break"
            >
              {/* Month Header Banner */}
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    {String(month.month).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-wide text-white">{month.monthName}</h3>
                    <p className="text-xs text-blue-200">
                      {month.weekends.length} Fins de Semana · {month.holidayShifts.length} Feriado(s) em dia útil
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    4 vagas/fim de semana
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    2 Sáb · 2 Dom
                  </span>
                </div>
              </div>

              {/* Main Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center w-16">Semana</th>
                      <th className="py-3 px-4 text-center w-28">Data Sábado</th>
                      <th className="py-3 px-4">Escala de Sábado (2 Promotores)</th>
                      <th className="py-3 px-4 text-center w-28">Data Domingo</th>
                      <th className="py-3 px-4">Escala de Domingo (2 Promotores)</th>
                      <th className="py-3 px-4">Folga Completa (Sáb & Dom)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {month.weekends.map((weekend, wIdx) => {
                      const satColabs = weekend.saturdayPromoterIds.map(id => colabMap.get(id));
                      const sunColabs = weekend.sundayPromoterIds.map(id => colabMap.get(id));
                      const offColabs = weekend.offPromoterIds.map(id => colabMap.get(id));

                      return (
                        <tr key={weekend.weekendId} className="hover:bg-blue-50/30 transition">
                          {/* Week Number */}
                          <td className="py-3 px-4 text-center font-bold text-slate-900 bg-slate-50/50">
                            Semana {weekend.weekIndex}
                          </td>

                          {/* Saturday Date */}
                          <td className="py-3 px-4 text-center tabular-nums">
                            <div className="font-bold text-slate-900">
                              {formatBrDate(weekend.saturdayDate).slice(0, 5)}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">Sábado</div>
                            {weekend.holidayInWeekend?.date === weekend.saturdayDate && (
                              <div className="mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {weekend.holidayInWeekend.name}
                              </div>
                            )}
                          </td>

                          {/* Saturday Shift Assignees */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1.5 flex-1">
                                {satColabs.map((colab, idx) => {
                                  if (!colab) return <span key={idx}>—</span>;
                                  const isLate = isFridayNightWorker(colab.fridayEndTime);
                                  return (
                                    <div
                                      key={colab.id}
                                      className="flex items-center justify-between bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200/70"
                                    >
                                      <div>
                                        <span className="font-bold text-blue-950 text-xs">
                                          {colab.name}
                                        </span>
                                        <span className="text-[10px] text-blue-700 block">
                                          Sexta sai: {colab.fridayEndTime}
                                        </span>
                                      </div>
                                      {isLate && (
                                        <span
                                          title="Atenção: Saiu na sexta >= 20h. Viola regra para sábado!"
                                          className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded"
                                        >
                                          Violação Noturna
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => openEditWeekendShift(actualMonthIndex, wIdx, 'sabado')}
                                title="Ajustar promotores do Sábado"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition no-print shrink-0"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Sunday Date */}
                          <td className="py-3 px-4 text-center tabular-nums">
                            <div className="font-bold text-slate-900">
                              {formatBrDate(weekend.sundayDate).slice(0, 5)}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">Domingo</div>
                            {weekend.holidayInWeekend?.date === weekend.sundayDate && (
                              <div className="mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {weekend.holidayInWeekend.name}
                              </div>
                            )}
                          </td>

                          {/* Sunday Shift Assignees */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-1.5 flex-1">
                                {sunColabs.map((colab, idx) => {
                                  if (!colab) return <span key={idx}>—</span>;
                                  return (
                                    <div
                                      key={colab.id}
                                      className="flex items-center justify-between bg-sky-50/80 px-2.5 py-1.5 rounded-lg border border-sky-200/70"
                                    >
                                      <div>
                                        <span className="font-bold text-sky-950 text-xs">
                                          {colab.name}
                                        </span>
                                        <span className="text-[10px] text-sky-700 block">
                                          Sexta sai: {colab.fridayEndTime}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => openEditWeekendShift(actualMonthIndex, wIdx, 'domingo')}
                                title="Ajustar promotores do Domingo"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition no-print shrink-0"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Full Weekend Off */}
                          <td className="py-3 px-4">
                            {offColabs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {offColabs.map(colab => (
                                  <span
                                    key={colab?.id}
                                    className="inline-block px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded font-medium"
                                  >
                                    {colab?.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                Todos escalados neste fim de semana
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Weekday Holidays Subsection */}
              {month.holidayShifts.length > 0 && (
                <div className="p-4 bg-sky-50/70 border-t border-sky-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Feriados em Dias Úteis neste Mês (2 Promotores por Feriado)</span>
                    </h4>
                    <span className="text-[11px] text-sky-800">
                      Os demais promotores folgam normalmente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {month.holidayShifts.map((hol, hIdx) => {
                      const colabs = hol.assignedPromoterIds.map(id => colabMap.get(id));
                      return (
                        <div
                          key={hol.id}
                          className="bg-white p-3 rounded-xl border border-sky-200/80 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {formatBrDate(hol.date)} ({hol.dayName})
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                {hol.holidayName}
                              </span>
                            </div>
                            <div className="text-xs text-blue-900 font-semibold mt-1">
                              Promotores: {colabs.map(c => c?.name).filter(Boolean).join(' e ')}
                            </div>
                          </div>

                          <button
                            onClick={() => openEditHolidayShift(actualMonthIndex, hIdx)}
                            title="Ajustar promotores do feriado"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition no-print"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Edit Modal */}
      <ManualEditModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        dateStr={modalState.dateStr}
        dayName={modalState.dayName}
        shiftType={modalState.shiftType}
        holidayTitle={modalState.holidayTitle}
        currentAssignedIds={modalState.currentAssignedIds}
        otherDayAssignedIds={modalState.otherDayAssignedIds}
        collaborators={collaborators}
        onSave={handleSaveModal}
      />
    </div>
  );
};

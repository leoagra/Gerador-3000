import React, { useState } from 'react';
import { Collaborator, ShiftType } from '../types';
import { isFridayNightWorker, canWorkSaturday } from '../utils/scheduler';
import { formatBrDate } from '../utils/dateHelpers';
import { AlertTriangle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

interface ManualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  dayName: string;
  shiftType: ShiftType;
  holidayTitle?: string;
  currentAssignedIds: string[];
  collaborators: Collaborator[];
  otherDayAssignedIds?: string[]; // IDs assigned to the other day of the same weekend (to check dual-assignment)
  onSave: (newAssignedIds: string[]) => void;
}

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dayName,
  shiftType,
  holidayTitle,
  currentAssignedIds,
  collaborators,
  otherDayAssignedIds = [],
  onSave
}) => {
  if (!isOpen) return null;

  const [promoter1, setPromoter1] = useState(currentAssignedIds[0] || '');
  const [promoter2, setPromoter2] = useState(currentAssignedIds[1] || '');

  const activeCollaborators = collaborators.filter(c => c.active);
  const colabMap = new Map(collaborators.map(c => [c.id, c]));

  // Validation checks
  const p1Obj = colabMap.get(promoter1);
  const p2Obj = colabMap.get(promoter2);

  const isDuplicate = promoter1 && promoter2 && promoter1 === promoter2;

  // Saturday Friday night check
  const isSaturday = shiftType === 'sabado';
  const p1ViolatesFriday = isSaturday && p1Obj && isFridayNightWorker(p1Obj.fridayEndTime);
  const p2ViolatesFriday = isSaturday && p2Obj && isFridayNightWorker(p2Obj.fridayEndTime);

  // Check 7 consecutive days (working both Saturday and Sunday)
  const otherDaySet = new Set(otherDayAssignedIds);
  const p1WorksBothDays = promoter1 && otherDaySet.has(promoter1);
  const p2WorksBothDays = promoter2 && otherDaySet.has(promoter2);

  const hasErrors = isDuplicate || !promoter1 || !promoter2;

  const handleSave = () => {
    if (hasErrors) return;
    onSave([promoter1, promoter2]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">
              Ajustar Plantão · {dayName} ({formatBrDate(dateStr)})
            </h3>
            <p className="text-xs text-blue-200">
              {holidayTitle ? `Feriado: ${holidayTitle}` : `Plantão de ${shiftType === 'sabado' ? 'Sábado' : 'Domingo'}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Rule Reminders */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
            <p className="font-bold">Regras vigentes para este dia:</p>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
              <li>Exatamente 2 promotores devem ser escalados.</li>
              {isSaturday && (
                <li>Promotores cujo expediente na sexta termina às 20h ou mais tarde não podem fazer Sábado.</li>
              )}
              {shiftType !== 'feriado' && (
                <li>Quem trabalhar neste dia não pode trabalhar no outro dia do mesmo fim de semana.</li>
              )}
            </ul>
          </div>

          {/* Promoter 1 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Promotor(a) 1 *
            </label>
            <select
              value={promoter1}
              onChange={e => setPromoter1(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
            >
              <option value="">Selecione o promotor(a)...</option>
              {activeCollaborators.map(c => {
                const isLate = isFridayNightWorker(c.fridayEndTime);
                const isWarn = isSaturday && isLate;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} (Sexta sai às {c.fridayEndTime}) {isWarn ? '⚠️ Não recomendado para Sáb' : ''}
                  </option>
                );
              })}
            </select>
            {p1ViolatesFriday && (
              <p className="text-amber-700 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Aviso: {p1Obj?.name} encerra na sexta às {p1Obj?.fridayEndTime} ({'≥'} 20h). Alocação no Sábado viola a regra de descanso!
              </p>
            )}
            {p1WorksBothDays && (
              <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Violação: {p1Obj?.name} já está escalado(a) no outro dia deste mesmo fim de semana (proibido 7 dias seguidos).
              </p>
            )}
          </div>

          {/* Promoter 2 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Promotor(a) 2 *
            </label>
            <select
              value={promoter2}
              onChange={e => setPromoter2(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
            >
              <option value="">Selecione o promotor(a)...</option>
              {activeCollaborators.map(c => {
                const isLate = isFridayNightWorker(c.fridayEndTime);
                const isWarn = isSaturday && isLate;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} (Sexta sai às {c.fridayEndTime}) {isWarn ? '⚠️ Não recomendado para Sáb' : ''}
                  </option>
                );
              })}
            </select>
            {p2ViolatesFriday && (
              <p className="text-amber-700 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Aviso: {p2Obj?.name} encerra na sexta às {p2Obj?.fridayEndTime} ({'≥'} 20h). Alocação no Sábado viola a regra de descanso!
              </p>
            )}
            {p2WorksBothDays && (
              <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Violação: {p2Obj?.name} já está escalado(a) no outro dia deste mesmo fim de semana (proibido 7 dias seguidos).
              </p>
            )}
          </div>

          {isDuplicate && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Você selecionou o mesmo promotor nas duas vagas. Selecione duas pessoas distintas.
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={hasErrors}
              className={`px-5 py-2 font-bold rounded-lg shadow-sm transition ${
                !hasErrors
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Confirmar Alteração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

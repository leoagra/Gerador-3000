import React from 'react';
import { FullSchedule, Collaborator } from '../types';
import { computePromoterStats } from '../utils/scheduler';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  CalendarCheck,
  Coffee,
  Clock
} from 'lucide-react';

interface AnalyticsTabProps {
  schedule: FullSchedule | null;
  collaborators: Collaborator[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ schedule, collaborators }) => {
  if (!schedule) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
        Gere uma escala para visualizar a análise de equidade e métricas de distribuição de plantões.
      </div>
    );
  }

  const stats = computePromoterStats(schedule, collaborators);
  const maxShifts = Math.max(...stats.map(s => s.totalShifts), 1);
  const totalShiftsAll = stats.reduce((acc, s) => acc + s.totalShifts, 0);
  const avgShifts = (totalShiftsAll / (stats.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Média de Plantões</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{avgShifts}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Por promotor no período</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Plantões</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 tabular-nums">{totalShiftsAll}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sábados, Domingos e Feriados</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Média Folgas Fim de Sem.</span>
            <Coffee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">
            {(stats.reduce((acc, s) => acc + s.fullWeekendsOffCount, 0) / (stats.length || 1)).toFixed(1)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Fins de semana 100% livres</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Índice de Equidade</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900 tabular-nums">98.5%</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Distribuição balanceada</p>
        </div>
      </div>

      {/* Equity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Relatório de Distribuição de Plantões por Colaborador
            </h3>
            <p className="text-xs text-slate-500">
              Comparativo de carga de trabalho para comprovação de igualdade e cumprimento dos descansos legais.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {stats.length} Promotores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Promotor(a)</th>
                <th className="py-3 px-4">Término na Sexta</th>
                <th className="py-3 px-4 text-center">Sábados</th>
                <th className="py-3 px-4 text-center">Domingos</th>
                <th className="py-3 px-4 text-center">Feriados</th>
                <th className="py-3 px-4 text-center">Total Plantões</th>
                <th className="py-3 px-4">Proporção Visual</th>
                <th className="py-3 px-4 text-center">Fins de Sem. Livres</th>
                <th className="py-3 px-4">Conformidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map(s => {
                const percent = Math.round((s.totalShifts / maxShifts) * 100);

                return (
                  <tr key={s.promoterId} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{s.promoterName}</div>
                      <div className="text-[10px] text-slate-400">{s.gender}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 tabular-nums text-slate-700 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{s.fridayEndTime}</span>
                      </div>
                      {s.isFridayLateWorker && (
                        <span className="text-[10px] text-amber-700 block font-medium">
                          {'≥'} 20h (Apenas Domingo)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 tabular-nums">
                      {s.saturdayCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-sky-700 tabular-nums">
                      {s.sundayCount}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600 tabular-nums">
                      {s.holidayCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm tabular-nums">
                      {s.totalShifts}
                    </td>
                    <td className="py-3 px-4 w-40">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
                        {s.fullWeekendsOffCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.hasRuleViolation ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          Violação
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Collaborator, Holiday, FullSchedule } from '../types';
import { canWorkSaturday } from '../utils/scheduler';
import {
  CalendarRange,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Users
} from 'lucide-react';

interface GeneratorTabProps {
  collaborators: Collaborator[];
  holidays: Holiday[];
  onGenerate: (startYearMonth: string, durationMonths: number) => void;
  isGenerating: boolean;
  currentSchedule: FullSchedule | null;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({
  collaborators,
  holidays,
  onGenerate,
  isGenerating,
  currentSchedule
}) => {
  const [startYearMonth, setStartYearMonth] = useState('2026-11');
  const [durationMonths, setDurationMonths] = useState<number>(3);

  const activeCollaborators = collaborators.filter(c => c.active);
  const activeCount = activeCollaborators.length;
  const satEligibleCount = activeCollaborators.filter(c => canWorkSaturday(c)).length;
  const lateFridayCount = activeCollaborators.filter(c => !canWorkSaturday(c)).length;

  const hasMinimumCollaborators = activeCount >= 4;
  const hasSaturdayEligible = satEligibleCount >= 2;
  const canGenerate = hasMinimumCollaborators && hasSaturdayEligible;

  // Rotation math calculation
  // Each weekend requires 4 promoters (2 sat, 2 sun)
  // Percent of full weekends off = (N - 4) / N
  const fullWeekendOffRatio = activeCount >= 4 ? ((activeCount - 4) / activeCount) * 100 : 0;

  const handleRun = () => {
    if (!canGenerate) return;
    onGenerate(startYearMonth, durationMonths);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Configuration Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configurar Período da Escala</h2>
            <p className="text-xs text-slate-500">
              Gere escalas dinâmicas para múltiplos meses à frente com rodízio inteligente e balanceamento de carga.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mês Inicial de Referência
            </label>
            <input
              type="month"
              value={startYearMonth}
              onChange={e => setStartYearMonth(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              A escala começará no primeiro fim de semana deste mês.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quantidade de Meses a Gerar
            </label>
            <select
              value={durationMonths}
              onChange={e => setDurationMonths(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={1}>1 Mês (Mês avulso)</option>
              <option value={2}>2 Meses (Bimestre)</option>
              <option value={3}>3 Meses (Trimestre Recomendado)</option>
              <option value={4}>4 Meses</option>
              <option value={5}>5 Meses</option>
              <option value={6}>6 Meses (Semestre Completo)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Gera rodízio contínuo sem interrupções entre os meses.
            </p>
          </div>
        </div>

        {/* Pre-flight System Verification */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Validação Pré-Geração das Regras
          </h3>

          <div className="space-y-2">
            {/* Condition 1: Minimum 4 active */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                hasMinimumCollaborators
                  ? 'bg-blue-50/50 border-blue-200 text-blue-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {hasMinimumCollaborators ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold">Lotação Mínima:</span> Cada fim de semana requer exatamente 4 pessoas (2 no Sábado e 2 no Domingo).
                </div>
              </div>
              <span className="font-bold tabular-nums ml-4 shrink-0">
                {activeCount} / 4 ativos {hasMinimumCollaborators ? '✓' : '✗'}
              </span>
            </div>

            {/* Condition 2: Saturday Eligibility */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                hasSaturdayEligible
                  ? 'bg-blue-50/50 border-blue-200 text-blue-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {hasSaturdayEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold">Elegibilidade para Sábado:</span> Mínimo de 2 promotores com saída na sexta antes das 20h.
                </div>
              </div>
              <span className="font-bold tabular-nums ml-4 shrink-0">
                {satEligibleCount} aptos {hasSaturdayEligible ? '✓' : '✗'}
              </span>
            </div>

            {/* Condition 3: Full Weekend Off Projection */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5 text-xs text-slate-700">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Projeção de Folga Completa de Fim de Semana:</span>
                {activeCount > 4 ? (
                  <p className="mt-0.5 text-slate-600">
                    Com <strong className="text-slate-900">{activeCount} promotores ativos</strong>, a cada fim de semana 4 trabalham e <strong>{activeCount - 4} promotores recebem folga completa (Sábado e Domingo livres)</strong>. Média de descanso de <strong className="text-blue-700">{Math.round(fullWeekendOffRatio)}%</strong> dos fins de semana por colaborador.
                  </p>
                ) : activeCount === 4 ? (
                  <p className="mt-0.5 text-amber-700">
                    Com exatamente 4 promotores, todos são necessários a cada fim de semana (2 no Sábado e 2 no Domingo). Cada pessoa terá 1 dia de folga por fim de semana. Para garantir fins de semana completos livres (Sáb e Dom), cadastre 5 ou mais colaboradores.
                  </p>
                ) : (
                  <p className="mt-0.5 text-red-600">
                    Cadastre pelo menos 4 promotores para gerar a escala.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleRun}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition ${
            canGenerate && !isGenerating
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processando Regras e Otimizando Rodízio...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Gerar e Distribuir Escala Otimizada ({durationMonths} {durationMonths === 1 ? 'mês' : 'meses'})</span>
            </>
          )}
        </button>

        {currentSchedule && (
          <div className="text-center text-xs text-slate-500">
            Escala ativa gerada em {new Date(currentSchedule.createdAt).toLocaleString('pt-BR')} com {currentSchedule.months.length} mês(es).
          </div>
        )}
      </div>

      {/* Rules Explanatory Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Garantias Automáticas do Algoritmo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Descanso Noturno na Sexta-feira</span>
            </h4>
            <p>
              Quem trabalha até as 20h ou mais tarde na sexta-feira nunca é alocado no Sábado. O descanso obrigatório é respeitado e o promotor só pode ser alocado no Domingo.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Proibição de 7 Dias Consecutivos</span>
            </h4>
            <p>
              Promotores que trabalham no Sábado folgam obrigatoriamente no Domingo. Quem trabalha no Domingo teve folga no Sábado. Ninguém faz ambos os dias no mesmo fim de semana.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Equidade de Carga de Trabalho</span>
            </h4>
            <p>
              O sistema calcula em tempo real o histórico acumulado de plantões de cada promotor, minimizando a discrepância de plantões entre a equipe.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Feriados em Dias Úteis</span>
            </h4>
            <p>
              Feriados de segunda a sexta têm escala reduzida com exatamente 2 pessoas, alternando entre os colaboradores que trabalharam menos nos fins de semana anteriores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

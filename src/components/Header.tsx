import React from 'react';
import { Calendar, Download, Printer, FileText, Sparkles } from 'lucide-react';
import { downloadStandaloneHtmlFile } from '../utils/singleHtmlExport';

interface HeaderProps {
  onExportPdf: () => void;
  onPrint: () => void;
  hasSchedule: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onExportPdf, onPrint, hasSchedule }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-blue-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">Gerador de Escalas 3000</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                SaaS Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-400">Escalas Inteligentes de Fins de Semana e Feriados</p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            onClick={downloadStandaloneHtmlFile}
            title="Baixar arquivo HTML único com todo o sistema pronto para usar offline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-blue-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar HTML Único</span>
          </button>

          <button
            onClick={onPrint}
            disabled={!hasSchedule}
            title="Imprimir visualização formatada da escala"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              hasSchedule
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={!hasSchedule}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition ${
              hasSchedule
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar Escala em PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};

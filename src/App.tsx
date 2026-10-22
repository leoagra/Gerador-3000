import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CollaboratorsTab } from './components/CollaboratorsTab';
import { HolidaysTab } from './components/HolidaysTab';
import { GeneratorTab } from './components/GeneratorTab';
import { ScheduleViewTab } from './components/ScheduleViewTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { ConfirmModal } from './components/ConfirmModal';
import { Collaborator, Holiday, FullSchedule } from './types';
import {
  loadCollaborators,
  saveCollaborators,
  loadHolidays,
  saveHolidays,
  loadSchedule,
  saveSchedule,
  resetAllDataToSample,
  SAMPLE_HOLIDAYS_2026_2027
} from './utils/storage';
import { generateSchedule } from './utils/scheduler';
import { exportScheduleToPDF } from './utils/pdfExport';
import {
  Users,
  Calendar,
  Zap,
  TableProperties,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'feriados' | 'gerador' | 'escala' | 'analytics'>('colaboradores');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [schedule, setSchedule] = useState<FullSchedule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedColabs = loadCollaborators();
    const savedHols = loadHolidays();
    const savedSched = loadSchedule();

    setCollaborators(savedColabs);
    setHolidays(savedHols);
    setSchedule(savedSched);

    // If schedule exists, open directly on the schedule tab
    if (savedSched && savedSched.months.length > 0) {
      setActiveTab('escala');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Collaborator Handlers
  const handleSaveCollaborator = (colab: Collaborator) => {
    const exists = collaborators.some(c => c.id === colab.id);
    const updated = exists
      ? collaborators.map(c => (c.id === colab.id ? colab : c))
      : [colab, ...collaborators];

    setCollaborators(updated);
    saveCollaborators(updated);
    showToast(exists ? 'Colaborador atualizado com sucesso!' : 'Novo colaborador cadastrado com sucesso!');
  };

  const handleDeleteCollaborator = (id: string) => {
    const updated = collaborators.filter(c => c.id !== id);
    setCollaborators(updated);
    saveCollaborators(updated);
    showToast('Colaborador removido.', 'info');
  };

  const handleLoadSampleData = () => {
    const { collaborators: sampleC } = resetAllDataToSample();
    setCollaborators(sampleC);
    showToast('Dados de exemplo com 8 promotores carregados com sucesso!', 'success');
  };

  // Holiday Handlers
  const handleSaveHoliday = (holiday: Holiday) => {
    const exists = holidays.some(h => h.id === holiday.id);
    const updated = exists
      ? holidays.map(h => (h.id === holiday.id ? holiday : h))
      : [...holidays, holiday];

    setHolidays(updated);
    saveHolidays(updated);
    showToast('Feriado salvo com sucesso!');
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = holidays.filter(h => h.id !== id);
    setHolidays(updated);
    saveHolidays(updated);
    showToast('Feriado removido.', 'info');
  };

  const handleLoadNationalHolidays = () => {
    setHolidays(SAMPLE_HOLIDAYS_2026_2027);
    saveHolidays(SAMPLE_HOLIDAYS_2026_2027);
    showToast('Feriados nacionais 2026/2027 carregados com sucesso!', 'success');
  };

  // Schedule Generation Handler
  const handleGenerateSchedule = (startYearMonth: string, durationMonths: number) => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const newSchedule = generateSchedule(collaborators, holidays, {
          startYearMonth,
          durationMonths
        });

        setSchedule(newSchedule);
        saveSchedule(newSchedule);
        setIsGenerating(false);
        setActiveTab('escala');
        showToast(
          `Escala de ${durationMonths} mês(es) gerada com sucesso! 100% das regras foram aplicadas.`,
          'success'
        );
      } catch (err: any) {
        setIsGenerating(false);
        showToast(err.message || 'Erro ao gerar escala.', 'error');
      }
    }, 400);
  };

  const handleUpdateSchedule = (updatedSchedule: FullSchedule) => {
    setSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    showToast('Alteração manual salva na escala com sucesso!');
  };

  const handleExportPdf = () => {
    if (!schedule) {
      showToast('Gere uma escala antes de exportar o PDF.', 'error');
      return;
    }
    try {
      exportScheduleToPDF(schedule, collaborators);
      showToast('Arquivo PDF gerado e iniciado o download com sucesso!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <Header
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        hasSchedule={!!schedule}
      />

      {/* Nav Tabs */}
      <nav className="bg-white border-b border-slate-200 px-6 no-print shadow-2xs sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab('colaboradores')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition ${
                activeTab === 'colaboradores'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Colaboradores</span>
              <span className="tabular-nums px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                {collaborators.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('feriados')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition ${
                activeTab === 'feriados'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Feriados</span>
              <span className="tabular-nums px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                {holidays.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gerador')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition ${
                activeTab === 'gerador'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Configurar & Gerar Escala</span>
            </button>

            <button
              onClick={() => setActiveTab('escala')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition ${
                activeTab === 'escala'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-4 h-4 text-blue-600" />
              <span>Visualizar Escala</span>
              {schedule && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {schedule.months.length} m
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Estatísticas & Equidade</span>
            </button>
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            title="Restaurar dados de exemplo"
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 px-2.5 rounded-md hover:bg-slate-100 transition whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1">
        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold max-w-md border transition transform animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200 shadow-red-900/10'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-blue-600 text-white border-blue-500 shadow-blue-900/20'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" />
            )}
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Collaborators */}
        {activeTab === 'colaboradores' && (
          <CollaboratorsTab
            collaborators={collaborators}
            onSaveCollaborator={handleSaveCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
            onLoadSampleData={handleLoadSampleData}
          />
        )}

        {/* Tab 2: Holidays */}
        {activeTab === 'feriados' && (
          <HolidaysTab
            holidays={holidays}
            onSaveHoliday={handleSaveHoliday}
            onDeleteHoliday={handleDeleteHoliday}
            onLoadNationalHolidays={handleLoadNationalHolidays}
          />
        )}

        {/* Tab 3: Generator */}
        {activeTab === 'gerador' && (
          <GeneratorTab
            collaborators={collaborators}
            holidays={holidays}
            onGenerate={handleGenerateSchedule}
            isGenerating={isGenerating}
            currentSchedule={schedule}
          />
        )}

        {/* Tab 4: Schedule View */}
        {activeTab === 'escala' && (
          <ScheduleViewTab
            schedule={schedule}
            collaborators={collaborators}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            onUpdateSchedule={handleUpdateSchedule}
            onGoToGenerator={() => setActiveTab('gerador')}
          />
        )}

        {/* Tab 5: Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsTab schedule={schedule} collaborators={collaborators} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span className="text-[11px] text-slate-400">
            Agramus Corporation - 2026
          </span>
        </div>
      </footer>

      {/* Confirm Reset Defaults Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Restaurar Dados Padrão?"
        message="Deseja redefinir os dados para os valores de exemplo padrão com 8 promotores brasileiros e feriados nacionais? A escala gerada atual será reiniciada."
        confirmLabel="Sim, Restaurar Padrão"
        cancelLabel="Cancelar"
        isDestructive={false}
        onConfirm={() => {
          const sample = resetAllDataToSample();
          setCollaborators(sample.collaborators);
          setHolidays(sample.holidays);
          setSchedule(null);
          showToast('Dados restaurados para os exemplos padrão.');
        }}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

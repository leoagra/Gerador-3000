import React, { useState } from 'react';
import { Holiday } from '../types';
import { getDayNamePt } from '../utils/dateHelpers';
import { Calendar, Plus, Trash2, Sparkles, Search, Flag } from 'lucide-react';
import { SAMPLE_HOLIDAYS_2026_2027 } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface HolidaysTabProps {
  holidays: Holiday[];
  onSaveHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
  onLoadNationalHolidays: () => void;
}

export const HolidaysTab: React.FC<HolidaysTabProps> = ({
  holidays,
  onSaveHoliday,
  onDeleteHoliday,
  onLoadNationalHolidays
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  // Form State
  const [date, setDate] = useState('2026-11-20');
  const [name, setName] = useState('');
  const [type, setType] = useState<'nacional' | 'estadual' | 'municipal' | 'facultativo'>('nacional');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setDate('2026-11-20');
    setName('');
    setType('nacional');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setFormError('Por favor informe a data do feriado.');
      return;
    }
    if (!name.trim()) {
      setFormError('Por favor informe o nome do feriado.');
      return;
    }

    const payload: Holiday = {
      id: `hol-${date}-${Date.now()}`,
      date,
      name: name.trim(),
      type
    };

    onSaveHoliday(payload);
    setIsModalOpen(false);
  };

  const filtered = holidays
    .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.date.includes(searchTerm))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <Flag className="w-4 h-4 text-blue-600" />
            <span>Feriados Nacionais e Locais</span>
          </h2>
          <p className="text-xs text-blue-800/80 mt-1 max-w-2xl">
            Em dias de feriado que caiam de segunda a sexta, <strong>exatamente 2 promotores trabalham</strong> enquanto os demais folgam. O sistema faz um rodízio justo para não sobrecarregar ninguém.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLoadNationalHolidays}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feriados Nacionais 2026/2027</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Feriado</span>
          </button>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar feriado por nome ou data..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} feriados cadastrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Dia da Semana</th>
                <th className="py-3 px-4">Nome do Feriado</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Impacto na Escala</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum feriado cadastrado. Clique em "Cadastrar Feriado" ou "Feriados Nacionais 2026/2027".
                  </td>
                </tr>
              ) : (
                filtered.map(h => {
                  const dayName = getDayNamePt(h.date);
                  const isWeekday = !dayName.startsWith('Sábado') && !dayName.startsWith('Domingo');

                  return (
                    <tr key={h.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-4 tabular-nums font-bold text-slate-900">
                        {h.date.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {dayName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-900">
                        {h.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {h.type || 'nacional'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isWeekday ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            Escala Especial: 2 Promotores
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Cai no Fim de Semana (integrado ao plantão)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setHolidayToDelete(h)}
                          title="Excluir feriado"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Cadastrar Novo Feriado</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data do Feriado *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Feriado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aniversário da Cidade / Tiradentes"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipo de Feriado
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                >
                  <option value="nacional">Nacional</option>
                  <option value="estadual">Estadual</option>
                  <option value="municipal">Municipal</option>
                  <option value="facultativo">Ponto Facultativo</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition"
                >
                  Adicionar Feriado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Holiday Modal */}
      <ConfirmModal
        isOpen={!!holidayToDelete}
        title="Excluir Feriado?"
        message={`Deseja remover o feriado "${holidayToDelete?.name}" (${holidayToDelete?.date})?`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (holidayToDelete) {
            onDeleteHoliday(holidayToDelete.id);
            setHolidayToDelete(null);
          }
        }}
        onClose={() => setHolidayToDelete(null)}
      />
    </div>
  );
};

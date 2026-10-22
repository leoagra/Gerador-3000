import React, { useState } from 'react';
import { Collaborator, Gender } from '../types';
import { isFridayNightWorker } from '../utils/scheduler';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';

import { ConfirmModal } from './ConfirmModal';

interface CollaboratorsTabProps {
  collaborators: Collaborator[];
  onSaveCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onLoadSampleData: () => void;
}

export const CollaboratorsTab: React.FC<CollaboratorsTabProps> = ({
  collaborators,
  onSaveCollaborator,
  onDeleteCollaborator,
  onLoadSampleData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<Collaborator | null>(null);
  const [colabToDelete, setColabToDelete] = useState<Collaborator | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Feminino');
  const [fridayEndTime, setFridayEndTime] = useState('18:00');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingColab(null);
    setName('');
    setGender('Feminino');
    setFridayEndTime('18:00');
    setPhone('');
    setNotes('');
    setActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collaborator) => {
    setEditingColab(c);
    setName(c.name);
    setGender(c.gender);
    setFridayEndTime(c.fridayEndTime);
    setPhone(c.phone || '');
    setNotes(c.notes || '');
    setActive(c.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor informe o nome completo.');
      return;
    }
    if (!fridayEndTime) {
      setFormError('Por favor selecione o horário de término na sexta-feira.');
      return;
    }

    const payload: Collaborator = {
      id: editingColab ? editingColab.id : `colab-${Date.now()}`,
      name: name.trim(),
      gender,
      fridayEndTime,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      active,
      createdAt: editingColab ? editingColab.createdAt : new Date().toISOString()
    };

    onSaveCollaborator(payload);
    setIsModalOpen(false);
  };

  const filtered = collaborators.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fridayEndTime.includes(searchTerm)
  );

  const activeCount = collaborators.filter(c => c.active).length;
  const satEligibleCount = collaborators.filter(c => c.active && !isFridayNightWorker(c.fridayEndTime)).length;
  const lateFridayCount = collaborators.filter(c => c.active && isFridayNightWorker(c.fridayEndTime)).length;

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Colaboradores</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{collaborators.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeCount} ativos para a escala</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aptos para Sábado</p>
            <p className="text-2xl font-bold text-blue-700 tabular-nums mt-1">{satEligibleCount}</p>
            <p className="text-[11px] text-blue-600/80 mt-0.5">Saída sexta antes das 20h (mín. 2)</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regra Sexta Noturna ({'≥'} 20h)</p>
            <p className="text-2xl font-bold text-amber-700 tabular-nums mt-1">{lateFridayCount}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Alocação estrita no Domingo</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar promotor(a) por nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
            title="Carregar 8 promotores brasileiros com horários pré-configurados"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carregar Dados de Exemplo</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Promotor</span>
          </button>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nome do Promotor(a)</th>
                <th className="py-3 px-4">Gênero</th>
                <th className="py-3 px-4">Término na Sexta-feira</th>
                <th className="py-3 px-4">Regra de Fim de Semana</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum colaborador encontrado. Clique em "Cadastrar Promotor" ou "Carregar Dados de Exemplo".
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const isLate = isFridayNightWorker(c.fridayEndTime);
                  return (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                        {c.notes && <div className="text-[11px] text-slate-400 mt-0.5">{c.notes}</div>}
                        {c.phone && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {c.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{c.gender}</td>
                      <td className="py-3 px-4 tabular-nums font-semibold text-slate-800">
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">
                          {c.fridayEndTime}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isLate ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Saída na sexta às {c.fridayEndTime} ({'≥'} 20h) · <strong>Apenas Domingo</strong></span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>Apto para Sábado ou Domingo</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {c.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            title="Editar colaborador"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setColabToDelete(c)}
                            title="Excluir colaborador"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingColab ? 'Editar Promotor(a)' : 'Cadastrar Novo Promotor(a)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
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
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva Castro"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gênero *
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Término na Sexta-feira *
                  </label>
                  <select
                    value={fridayEndTime}
                    onChange={e => setFridayEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs tabular-nums"
                  >
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00 (Regra Noturna)</option>
                    <option value="20:30">20:30 (Regra Noturna)</option>
                    <option value="21:00">21:00 (Regra Noturna)</option>
                    <option value="22:00">22:00 (Regra Noturna)</option>
                  </select>
                </div>
              </div>

              {/* Informative box on the Friday night rule */}
              {isFridayNightWorker(fridayEndTime) ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Regra de Descanso Ativada:</span> Como o término na sexta é às {fridayEndTime} (20h ou mais tarde), este colaborador não poderá ser escalado no Sábado de manhã. Ele só poderá ser alocado no Domingo.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Horário Padrão:</span> Término antes das 20h. O colaborador está apto para alocação no Sábado ou no Domingo.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Ativo
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={e => setActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-slate-700 font-semibold">Participa da Escala</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observações / Linha de Produtos (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Promotora da linha de perfumaria fina"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
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
                  {editingColab ? 'Salvar Alterações' : 'Cadastrar Promotor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!colabToDelete}
        title="Excluir Promotor(a)?"
        message={`Tem certeza que deseja remover "${colabToDelete?.name}" da equipe? O colaborador será excluído do sistema e não participará das próximas escalas.`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (colabToDelete) {
            onDeleteCollaborator(colabToDelete.id);
            setColabToDelete(null);
          }
        }}
        onClose={() => setColabToDelete(null)}
      />
    </div>
  );
};

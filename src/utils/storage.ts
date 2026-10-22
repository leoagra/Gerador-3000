import { Collaborator, Holiday, FullSchedule } from '../types';

export const SAMPLE_COLLABORATORS: Collaborator[] = [
  {
    id: 'colab-1',
    name: 'Ana Carolina Silveira',
    gender: 'Feminino',
    fridayEndTime: '17:00',
    phone: '(11) 98765-4321',
    active: true,
    notes: 'Promotora sênior - Linha Perfumaria',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'colab-2',
    name: 'Beatriz Martins Ramos',
    gender: 'Feminino',
    fridayEndTime: '18:00',
    phone: '(11) 97654-3210',
    active: true,
    notes: 'Promotora - Linha Higiene e Beleza',
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'colab-3',
    name: 'Carlos Eduardo Nogueira',
    gender: 'Masculino',
    fridayEndTime: '20:00', // >= 20h! Cannot work Saturday
    phone: '(11) 96543-2109',
    active: true,
    notes: 'Turno fechamento sexta (20h) -> Só pode Domingo',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'colab-4',
    name: 'Daniela Albuquerque',
    gender: 'Feminino',
    fridayEndTime: '17:30',
    phone: '(11) 95432-1098',
    active: true,
    notes: 'Promotora - Dermocosméticos',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'colab-5',
    name: 'Felipe Augusto Rocha',
    gender: 'Masculino',
    fridayEndTime: '21:00', // >= 20h! Cannot work Saturday
    phone: '(11) 94321-0987',
    active: true,
    notes: 'Turno noturno sexta (21h) -> Só pode Domingo',
    createdAt: '2026-02-05T10:00:00Z'
  },
  {
    id: 'colab-6',
    name: 'Gabriela Lima Santos',
    gender: 'Feminino',
    fridayEndTime: '18:00',
    phone: '(11) 93210-9876',
    active: true,
    notes: 'Promotora - Linha Alimentos e Bebidas',
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'colab-7',
    name: 'Lucas Vinicius Mendonça',
    gender: 'Masculino',
    fridayEndTime: '17:00',
    phone: '(11) 92109-8765',
    active: true,
    notes: 'Promotor - Eletro e Tecnologia',
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'colab-8',
    name: 'Mariana Duarte Costa',
    gender: 'Feminino',
    fridayEndTime: '20:30', // >= 20h! Cannot work Saturday
    phone: '(11) 91098-7654',
    active: true,
    notes: 'Turno estendido sexta (20h30) -> Só pode Domingo',
    createdAt: '2026-03-01T10:00:00Z'
  }
];

export const SAMPLE_HOLIDAYS_2026_2027: Holiday[] = [
  // 2026 Holidays
  { id: 'hol-2026-01-01', date: '2026-01-01', name: 'Confraternização Universal', type: 'nacional' },
  { id: 'hol-2026-02-17', date: '2026-02-17', name: 'Carnaval (Terça-feira)', type: 'facultativo' },
  { id: 'hol-2026-04-03', date: '2026-04-03', name: 'Sexta-feira Santa', type: 'nacional' },
  { id: 'hol-2026-04-21', date: '2026-04-21', name: 'Tiradentes', type: 'nacional' },
  { id: 'hol-2026-05-01', date: '2026-05-01', name: 'Dia do Trabalho', type: 'nacional' },
  { id: 'hol-2026-06-04', date: '2026-06-04', name: 'Corpus Christi', type: 'facultativo' },
  { id: 'hol-2026-09-07', date: '2026-09-07', name: 'Independência do Brasil', type: 'nacional' },
  { id: 'hol-2026-10-12', date: '2026-10-12', name: 'Nossa Senhora Aparecida', type: 'nacional' },
  { id: 'hol-2026-11-02', date: '2026-11-02', name: 'Finados', type: 'nacional' },
  { id: 'hol-2026-11-15', date: '2026-11-15', name: 'Proclamação da República', type: 'nacional' },
  { id: 'hol-2026-11-20', date: '2026-11-20', name: 'Dia da Consciência Negra', type: 'nacional' },
  { id: 'hol-2026-12-25', date: '2026-12-25', name: 'Natal', type: 'nacional' },

  // 2027 Holidays
  { id: 'hol-2027-01-01', date: '2027-01-01', name: 'Confraternização Universal 2027', type: 'nacional' },
  { id: 'hol-2027-02-09', date: '2027-02-09', name: 'Carnaval 2027', type: 'facultativo' },
  { id: 'hol-2027-03-26', date: '2027-03-26', name: 'Sexta-feira Santa 2027', type: 'nacional' },
  { id: 'hol-2027-04-21', date: '2027-04-21', name: 'Tiradentes 2027', type: 'nacional' },
  { id: 'hol-2027-05-01', date: '2027-05-01', name: 'Dia do Trabalho 2027', type: 'nacional' }
];

const STORAGE_KEYS = {
  COLLABORATORS: 'escalafacil_collaborators_v1',
  HOLIDAYS: 'escalafacil_holidays_v1',
  SCHEDULE: 'escalafacil_schedule_v1',
  APP_INIT: 'escalafacil_initialized_v1'
};

export function loadCollaborators(): Collaborator[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLABORATORS);
    if (!raw) {
      // First run: save sample data
      saveCollaborators(SAMPLE_COLLABORATORS);
      return SAMPLE_COLLABORATORS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading collaborators:', err);
    return SAMPLE_COLLABORATORS;
  }
}

export function saveCollaborators(list: Collaborator[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLABORATORS, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving collaborators:', err);
  }
}

export function loadHolidays(): Holiday[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!raw) {
      saveHolidays(SAMPLE_HOLIDAYS_2026_2027);
      return SAMPLE_HOLIDAYS_2026_2027;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading holidays:', err);
    return SAMPLE_HOLIDAYS_2026_2027;
  }
}

export function saveHolidays(list: Holiday[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving holidays:', err);
  }
}

export function loadSchedule(): FullSchedule | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading schedule:', err);
    return null;
  }
}

export function saveSchedule(schedule: FullSchedule | null): void {
  try {
    if (schedule) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    }
  } catch (err) {
    console.error('Error saving schedule:', err);
  }
}

export function resetAllDataToSample(): {
  collaborators: Collaborator[];
  holidays: Holiday[];
} {
  saveCollaborators(SAMPLE_COLLABORATORS);
  saveHolidays(SAMPLE_HOLIDAYS_2026_2027);
  saveSchedule(null);
  return {
    collaborators: SAMPLE_COLLABORATORS,
    holidays: SAMPLE_HOLIDAYS_2026_2027
  };
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.COLLABORATORS);
  localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
}

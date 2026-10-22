/**
 * Generates and downloads a 100% standalone single-file HTML version
 * containing HTML5, Tailwind CDN, Lucide icons, and Native JS
 * that can be opened on any computer without build tools.
 */

export function downloadStandaloneHtmlFile(): void {
  const standaloneHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EscalaFácil Promotores - Sistema de Escala de Trabalho</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fa',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              950: '#0f172a'
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>
  <style>
    .tabular-nums { font-variant-numeric: tabular-nums; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans">
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 sticky top-0 z-30 shadow-md">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-inner">
            EF
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-white">EscalaFácil Promotores</h1>
            <p class="text-xs text-blue-200">Fins de Semana e Feriados · Promotores(as) de Vendas</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.print()" class="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-100 rounded-lg border border-slate-700 transition">
            Imprimir
          </button>
          <button onclick="exportToPdf()" class="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition">
            Exportar em PDF
          </button>
        </div>
      </div>
    </header>

    <!-- Nav tabs -->
    <div class="bg-white border-b border-slate-200 px-6 no-print">
      <div class="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
        <button onclick="switchTab('colaboradores')" id="tab-btn-colaboradores" class="tab-btn px-4 py-2 text-sm font-semibold rounded-lg text-blue-700 bg-blue-50 border border-blue-200 transition">
          Colaboradores
        </button>
        <button onclick="switchTab('feriados')" id="tab-btn-feriados" class="tab-btn px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition">
          Feriados
        </button>
        <button onclick="switchTab('gerador')" id="tab-btn-gerador" class="tab-btn px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition">
          Configurar & Gerar Escala
        </button>
        <button onclick="switchTab('escala')" id="tab-btn-escala" class="tab-btn px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition">
          Visualizar Escala
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto w-full p-6 flex-1">
      <!-- Alerts -->
      <div id="global-alert" class="hidden mb-6 p-4 rounded-xl border"></div>

      <!-- Tab 1: Colaboradores -->
      <section id="tab-colaboradores" class="tab-content space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Cadastro de Colaboradores</h2>
            <p class="text-xs text-slate-500">Cadastre os promotores de vendas. Horários de saída na sexta >= 20h limitam o trabalho exclusivamente ao Domingo.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadSampleData()" class="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition">
              Carregar Dados de Exemplo
            </button>
            <button onclick="openColabModal()" class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition">
              + Novo Colaborador
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <tr>
                  <th class="py-3 px-4">Nome Completo</th>
                  <th class="py-3 px-4">Gênero</th>
                  <th class="py-3 px-4">Término na Sexta-feira</th>
                  <th class="py-3 px-4">Regra Noturna (Sexta >= 20h)</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="colab-table-body" class="divide-y divide-slate-100">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tab 2: Feriados -->
      <section id="tab-feriados" class="tab-content hidden space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Cadastro de Feriados</h2>
            <p class="text-xs text-slate-500">Em feriados de segunda a sexta, exatamente 2 pessoas são escaladas em rodízio justo.</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="loadSampleHolidays()" class="px-3.5 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition">
              Feriados Nacionais 2026/2027
            </button>
            <button onclick="openHolidayModal()" class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition">
              + Novo Feriado
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <tr>
                  <th class="py-3 px-4">Data</th>
                  <th class="py-3 px-4">Nome do Feriado</th>
                  <th class="py-3 px-4">Dia da Semana</th>
                  <th class="py-3 px-4">Tipo</th>
                  <th class="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody id="holiday-table-body" class="divide-y divide-slate-100">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tab 3: Configurar & Gerar Escala -->
      <section id="tab-gerador" class="tab-content hidden space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Gerador Automático de Escala</h2>
            <p class="text-sm text-slate-500 mt-1">Configure o período desejado e o motor inteligente alocará os promotores respeitando 100% das regras logísticas.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <div>
              <label class="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Mês Inicial</label>
              <input type="month" id="gen-start-month" value="2026-11" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Quantidade de Meses</label>
              <select id="gen-duration" class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="1">1 Mês</option>
                <option value="2">2 Meses</option>
                <option value="3" selected>3 Meses (Trimestre)</option>
                <option value="4">4 Meses</option>
                <option value="5">5 Meses</option>
                <option value="6">6 Meses (Semestre)</option>
              </select>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <h3 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Resumo das Regras de Negócio Aplicadas:</h3>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>4 pessoas por fim de semana:</strong> Exatamente 2 no Sábado e 2 no Domingo.</li>
              <li><strong>Proibição de 7 dias seguidos:</strong> Quem trabalha no Sábado folga no Domingo; quem trabalha no Domingo folga no Sábado. Ninguém faz ambos os dias.</li>
              <li><strong>Descanso pós-jornada noturna na sexta:</strong> Promotores com saída na sexta >= 20h só podem ser alocados no Domingo.</li>
              <li><strong>Rodízio justo & Folga de fim de semana:</strong> Pelo menos 1 fim de semana completo de folga por ciclo para todos os promotores.</li>
              <li><strong>Feriados em dias úteis:</strong> Exatamente 2 pessoas escaladas em rodízio equilibrado.</li>
            </ul>
          </div>

          <button onclick="handleGenerateSchedule()" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
            Gerar Escala Otimizada
          </button>
        </div>
      </section>

      <!-- Tab 4: Visualizar Escala -->
      <section id="tab-escala" class="tab-content hidden space-y-6">
        <div id="schedule-print-container" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Escala Gerada</h2>
              <p class="text-xs text-slate-500" id="schedule-subtitle">Visualize a distribuição por mês e semana.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition">
                Imprimir
              </button>
              <button onclick="exportToPdf()" class="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition">
                Exportar em PDF
              </button>
            </div>
          </div>

          <div id="schedule-months-container" class="space-y-8">
            <!-- Injected via JS -->
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 no-print">
      EscalaFácil Promotores · Sistema de Escala para Promotores(as) de Vendas
    </footer>
  </div>

  <script>
    // Inlined core logic for the standalone version
    const STORAGE_KEY_COLAB = 'standalone_colab_v1';
    const STORAGE_KEY_HOL = 'standalone_hol_v1';
    const STORAGE_KEY_SCHED = 'standalone_sched_v1';

    let collaborators = JSON.parse(localStorage.getItem(STORAGE_KEY_COLAB) || '[]');
    let holidays = JSON.parse(localStorage.getItem(STORAGE_KEY_HOL) || '[]');
    let schedule = JSON.parse(localStorage.getItem(STORAGE_KEY_SCHED) || 'null');

    const DEFAULT_COLABS = [
      { id: 'c1', name: 'Ana Carolina Silveira', gender: 'Feminino', fridayEndTime: '17:00', active: true },
      { id: 'c2', name: 'Beatriz Martins Ramos', gender: 'Feminino', fridayEndTime: '18:00', active: true },
      { id: 'c3', name: 'Carlos Eduardo Nogueira', gender: 'Masculino', fridayEndTime: '20:00', active: true },
      { id: 'c4', name: 'Daniela Albuquerque', gender: 'Feminino', fridayEndTime: '17:30', active: true },
      { id: 'c5', name: 'Felipe Augusto Rocha', gender: 'Masculino', fridayEndTime: '21:00', active: true },
      { id: 'c6', name: 'Gabriela Lima Santos', gender: 'Feminino', fridayEndTime: '18:00', active: true },
      { id: 'c7', name: 'Lucas Vinicius Mendonça', gender: 'Masculino', fridayEndTime: '17:00', active: true },
      { id: 'c8', name: 'Mariana Duarte Costa', gender: 'Feminino', fridayEndTime: '20:30', active: true }
    ];

    const DEFAULT_HOLIDAYS = [
      { id: 'h1', date: '2026-11-02', name: 'Finados', type: 'nacional' },
      { id: 'h2', date: '2026-11-15', name: 'Proclamação da República', type: 'nacional' },
      { id: 'h3', date: '2026-11-20', name: 'Dia da Consciência Negra', type: 'nacional' },
      { id: 'h4', date: '2026-12-25', name: 'Natal', type: 'nacional' },
      { id: 'h5', date: '2027-01-01', name: 'Confraternização Universal', type: 'nacional' }
    ];

    if (collaborators.length === 0) {
      collaborators = DEFAULT_COLABS;
      localStorage.setItem(STORAGE_KEY_COLAB, JSON.stringify(collaborators));
    }
    if (holidays.length === 0) {
      holidays = DEFAULT_HOLIDAYS;
      localStorage.setItem(STORAGE_KEY_HOL, JSON.stringify(holidays));
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-blue-700', 'bg-blue-50', 'border', 'border-blue-200');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100');
      });
      document.getElementById('tab-btn-' + tabId).classList.add('text-blue-700', 'bg-blue-50', 'border', 'border-blue-200');
      document.getElementById('tab-btn-' + tabId).classList.remove('text-slate-600', 'hover:bg-slate-100');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById('tab-' + tabId).classList.remove('hidden');
    }

    function renderColabs() {
      const tbody = document.getElementById('colab-table-body');
      tbody.innerHTML = '';
      collaborators.forEach(c => {
        const isLate = isFridayLate(c.fridayEndTime);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = \`
          <td class="py-3 px-4 font-semibold text-slate-800">\${c.name}</td>
          <td class="py-3 px-4 text-slate-600">\${c.gender}</td>
          <td class="py-3 px-4 tabular-nums text-slate-700">\${c.fridayEndTime}</td>
          <td class="py-3 px-4">
            \${isLate 
              ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Sexta >= 20h (Apenas Domingo)</span>' 
              : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Apto Sábado e Domingo</span>'}
          </td>
          <td class="py-3 px-4">
            <span class="text-xs font-bold \${c.active ? 'text-emerald-600' : 'text-slate-400'}">\${c.active ? 'Ativo' : 'Inativo'}</span>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteColab('\${c.id}')" class="text-xs text-red-600 hover:text-red-800 font-semibold">Excluir</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function renderHolidays() {
      const tbody = document.getElementById('holiday-table-body');
      tbody.innerHTML = '';
      holidays.forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = \`
          <td class="py-3 px-4 tabular-nums font-semibold text-slate-800">\${h.date}</td>
          <td class="py-3 px-4 text-slate-800">\${h.name}</td>
          <td class="py-3 px-4 text-slate-600">\${getDayName(h.date)}</td>
          <td class="py-3 px-4"><span class="capitalize text-xs text-slate-500">\${h.type || 'nacional'}</span></td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteHoliday('\${h.id}')" class="text-xs text-red-600 hover:text-red-800 font-semibold">Excluir</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function isFridayLate(timeStr) {
      if (!timeStr) return false;
      const parts = timeStr.split(':');
      const h = parseInt(parts[0], 10);
      return h >= 20;
    }

    function getDayName(dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d, 12);
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      return days[dt.getDay()];
    }

    function deleteColab(id) {
      collaborators = collaborators.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY_COLAB, JSON.stringify(collaborators));
      renderColabs();
    }

    function deleteHoliday(id) {
      holidays = holidays.filter(h => h.id !== id);
      localStorage.setItem(STORAGE_KEY_HOL, JSON.stringify(holidays));
      renderHolidays();
    }

    function loadSampleData() {
      collaborators = DEFAULT_COLABS;
      localStorage.setItem(STORAGE_KEY_COLAB, JSON.stringify(collaborators));
      renderColabs();
      showAlert('Dados de exemplo carregados com sucesso!', 'success');
    }

    function loadSampleHolidays() {
      holidays = DEFAULT_HOLIDAYS;
      localStorage.setItem(STORAGE_KEY_HOL, JSON.stringify(holidays));
      renderHolidays();
      showAlert('Feriados padrão carregados com sucesso!', 'success');
    }

    function showAlert(msg, type) {
      const el = document.getElementById('global-alert');
      el.className = 'mb-6 p-4 rounded-xl border text-sm ' + (type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-900 border-blue-200');
      el.innerHTML = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 5000);
    }

    function openColabModal() {
      const name = prompt('Nome completo do Promotor(a):');
      if (!name) return;
      const fridayTime = prompt('Horário de término na sexta-feira (ex: 17:00, 18:00, 20:00, 21:00):', '18:00');
      if (!fridayTime) return;
      const gender = prompt('Gênero (Feminino / Masculino / Outro):', 'Feminino') || 'Feminino';

      collaborators.push({
        id: 'c_' + Date.now(),
        name,
        gender,
        fridayEndTime: fridayTime,
        active: true
      });
      localStorage.setItem(STORAGE_KEY_COLAB, JSON.stringify(collaborators));
      renderColabs();
    }

    function openHolidayModal() {
      const date = prompt('Data do feriado (AAAA-MM-DD):', '2026-12-31');
      if (!date) return;
      const name = prompt('Nome do Feriado:', 'Feriado Local');
      if (!name) return;

      holidays.push({
        id: 'h_' + Date.now(),
        date,
        name,
        type: 'nacional'
      });
      localStorage.setItem(STORAGE_KEY_HOL, JSON.stringify(holidays));
      renderHolidays();
    }

    // Schedule Engine
    function handleGenerateSchedule() {
      const active = collaborators.filter(c => c.active);
      if (active.length < 4) {
        alert('É necessário ter pelo menos 4 promotores ativos para gerar a escala.');
        return;
      }

      const startMonthVal = document.getElementById('gen-start-month').value || '2026-11';
      const duration = parseInt(document.getElementById('gen-duration').value, 10) || 1;
      const [startYear, startMonth] = startMonthVal.split('-').map(Number);

      const holidayMap = {};
      holidays.forEach(h => { holidayMap[h.date] = h; });

      const months = [];
      const stats = {};
      active.forEach(c => {
        stats[c.id] = { sat: 0, sun: 0, total: 0, lastWk: -99 };
      });

      let globalWk = 0;

      for (let m = 0; m < duration; m++) {
        const curMIndex = (startMonth - 1 + m) % 12;
        const curY = startYear + Math.floor((startMonth - 1 + m) / 12);
        const daysInMonth = new Date(curY, curMIndex + 1, 0).getDate();
        const weekends = [];
        const weekdayHolidays = [];

        for (let d = 1; d <= daysInMonth; d++) {
          const dateObj = new Date(curY, curMIndex, d, 12);
          const dow = dateObj.getDay();
          const dStr = curY + '-' + String(curMIndex + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

          if (dow >= 1 && dow <= 5 && holidayMap[dStr]) {
            // Pick 2 promoters with lowest total
            const sorted = [...active].sort((a, b) => stats[a.id].total - stats[b.id].total);
            const p1 = sorted[0];
            const p2 = sorted[1];
            stats[p1.id].total++;
            stats[p2.id].total++;
            weekdayHolidays.push({
              date: dStr,
              name: holidayMap[dStr].name,
              promoters: [p1.name, p2.name]
            });
          }

          if (dow === 6) {
            const satStr = dStr;
            const sunObj = new Date(curY, curMIndex, d + 1, 12);
            const sunStr = curY + '-' + String(curMIndex + 1).padStart(2, '0') + '-' + String(d + 1).padStart(2, '0');

            // Pick 4
            const sortedByScore = [...active].sort((a, b) => {
              let scoreA = stats[a.id].total * 10;
              let scoreB = stats[b.id].total * 10;
              if (stats[a.id].lastWk === globalWk - 1) scoreA += 15;
              if (stats[b.id].lastWk === globalWk - 1) scoreB += 15;
              return scoreA - scoreB;
            });

            // Ensure 2 can work Sat
            const satCandidates = sortedByScore.filter(c => !isFridayLate(c.fridayEndTime));
            if (satCandidates.length < 2) {
              alert('Erro: Não há promotores suficientes aptos para o Sábado!');
              return;
            }

            const chosenSat = satCandidates.slice(0, 2);
            const satIds = new Set(chosenSat.map(c => c.id));
            const sunCandidates = sortedByScore.filter(c => !satIds.has(c.id));
            const chosenSun = sunCandidates.slice(0, 2);

            chosenSat.forEach(c => {
              stats[c.id].sat++;
              stats[c.id].total++;
              stats[c.id].lastWk = globalWk;
            });

            chosenSun.forEach(c => {
              stats[c.id].sun++;
              stats[c.id].total++;
              stats[c.id].lastWk = globalWk;
            });

            const assignedIds = new Set([...chosenSat.map(c => c.id), ...chosenSun.map(c => c.id)]);
            const offColabs = active.filter(c => !assignedIds.has(c.id)).map(c => c.name);

            weekends.push({
              week: weekends.length + 1,
              satDate: satStr,
              satNames: chosenSat.map(c => c.name),
              sunDate: sunStr,
              sunNames: chosenSun.map(c => c.name),
              offNames: offColabs
            });

            globalWk++;
          }
        }

        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        months.push({
          title: monthNames[curMIndex] + ' de ' + curY,
          weekends,
          weekdayHolidays
        });
      }

      schedule = { months };
      localStorage.setItem(STORAGE_KEY_SCHED, JSON.stringify(schedule));
      renderSchedule();
      switchTab('escala');
    }

    function renderSchedule() {
      const container = document.getElementById('schedule-months-container');
      container.innerHTML = '';
      if (!schedule || !schedule.months || schedule.months.length === 0) {
        container.innerHTML = '<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">Nenhuma escala gerada ainda. Acesse a aba "Configurar & Gerar Escala".</div>';
        return;
      }

      schedule.months.forEach(m => {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden';
        
        let wkHtml = '';
        m.weekends.forEach(w => {
          wkHtml += \`
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
              <td class="py-3 px-4 font-bold text-slate-900 text-center">Semana \${w.week}</td>
              <td class="py-3 px-4 tabular-nums text-slate-600 text-center">\${w.satDate}</td>
              <td class="py-3 px-4">
                <div class="space-y-1">
                  <span class="inline-block px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-md border border-blue-100">• \${w.satNames[0]}</span>
                  <span class="inline-block px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-md border border-blue-100">• \${w.satNames[1]}</span>
                </div>
              </td>
              <td class="py-3 px-4 tabular-nums text-slate-600 text-center">\${w.sunDate}</td>
              <td class="py-3 px-4">
                <div class="space-y-1">
                  <span class="inline-block px-2.5 py-1 bg-sky-50 text-sky-800 text-xs font-semibold rounded-md border border-sky-100">• \${w.sunNames[0]}</span>
                  <span class="inline-block px-2.5 py-1 bg-sky-50 text-sky-800 text-xs font-semibold rounded-md border border-sky-100">• \${w.sunNames[1]}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-500">
                \${w.offNames.length > 0 ? w.offNames.join(', ') : 'Todos escalados'}
              </td>
            </tr>
          \`;
        });

        let holHtml = '';
        if (m.weekdayHolidays && m.weekdayHolidays.length > 0) {
          holHtml = \`
            <div class="p-4 bg-sky-50 border-t border-sky-100">
              <h4 class="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">Feriados no Mês (2 Promotores em Rodízio):</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                \${m.weekdayHolidays.map(h => \`
                  <div class="bg-white p-2.5 rounded-lg border border-sky-200">
                    <span class="font-bold text-slate-900">\${h.date} - \${h.name}:</span>
                    <span class="text-blue-700 font-semibold ml-1">\${h.promoters.join(' e ')}</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        }

        div.innerHTML = \`
          <div class="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
            <h3 class="font-bold text-sm tracking-wide">\${m.title}</h3>
            <span class="text-xs text-blue-200 font-semibold">\${m.weekends.length} Fins de Semana</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">
                <tr>
                  <th class="py-3 px-4 text-center">Semana</th>
                  <th class="py-3 px-4 text-center">Sábado</th>
                  <th class="py-3 px-4">Escala Sábado (2 Pessoas)</th>
                  <th class="py-3 px-4 text-center">Domingo</th>
                  <th class="py-3 px-4">Escala Domingo (2 Pessoas)</th>
                  <th class="py-3 px-4">Folga Completa</th>
                </tr>
              </thead>
              <tbody>
                \${wkHtml}
              </tbody>
            </table>
          </div>
          \${holHtml}
        \`;
        container.appendChild(div);
      });
    }

    function exportToPdf() {
      const el = document.getElementById('schedule-print-container');
      if (window.html2pdf && el) {
        html2pdf().set({
          margin: 10,
          filename: 'escala_promotores.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        }).from(el).save();
      } else {
        window.print();
      }
    }

    // Init
    renderColabs();
    renderHolidays();
    if (schedule) renderSchedule();
  </script>
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'escala_promotores_standalone.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

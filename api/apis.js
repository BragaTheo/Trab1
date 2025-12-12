document.addEventListener('DOMContentLoaded', () => {
  fetchSwapi();
  fetchBrasilApi();
  fetchFipeMarcas();
});

/* SWAPI starwars luke skywalker */
async function fetchSwapi() {
  const content = document.getElementById('swapiContent');
  const errEl = document.getElementById('swapiError');
  content.textContent = 'Carregando SWAPI...';
  errEl.textContent = '';

  try {
    const resp = await fetch('https://swapi.dev/api/people/1/');
    if (!resp.ok) throw new Error(`SWAPI retornou status ${resp.status}`);
    const data = await resp.json();

    content.innerHTML = `
      <strong>Nome:</strong> ${escapeHtml(data.name)}<br/>
      <strong>Altura:</strong> ${escapeHtml(data.height)} cm<br/>
      <strong>Peso:</strong> ${escapeHtml(data.mass)} kg<br/>
      <strong>Nascimento:</strong> ${escapeHtml(data.birth_year)}<br/>
      <strong>Gênero:</strong> ${escapeHtml(data.gender)}
    `;
  } catch (err) {
    console.error('SWAPI error', err);
    content.textContent = '';
    errEl.textContent = 'Erro ao carregar dados do SWAPI.';
  }
}

/* BrasilAPI feriados */
async function fetchBrasilApi() {
  const content = document.getElementById('brasilContent');
  const errEl = document.getElementById('brasilError');
  content.textContent = 'Carregando feriados 2025...';
  errEl.textContent = '';

  try {
    const resp = await fetch('https://brasilapi.com.br/api/feriados/v1/2025');
    if (!resp.ok) throw new Error(`BrasilAPI retornou status ${resp.status}`);
    const data = await resp.json();

    // Mostra 6 primeiros feriados como exemplo
    const sample = data.slice(0, 6);
    if (sample.length === 0) {
      content.textContent = 'Nenhum feriado encontrado.';
      return;
    }

    const lines = sample.map(f => `${escapeHtml(f.date)} — ${escapeHtml(f.name)}`).join('<br/>');
    content.innerHTML = lines;
  } catch (err) {
    console.error('BrasilAPI error', err);
    content.textContent = '';
    errEl.textContent = 'Erro ao carregar dados da BrasilAPI.';
  }
}

/* FIPE marcas de carro */
async function fetchFipeMarcas() {
  const content = document.getElementById('fipeContent');
  const errEl = document.getElementById('fipeError');
  content.textContent = 'Carregando marcas FIPE...';
  errEl.textContent = '';

  try {
    // Endpoint público que espelha FIPE
    const resp = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
    if (!resp.ok) throw new Error(`FIPE retornou status ${resp.status}`);
    const data = await resp.json();

    // Mostra 8 primeiras marcas
    const sample = data.slice(0, 8);
    if (sample.length === 0) {
      content.textContent = 'Nenhuma marca encontrada.';
      return;
    }

    const lines = sample.map(m => `${escapeHtml(m.codigo)} — ${escapeHtml(m.nome)}`).join('<br/>');
    content.innerHTML = lines;
  } catch (err) {
    console.error('FIPE error', err);
    content.textContent = '';
    errEl.textContent = 'Erro ao carregar dados da FIPE.';
  }
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

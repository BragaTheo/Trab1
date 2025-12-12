document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('nameForm');
  const nameInput = document.getElementById('nameInput');
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  function showError(message) {
    errorEl.textContent = message;
    resultEl.textContent = '';
  }

  function showResult(data) {
    errorEl.textContent = '';
    resultEl.innerHTML = `
      <strong>Nome:</strong> ${escapeHtml(data.name)}<br/>
      <strong>Idade estimada:</strong> ${data.age ?? 'Não disponível'}<br/>
      <strong>Contagem de registros:</strong> ${data.count ?? 'N/A'}
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const name = nameInput.value.trim();
    if (name.length < 2) {
      showError('Por favor, informe um nome com pelo menos 2 caracteres.');
      nameInput.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Carregando...';
    resultEl.textContent = 'Aguardando resposta da API...';
    errorEl.textContent = '';

    const url = `https://api.agify.io?name=${encodeURIComponent(name)}`;

    try {
      const resp = await fetch(url, { method: 'GET' });
      if (!resp.ok) {
        let text = await resp.text();
        throw new Error(`Erro na API (status ${resp.status}): ${text || resp.statusText}`);
      }
      const data = await resp.json();
      showResult(data);
    } catch (err) {
      console.error(err);
      showError('Não foi possível obter a previsão de idade. Verifique sua conexão e tente novamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Prever idade';
    }
  });

  clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    resultEl.textContent = '';
    errorEl.textContent = '';
    nameInput.focus();
  });
});

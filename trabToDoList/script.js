const STORAGE_KEY = 'evento_tasks_v1';

class Task {
  constructor({ id, title, responsible, startDate, endDate, priority, notes, done }) {
    this.id = id ?? Task.newId();
    this.title = title ?? '';
    this.responsible = responsible ?? '';
    this.startDate = startDate ?? '';
    this.endDate = endDate ?? '';
    this.priority = priority ?? 'Média';
    this.notes = notes ?? '';
    this.done = !!done;
    this.createdAt = new Date().toISOString();
  }

  static newId() {
    return 't' + Math.random().toString(36).slice(2, 9);
  }
}


const state = {
  tasks: []
};


const taskForm = document.getElementById('taskForm');
const taskIdInput = document.getElementById('taskId');
const titleInput = document.getElementById('title');
const responsibleInput = document.getElementById('responsible');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const priorityInput = document.getElementById('priority');
const notesInput = document.getElementById('notes');
const doneInput = document.getElementById('done');

const saveTaskBtn = document.getElementById('saveTaskBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const saveAllBtn = document.getElementById('saveAllBtn');
const loadAllBtn = document.getElementById('loadAllBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');

const taskList = document.getElementById('taskList');
const filterTodo = document.getElementById('filterTodo');
const filterDone = document.getElementById('filterDone');
const filterAll = document.getElementById('filterAll');

let activeFilter = 'todo'; 


document.addEventListener('DOMContentLoaded', () => {
  attachListeners();
  renderList();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
  }
});

function attachListeners() {
  taskForm.addEventListener('submit', onSubmitTask);
  resetFormBtn.addEventListener('click', resetForm);
  saveAllBtn.addEventListener('click', saveToStorage);
  loadAllBtn.addEventListener('click', loadFromStorage);
  clearStorageBtn.addEventListener('click', clearStorageAndState);

  filterTodo.addEventListener('click', () => setFilter('todo'));
  filterDone.addEventListener('click', () => setFilter('done'));
  filterAll.addEventListener('click', () => setFilter('all'));

  startDateInput.addEventListener('change', validateDates);
  endDateInput.addEventListener('change', validateDates);
  titleInput.addEventListener('input', () => toggleValidity(titleInput));
  responsibleInput.addEventListener('input', () => toggleValidity(responsibleInput));
  priorityInput.addEventListener('change', () => toggleValidity(priorityInput));
}

function onSubmitTask(ev) {
  ev.preventDefault();
  if (!validateForm()) return;

  const id = taskIdInput.value || undefined;
  const taskData = {
    id,
    title: titleInput.value.trim(),
    responsible: responsibleInput.value.trim(),
    startDate: startDateInput.value,
    endDate: endDateInput.value || '',
    priority: priorityInput.value,
    notes: notesInput.value.trim(),
    done: doneInput.checked
  };

  if (id) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      state.tasks[idx] = Object.assign(new Task({}), state.tasks[idx], taskData);
    }
  } else {
    const t = new Task(taskData);
    state.tasks.push(t);
  }

  resetForm();
  renderList();
  flashMessage('Tarefa salva localmente.', 'success');
}

function validateForm() {
  let valid = true;
  if (!titleInput.value.trim() || titleInput.value.trim().length > 80) {
    titleInput.classList.add('is-invalid');
    valid = false;
  } else titleInput.classList.remove('is-invalid');

  if (!responsibleInput.value.trim()) {
    responsibleInput.classList.add('is-invalid');
    valid = false;
  } else responsibleInput.classList.remove('is-invalid');

  if (!startDateInput.value) {
    startDateInput.classList.add('is-invalid');
    valid = false;
  } else startDateInput.classList.remove('is-invalid');

  if (!priorityInput.value) {
    priorityInput.classList.add('is-invalid');
    valid = false;
  } else priorityInput.classList.remove('is-invalid');

  if (endDateInput.value && startDateInput.value && endDateInput.value < startDateInput.value) {
    endDateInput.classList.add('is-invalid');
    valid = false;
  } else endDateInput.classList.remove('is-invalid');

  return valid;
}

function validateDates() {
  if (endDateInput.value && startDateInput.value && endDateInput.value < startDateInput.value) {
    endDateInput.classList.add('is-invalid');
  } else {
    endDateInput.classList.remove('is-invalid');
  }
}

function toggleValidity(el) {
  if (el.value && el.value.trim() !== '') el.classList.remove('is-invalid');
}

function resetForm() {
  taskForm.reset();
  taskIdInput.value = '';
  [...taskForm.querySelectorAll('.is-invalid')].forEach(x => x.classList.remove('is-invalid'));
}

function renderList() {
  taskList.innerHTML = '';
  const tasksToShow = state.tasks.filter(t => {
    if (activeFilter === 'todo') return !t.done;
    if (activeFilter === 'done') return t.done;
    return true;
  }).sort((a,b) => {
    const order = { 'Crítica':0, 'Alta':1, 'Média':2, 'Baixa':3 };
    if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
    return (a.startDate || '').localeCompare(b.startDate || '');
  });

  if (tasksToShow.length === 0) {
    taskList.innerHTML = `<div class="col-12"><div class="alert alert-light py-3">Nenhuma tarefa encontrada para esse filtro.</div></div>`;
    return;
  }

  for (const t of tasksToShow) {
    const col = document.createElement('div');
    col.className = 'col-12';

    const card = document.createElement('div');
    card.className = 'card task-card shadow-sm';
    card.setAttribute('data-id', t.id);

    const body = document.createElement('div');
    body.className = 'card-body d-flex gap-3 align-items-start';

    const left = document.createElement('div');
    left.style.flex = '1';

    const titleRow = document.createElement('div');
    titleRow.className = 'd-flex align-items-start justify-content-between';

    const titleEl = document.createElement('h3');
    titleEl.className = 'h6 mb-1';
    titleEl.textContent = t.title + (t.done ? ' (Concluída)' : '');

    const badge = document.createElement('span');
    badge.className = `priority-badge p-${t.priority.replace(' ', '')}`;
    badge.textContent = t.priority;

    titleRow.appendChild(titleEl);
    titleRow.appendChild(badge);

    const meta = document.createElement('div');
    meta.className = 'small text-muted mb-2';
    meta.innerHTML = `<strong>Responsável:</strong> ${escapeHtml(t.responsible)} &nbsp; • &nbsp; <strong>Início:</strong> ${t.startDate || '—'} &nbsp; • &nbsp; <strong>Fim:</strong> ${t.endDate || '—'}`;

    const notes = document.createElement('div');
    notes.className = 'small-note';
    notes.textContent = t.notes || '';

    left.appendChild(titleRow);
    left.appendChild(meta);
    left.appendChild(notes);

    const actions = document.createElement('div');
    actions.className = 'd-flex flex-column align-items-end gap-2 ms-2';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-primary';
    editBtn.type = 'button';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => loadTaskIntoForm(t.id));

    const toggleDoneBtn = document.createElement('button');
    toggleDoneBtn.className = t.done ? 'btn btn-sm btn-success' : 'btn btn-sm btn-outline-success';
    toggleDoneBtn.type = 'button';
    toggleDoneBtn.textContent = t.done ? 'Marcada' : 'Marcar como concluída';
    toggleDoneBtn.addEventListener('click', () => toggleDone(t.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Excluir';
    deleteBtn.title = 'Excluir permanentemente';
    deleteBtn.addEventListener('click', () => deleteTask(t.id));

    actions.appendChild(editBtn);
    actions.appendChild(toggleDoneBtn);
    actions.appendChild(deleteBtn);

    body.appendChild(left);
    body.appendChild(actions);
    card.appendChild(body);
    col.appendChild(card);
    taskList.appendChild(col);
  }
}

function loadTaskIntoForm(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  taskIdInput.value = t.id;
  titleInput.value = t.title;
  responsibleInput.value = t.responsible;
  startDateInput.value = t.startDate;
  endDateInput.value = t.endDate;
  priorityInput.value = t.priority;
  notesInput.value = t.notes;
  doneInput.checked = !!t.done;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDone(id) {
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx < 0) return;
  state.tasks[idx].done = !state.tasks[idx].done;
  renderList();
  flashMessage(state.tasks[idx].done ? 'Tarefa marcada como concluída.' : 'Tarefa marcada como pendente.', 'info');
}

function deleteTask(id) {
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx < 0) return;
  state.tasks.splice(idx, 1);
  renderList();
  flashMessage('Tarefa excluída permanentemente.', 'warning');
}

function setFilter(mode) {
  activeFilter = mode;
  [filterTodo, filterDone, filterAll].forEach(b => b.classList.remove('active'));
  if (mode === 'todo') filterTodo.classList.add('active');
  if (mode === 'done') filterDone.classList.add('active');
  if (mode === 'all') filterAll.classList.add('active');
  renderList();
}

function saveToStorage() {
  try {
    const payload = JSON.stringify(state.tasks);
    localStorage.setItem(STORAGE_KEY, payload);
    flashMessage('Dados gravados no localStorage.', 'success');
  } catch (err) {
    console.error('Erro ao gravar localStorage', err);
    flashMessage('Erro ao gravar no localStorage.', 'danger');
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      flashMessage('Nenhum dado encontrado no localStorage.', 'secondary');
      return;
    }
    const arr = JSON.parse(raw);
    state.tasks = arr.map(a => new Task(a));
    renderList();
    flashMessage('Dados recuperados do localStorage.', 'success');
  } catch (err) {
    console.error('Erro ao recuperar localStorage', err);
    flashMessage('Erro ao recuperar dados do localStorage.', 'danger');
  }
}

function clearStorageAndState() {
  localStorage.removeItem(STORAGE_KEY);
  state.tasks = [];
  renderList();
  resetForm();
  flashMessage('LocalStorage limpo e estado do app resetado.', 'warning');
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`]/g, s => {
    return {
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#x60;'
    }[s];
  });
}

function flashMessage(text, type='info') {
  const container = document.createElement('div');
  container.className = `position-fixed top-0 end-0 m-3`;
  container.style.zIndex = 1080;
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} py-2 px-3 shadow-sm`;
  alert.style.minWidth = '220px';
  alert.textContent = text;
  container.appendChild(alert);
  document.body.appendChild(container);
  setTimeout(() => {
    alert.style.transition = 'opacity .35s';
    alert.style.opacity = '0';
  }, 1500);
  setTimeout(() => document.body.removeChild(container), 2000);
}

window.addEventListener('error', function (e) {
  console.error('Runtime error caught:', e.message, 'at', e.filename + ':' + e.lineno);
});

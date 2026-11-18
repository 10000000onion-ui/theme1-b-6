const KEY = 'memos';
const load = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const save = (memos) => localStorage.setItem(KEY, JSON.stringify(memos));

function render() {
  const list = document.getElementById('list');
  list.innerHTML = '';
  load().forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.title}：${m.body}`; // textContentにするとXSS対策になる
    list.appendChild(li);
  });
}

document.getElementById('add').addEventListener('click', () => {
  const title = document.getElementById('title').value.trim();
  const body = document.getElementById('body').value.trim();
  if (!title) return;
  const memos = load();
  memos.push({ id: Date.now(), title, body, createdAt: new Date().toISOString() });
  save(memos);
  render();
});

render();
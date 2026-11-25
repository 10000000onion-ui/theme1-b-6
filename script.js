const KEY = 'memos';

// ---- 保存・読み込み（ブラウザの localStorage を使う）----
function loadMemos() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveMemos() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memos));
  } catch (e) {
    // 保存できない環境でも画面は動かす
  }
}

let memos = loadMemos();

// 最初だけサンプルを入れる（不要なら消してOK）
if (memos.length === 0) {
  memos = [
    { id: 1, title: 'レジ締めの手順', tag: 'レジ', body: '売上を集計して、現金とレシートを照合。差異があれば店長へ報告。', createdAt: '2026-11-10' },
    { id: 2, title: '取り寄せ本の連絡方法', tag: '接客', body: '入荷したらお客様へ電話。つながらなければ翌日もう一度かける。', createdAt: '2026-11-12' }
  ];
  saveMemos();
}

const openIds = new Set(); // 今開いているメモのID
const $ = (id) => document.getElementById(id);

// ---- 表示 ----
function render() {
  const q = $('search').value.trim().toLowerCase();
  const list = $('list');
  list.innerHTML = '';

  const shown = memos.filter((m) =>
    (m.title + m.body + m.tag).toLowerCase().includes(q)
  );

  if (shown.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'メモがありません。';
    list.appendChild(p);
    return;
  }

  shown.forEach((m) => {
    const item = document.createElement('div');
    item.className = 'memo-item' + (openIds.has(m.id) ? ' open' : '');

    // タイトル行（ここを押すと開閉）
    const head = document.createElement('button');
    head.className = 'memo-head';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▶';

    const title = document.createElement('span');
    title.className = 'memo-title';
    title.textContent = m.title; // textContent を使うとXSS対策になる

    head.appendChild(arrow);
    head.appendChild(title);

    if (m.tag) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = m.tag;
      head.appendChild(tag);
    }

    head.addEventListener('click', () => {
      if (openIds.has(m.id)) openIds.delete(m.id);
      else openIds.add(m.id);
      item.classList.toggle('open');
    });

    // 内容部分
    const body = document.createElement('div');
    body.className = 'memo-body';

    const p = document.createElement('p');
    p.textContent = m.body;

    const meta = document.createElement('div');
    meta.className = 'memo-meta';

    const date = document.createElement('span');
    date.textContent = m.createdAt;

    const del = document.createElement('button');
    del.className = 'btn-delete';
    del.textContent = '削除';
    del.addEventListener('click', () => {
      if (!confirm('このメモを削除しますか？')) return;
      memos = memos.filter((x) => x.id !== m.id);
      openIds.delete(m.id);
      saveMemos();
      render();
    });

    meta.appendChild(date);
    meta.appendChild(del);
    body.appendChild(p);
    body.appendChild(meta);

    item.appendChild(head);
    item.appendChild(body);
    list.appendChild(item);
  });
}

// ---- 追加 ----
$('add').addEventListener('click', () => {
  const title = $('title').value.trim();
  const body = $('body').value.trim();

  if (!title) {
    $('err').textContent = 'タイトルを入力してね';
    return;
  }

  memos.unshift({
    id: Date.now(),
    title,
    body,
    tag: $('tag').value.trim(),
    createdAt: new Date().toISOString().slice(0, 10)
  });

  saveMemos();

  $('title').value = '';
  $('tag').value = '';
  $('body').value = '';
  $('err').textContent = '';
  render();
});

$('title').addEventListener('input', () => { $('err').textContent = ''; });
$('search').addEventListener('input', render);

render();

// =============================
// ---- お買い物リスト ----
// =============================
const ITEM_KEY = 'shoppingItems';
const itemInput = $('item-input');
const addButton = $('add-button');
const itemList = $('item-list');

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveItems() {
  try {
    localStorage.setItem(ITEM_KEY, JSON.stringify(items));
  } catch (e) {
    // 保存できない環境でも画面は動かす
  }
}

let items = loadItems();

// 一覧を描き直す
function renderItems() {
  itemList.innerHTML = '';

  items.forEach((it) => {
    const li = document.createElement('li');
    li.className = 'shop-item';

    const name = document.createElement('span');
    name.textContent = it.name; // textContent でXSS対策

    const del = document.createElement('button');
    del.className = 'btn-delete';
    del.textContent = '削除';
    del.addEventListener('click', () => {
      items = items.filter((x) => x.id !== it.id);
      saveItems();
      renderItems();
    });

    li.appendChild(name);
    li.appendChild(del);
    itemList.appendChild(li);
  });
}

// 登録処理
function addItem() {
  const name = itemInput.value.trim();
  if (!name) return; // 空なら何もしない

  items.push({ id: Date.now(), name });
  saveItems();
  renderItems();

  itemInput.value = '';
  itemInput.focus();
}

addButton.addEventListener('click', addItem);

// Enterキーでも登録（日本語変換の確定Enterは除外）
itemInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) addItem();
});

renderItems();
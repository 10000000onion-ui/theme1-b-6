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

// ---- いいね ----
// 指定したメモのいいねを+1して保存し、新しい回数を返す
function likeMemo(id) {
  const memo = memos.find((x) => x.id === id);
  if (!memo) return 0;
  memo.likes = (memo.likes || 0) + 1; // 昔のメモは likes が無いので0扱い
  saveMemos();
  return memo.likes;
}

// ---- 表示 ----
function render() {
  const q = $('search').value.trim().toLowerCase();
  const list = $('list');
  list.innerHTML = '';

  const shown = memos
    .filter((m) => (m.title + m.body + m.tag).toLowerCase().includes(q))
    // いいねが多い順。同じ数なら元の並び順のまま（sortは安定ソート）
    .sort((a, b) => (b.likes || 0) - (a.likes || 0));

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

    // タイトル行にいいね数を表示（閉じていても見える）
    const likeCount = document.createElement('span');
    likeCount.className = 'like-count';
    likeCount.textContent = '♥ ' + (m.likes || 0);
    head.appendChild(likeCount);

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

    // いいねボタン（何回でも押せる）
    const like = document.createElement('button');
    like.className = 'btn-like';
    like.textContent = '♥ わかりやすい！';
    like.addEventListener('click', () => {
      const count = likeMemo(m.id); // 戻り値で新しい回数を受け取る
      likeCount.textContent = '♥ ' + count;
      render(); // 並び順を更新
    });

    const actions = document.createElement('div');
    actions.appendChild(like);
    actions.appendChild(del);

    meta.appendChild(date);
    meta.appendChild(actions);
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
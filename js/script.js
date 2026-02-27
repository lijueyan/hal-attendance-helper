const KEY = "attendance_light_v1";
function band(rate) {
  if (rate < 50) return "LT50";
  if (rate < 80) return "LT80";
  if (rate < 85) return "LT85";
  if (rate < 90) return "LT90";
  return "OK";
}
function bandText(b) {
  switch (b) {
    case "LT50":
      return "🚨 50%以下：残念ですが、科目留年決定です…";
    case "LT80":
      return "⚠ 80%以下：科目未認定になりました…補講にちゃんと出席しなさい！";
    case "LT85":
      return "⚠ 危ない！";
    case "LT90":
      return "リマインド：90%以下になりました。";
    default:
      return "セーフ";
  }
}
function bandClass(b) {
  switch (b) {
    case "LT50":
    case "LT80":
      return "danger";
    case "LT85":
    case "LT90":
      return "warn";
    default:
      return "safe";
  }
}
function calc(course) {
  const total = Math.max(0, Number(course.total) || 0);
  const absent = Math.max(0, Number(course.absent) || 0);
  const late = Math.max(0, Number(course.late) || 0);
  const lateAsAbs = Math.floor(late / 3);
  const totalAbs = absent + lateAsAbs;
  const attended = Math.max(0, total - totalAbs);
  const rate = total > 0 ? (attended / total) * 100 : 0;
  const needAttend80 = Math.ceil(0.8 * total);
  const maxAbsTotal = Math.max(0, total - needAttend80);
  const remainAbs = Math.max(0, maxAbsTotal - totalAbs);
  const remainLate = remainAbs * 3;
  return { total, absent, late, lateAsAbs, totalAbs, attended, rate, remainAbs, remainLate };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
let state = load();
if (state.length === 0) {
  state = [{ name: "科目１", total: 0, absent: 0, late: 0, lastBand: "OK" }];
  save(state);
}
const list = document.getElementById("list");
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}
function maybeNotify(course, newRate) {
  const newBand = band(newRate);
  const oldBand = course.lastBand || "OK";
  if (newBand !== oldBand) {
    // 危険度の順（右ほど危険）
    const order = ["OK", "LT90", "LT85", "LT80", "LT50"];
    if (order.indexOf(newBand) > order.indexOf(oldBand)) {
      toast(`${course.name}：${bandText(newBand)}`);
    }
    course.lastBand = newBand;
  }
}
/**
* 安全にテキストを HTML に埋め込む（属性破壊を防ぐ）
*/
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
/**
* 1枚のカード HTML を作る
*/
function cardTemplate(c, idx) {
  const r = calc(c);
  const b = band(r.rate);
  // name は attribute を壊さないようエスケープ
  const safeName = escapeHtml(c.name ?? "");
  return `
<div class="row">
<div class="col">
<div class="label">科目名</div>
<input value="${safeName}" data-i="${idx}" data-k="name" />
</div>
</div>
<div class="row">
<div class="col small">
<div class="label">総単元数</div>
<input type="number" value="${r.total}" data-i="${idx}" data-k="total" inputmode="numeric" />
</div>
<div class="col small">
<div class="label">欠席</div>
<input type="number" value="${r.absent}" data-i="${idx}" data-k="absent" inputmode="numeric" />
</div>
<div class="col small">
<div class="label">遅刻</div>
<input type="number" value="${r.late}" data-i="${idx}" data-k="late" inputmode="numeric" />
</div>
</div>
<div class="meta">
<div>
<div class="rate js-rate">${r.rate.toFixed(1)}%</div>
<div class="sub js-totalAbs">総欠席数：${r.totalAbs}</div>
</div>
<div class="pill js-pill ${bandClass(b)}">${bandText(b)}</div>
</div>
<div class="sub js-remain">
     80%を保つには：あと ${r.remainAbs} 回欠席可能
</div>
<div class="actions">
<button class="btn-del" data-del="${idx}">科目を削除</button>
</div>
 `;
}
/**
* 全体描画（追加・削除・初回ロード時だけ呼ぶ）
*/
function render() {
  list.innerHTML = "";
  state.forEach((c, idx) => {
    // 途中から古いデータが来たとき用の補正
    if (typeof c.lastBand !== "string") c.lastBand = "OK";
    if (typeof c.name !== "string") c.name = String(c.name ?? "");
    const card = document.createElement("div");
    card.className = "course";
    card.dataset.i = String(idx);
    card.innerHTML = cardTemplate(c, idx);
    list.appendChild(card);
  });
}
/**
* 入力中はこの関数で「そのカードだけ」表示更新する
* （input を作り直さないのでフォーカスが消えない）
*/
function updateCard(idx) {
  const card = list.querySelector(`.course[data-i="${idx}"]`);
  if (!card) return;
  const c = state[idx];
  if (!c) return;
  const r = calc(c);
  const b = band(r.rate);
  const rateEl = card.querySelector(".js-rate");
  const totalAbsEl = card.querySelector(".js-totalAbs");
  const remainEl = card.querySelector(".js-remain");
  const pillEl = card.querySelector(".js-pill");
  if (rateEl) rateEl.textContent = `${r.rate.toFixed(1)}%`;
  if (totalAbsEl) totalAbsEl.textContent = `総欠席数：${r.totalAbs}`;
  if (remainEl) remainEl.textContent = `80%を保つには：あと ${r.remainAbs} 回欠席可能`;
  if (pillEl) {
    pillEl.textContent = bandText(b);
    pillEl.classList.remove("danger", "warn", "safe");
    pillEl.classList.add(bandClass(b));
  }
}
/**
* 入力ハンドラ
* - state 更新
* - 警告トースト
* - localStorage 保存
* - 表示は updateCard だけ
*/
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || !t.dataset) return;
  if (t.dataset.i === undefined || t.dataset.k === undefined) return;
  const idx = Number(t.dataset.i);
  const key = t.dataset.k;
  if (!state[idx]) return;
  if (key === "name") {
    state[idx][key] = t.value;
  } else {
    // number系
    state[idx][key] = Number(t.value) || 0;
  }
  const r = calc(state[idx]);
  maybeNotify(state[idx], r.rate);
  save(state);
  updateCard(idx);
});
/**
* クリック（追加・削除）
*/
document.addEventListener("click", (e) => {
  const target = e.target;
  // 追加
  if (target && target.id === "addBtn") {
    state.push({
      name: `科目${state.length + 1}`,
      total: 0,
      absent: 0,
      late: 0,
      lastBand: "OK",
    });
    save(state);
    render();
    // 追加直後、科目名をすぐ編集できるようにフォーカス
    const newIdx = state.length - 1;
    const input = list.querySelector(`input[data-i="${newIdx}"][data-k="name"]`);
    if (input) {
      input.focus();
      input.select();
    }
    return;
  }
  // 削除
  if (target && target.dataset && target.dataset.del !== undefined) {
    const idx = Number(target.dataset.del);
    state.splice(idx, 1);
    save(state);
    render();
  }
});
// 初回描画
render();
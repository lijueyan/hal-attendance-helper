const KEY = "attendance_light_v1";

function band(rate){

  if (rate < 50) return "LT50";

  if (rate < 80) return "LT80";

  if (rate < 85) return "LT85";

  if (rate < 90) return "LT90";

  return "OK";

}

function bandText(b){

  switch(b){

    case "LT50": return "🚨 50%以下：残念ですが、科目留年決定です…";

    case "LT80": return "⚠ 80%以下：科目未認定になりました…補講にちゃんと出席しなさい！";

    case "LT85": return "⚠ 危ない！";

    case "LT90": return "リマインド：90%以下になりました。";

    default: return "セーフ";

  }

}

function bandClass(b){

  switch(b){

    case "LT50":

    case "LT80": return "danger";

    case "LT85":

    case "LT90": return "warn";

    default: return "safe";

  }

}

function calc(course){

  const total = Math.max(0, Number(course.total)||0);

  const absent = Math.max(0, Number(course.absent)||0);

  const late = Math.max(0, Number(course.late)||0);

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

function load(){

  try{

    const raw = localStorage.getItem(KEY);

    if(!raw) return [];

    return JSON.parse(raw);

  }catch{ return []; }

}

function save(){

  localStorage.setItem(KEY, JSON.stringify(state));

}

let state = load();

if(state.length === 0){

  state = [{ name:"科目１", total:0, absent:0, late:0, lastBand:"OK" }];

  save();

}

const list = document.getElementById("list");

const toastEl = document.getElementById("toast");

function toast(msg){

  toastEl.textContent = msg;

  toastEl.classList.add("show");

  setTimeout(()=>toastEl.classList.remove("show"), 2000);

}

function maybeNotify(course, newRate){

  const newBand = band(newRate);

  const oldBand = course.lastBand || "OK";

  if(newBand !== oldBand){

    const order = ["OK","LT90","LT85","LT80","LT50"];

    if(order.indexOf(newBand) > order.indexOf(oldBand)){

      toast(`${course.name}：${bandText(newBand)}`);

    }

    course.lastBand = newBand;

  }

}

function render(){

  list.innerHTML = "";

  state.forEach((c, idx)=>{

    const r = calc(c);

    const b = band(r.rate);

    const card = document.createElement("div");

    card.className = "course";

    card.innerHTML = `
      <div class="row">
      <div class="col">
      <div class="label">科目名</div>
      <input value="${c.name}" data-i="${idx}" data-k="name" />
      </div>
      </div>
      <div class="row">
      <div class="col small">
      <div class="label">総単元数</div>
      <input type="number" value="${r.total}" data-i="${idx}" data-k="total" />
      </div>
      <div class="col small">
      <div class="label">欠席</div>
      <input type="number" value="${r.absent}" data-i="${idx}" data-k="absent" />
      </div>
      <div class="col small">
      <div class="label">遅刻</div>
      <input type="number" value="${r.late}" data-i="${idx}" data-k="late" />
      </div>
      </div>
      <div class="meta">
      <div>
      <div class="rate">${r.rate.toFixed(1)}%</div>
      <div class="sub">総欠席数：${r.totalAbs}</div>
      </div>
      <div class="pill ${bandClass(b)}">${bandText(b)}</div>
      </div>
      <div class="sub">
              80%を保つには：あと ${r.remainAbs} 回欠席可能
      </div>
      <div class="actions">
      <button class="btn-del" data-del="${idx}">科目を削除</button>
      </div>

    `;

    list.appendChild(card);

  });

}

document.addEventListener("input", (e)=>{

  const t = e.target;

  if(t.dataset && t.dataset.i !== undefined){

    const idx = Number(t.dataset.i);

    const key = t.dataset.k;

    if(key === "name"){

      state[idx][key] = t.value;

    }else{

      state[idx][key] = Number(t.value)||0;

    }

    const r = calc(state[idx]);

    maybeNotify(state[idx], r.rate);

    save();

    render();

  }

});

document.addEventListener("click", (e)=>{

  if(e.target.id === "addBtn"){

    state.push({ name:`科目${state.length+1}`, total:0, absent:0, late:0, lastBand:"OK" });

    save();

    render();

  }

  if(e.target.dataset.del !== undefined){

    state.splice(Number(e.target.dataset.del),1);

    save();

    render();

  }

});

render();
/* =========================================
   メインシステム・セーブデータ・UI管理
========================================= */
const DB_KEY = "GachaAppDB";
const defaultUserData = { 
  tickets: 0, 
  lastRouletteDate: "", 
  inventory: {}, 
  usedCodes: [],
  usedTradeCodes: [],
  favoriteCardId: null // 初期状態はお気に入り未登録（なし）
};
let userData = { ...defaultUserData };

function loadData() {
  const saved = localStorage.getItem(DB_KEY);
  if(saved) {
    try {
      userData = Object.assign({}, defaultUserData, JSON.parse(saved));
    } catch(e) {
      userData = { ...defaultUserData };
    }
  }
  updateUI();
}

function saveData() {
  localStorage.setItem(DB_KEY, JSON.stringify(userData));
  updateUI();
}

function updateUI() {
  const ticketsEl = document.getElementById('ui-tickets');
  if(ticketsEl) ticketsEl.innerText = userData.tickets;
  renderHomePartner();
  renderInventory();
  renderTradeOptions();
  checkRouletteTime();
}

function switchView(viewId, btnElement) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if(targetView) targetView.classList.add('active');
  if(btnElement) btnElement.classList.add('active');
}

/* --- ホーム看板カード --- */
function renderHomePartner() {
  const container = document.getElementById('partner-card-container');
  if(!container) return;

  // お気に入りが未登録（null または 空）の場合は何も表示しない
  if (!userData.favoriteCardId) {
    container.innerHTML = "";
    return;
  }

  const favoriteCard = CARDS.find(c => c.id === userData.favoriteCardId);
  if (!favoriteCard) {
    container.innerHTML = "";
    return;
  }

  const count = userData.inventory[favoriteCard.id] || 0;
  container.innerHTML = createCardHTML(favoriteCard, count, false);
}

function setFavoriteCard(cardId) {
  userData.favoriteCardId = cardId;
  saveData();
  alert("ホームの看板カードに変更しました！");
}

/* --- カードHTML共通生成 --- */
function createCardHTML(card, count = 1, showSetBtn = false) {
  const limitBreak = count - 1;
  const lbBadge = limitBreak > 0 ? `<div class="limit-break">+${limitBreak}</div>` : "";
  const isFavorite = (userData.favoriteCardId === card.id);
  
  let setBtnHTML = "";
  if (showSetBtn) {
    if (isFavorite) {
      setBtnHTML = `<button class="btn btn-sm" style="background:#555; color:#aaa;" disabled>★ 看板中</button>`;
    } else {
      setBtnHTML = `<button class="btn btn-sm" onclick="setFavoriteCard('${card.id}')">★ ホームに設定</button>`;
    }
  }

  return `
    <div class="card ${card.rarity}">
      ${lbBadge}
      <div class="rarity-tag">${card.rarity}</div>
      <div class="card-img-wrap">
        <img src="${card.image}" class="card-img" alt="${card.name}">
      </div>
      <div class="card-info">
        <div class="card-name">${card.name}</div>
        ${setBtnHTML}
      </div>
    </div>
  `;
}

/* --- デイリールーレット (15時リセット) --- */
function openRouletteModal() {
  checkRouletteTime();
  const modal = document.getElementById('roulette-modal');
  if(modal) modal.style.display = 'flex';
}

function closeRouletteModal() {
  const modal = document.getElementById('roulette-modal');
  if(modal) modal.style.display = 'none';
}

function checkRouletteTime() {
  const nowJST = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  const isBefore15 = nowJST.getHours() < 15;
  
  const targetDate = new Date(nowJST);
  if(isBefore15) targetDate.setDate(targetDate.getDate() - 1);
  const resetDate = `${targetDate.getFullYear()}-${targetDate.getMonth()+1}-${targetDate.getDate()}`;
  
  const iconBtn = document.getElementById('btn-roulette-icon');
  const noticeBadge = document.getElementById('roulette-notice');
  const spinBtn = document.getElementById('btn-roulette-spin');
  const msg = document.getElementById('roulette-msg');

  if(!spinBtn) return resetDate;

  if(userData.lastRouletteDate === resetDate) {
    if(iconBtn) iconBtn.classList.remove('has-notice');
    if(noticeBadge) noticeBadge.style.display = 'none';
    spinBtn.disabled = true;
    spinBtn.innerText = "本日は受取済み";
    if(msg) msg.innerText = "次の更新は明日15:00です。";
  } else {
    if(iconBtn) iconBtn.classList.add('has-notice');
    if(noticeBadge) noticeBadge.style.display = 'flex';
    spinBtn.disabled = false;
    spinBtn.innerText = "ルーレットを回す！";
    if(msg) msg.innerText = "";
  }
  return resetDate;
}

function spinRoulette() {
  const resetDate = checkRouletteTime();
  const spinBtn = document.getElementById('btn-roulette-spin');
  if(spinBtn && spinBtn.disabled) return;

  const r = Math.random() * 100;
  let getTickets = 10;
  if(r < 1) getTickets = 1000;
  else if(r < 5) getTickets = 500;
  else if(r < 15) getTickets = 300;
  else if(r < 35) getTickets = 200;
  else if(r < 70) getTickets = 150;
  else if(r < 90) getTickets = 50;

  alert(`🎯 ルーレット結果：【 ${getTickets}連分 】のチケットを獲得しました！`);
  userData.tickets += getTickets;
  userData.lastRouletteDate = resetDate;
  saveData();
  closeRouletteModal();
}

/* --- インベントリ描画 --- */
function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  if(!grid) return;
  grid.innerHTML = "";
  for(const [id, count] of Object.entries(userData.inventory)) {
    if(count <= 0) continue;
    const card = CARDS.find(c => c.id === id);
    if(!card) continue;
    grid.innerHTML += createCardHTML(card, count, true);
  }
}

/* --- 1v1 トレード --- */
const SECRET_KEY = "GACHA26";

function renderTradeOptions() {
  const select = document.getElementById('trade-give-select');
  if(!select) return;
  select.innerHTML = '<option value="">あげるカードを選択...</option>';
  for(const [id, count] of Object.entries(userData.inventory)) {
    if(count > 0) {
      const card = CARDS.find(c => c.id === id);
      select.innerHTML += `<option value="${id}">${card.name} (${card.rarity} / 所持:${count})</option>`;
    }
  }
}

function issueTradeCode() {
  const select = document.getElementById('trade-give-select');
  if(!select) return;
  const id = select.value;
  if(!id) return alert("カードを選んでください");
  if(userData.inventory[id] <= 0) return alert("所持していません");
  
  userData.inventory[id] -= 1;
  const timestamp = Date.now();
  const rawData = `${SECRET_KEY}|${id}|${timestamp}`;
  const code = btoa(encodeURIComponent(rawData));
  
  const output = document.getElementById('trade-code-output');
  if(output) output.value = code;
  alert("コードを発行しました！手持ちからカードが1枚減りました。相手にコードを教えてあげてください。");
  saveData();
}

function receiveTradeCode() {
  const input = document.getElementById('trade-code-input');
  if(!input) return;
  const code = input.value.trim();
  if(!code) return;
  
  if(!userData.usedTradeCodes) userData.usedTradeCodes = [];
  if(userData.usedTradeCodes.includes(code)) {
    return alert("このトレードコードは既に使用されています！");
  }
  
  try {
    const rawData = decodeURIComponent(atob(code));
    const parts = rawData.split('|');
    if(parts[0] !== SECRET_KEY) throw new Error("不正なコード");
    
    const id = parts[1];
    const card = CARDS.find(c => c.id === id);
    if(!card) throw new Error("存在しないカード");
    
    userData.inventory[id] = (userData.inventory[id] || 0) + 1;
    userData.usedTradeCodes.push(code);
    
    input.value = "";
    alert(`トレード成功！\n「${card.name} (${card.rarity})」を受け取りました！`);
    saveData();
  } catch (e) {
    alert("無効なコード、または形式が間違っています。");
  }
}

/* --- シリアルコード & セーブデータ管理 --- */
function useSerialCode() {
  const input = document.getElementById('serial-input');
  if(!input) return;
  const code = input.value.trim().toUpperCase();
  if(!code) return;
  if(userData.usedCodes.includes(code)) return alert("既に使用済みのコードです。");
  if(CODES[code]) {
    userData.tickets += CODES[code];
    userData.usedCodes.push(code);
    alert(`コード承認！ ${CODES[code]}連分のチケットを獲得しました！`);
    input.value = "";
    saveData();
  } else {
    alert("存在しないシリアルコードです。");
  }
}

function exportData() {
  prompt("以下の文字列がセーブデータです。コピーして保存してください。", JSON.stringify(userData));
}

function importData() {
  const input = document.getElementById('import-input');
  if(!input) return;
  const dataStr = input.value.trim();
  if(!dataStr) return alert("セーブデータを入力してください。");
  
  try {
    const importedData = JSON.parse(dataStr);
    if(typeof importedData === 'object' && importedData !== null) {
      userData = Object.assign({}, defaultUserData, importedData);
      saveData();
      alert("セーブデータを復元しました！");
      location.reload();
    } else {
      throw new Error();
    }
  } catch(e) {
    alert("無効なセーブデータコードです。");
  }
}

window.onload = loadData;


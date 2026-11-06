/* =========================================
   1. マスターデータ
========================================= */
const CARDS = [
  { id: 'c1', name: '路地裏の野良猫', rarity: 'N', image: 'https://placehold.co/600x800/222/888?text=Cat' },
  { id: 'c2', name: 'エナドリ信者', rarity: 'N', image: 'https://placehold.co/600x800/222/888?text=Energy' },
  { id: 'c3', name: '新米DJ', rarity: 'R', image: 'https://placehold.co/600x800/003311/00e676?text=DJ' },
  { id: 'c4', name: '深夜のバウンサー', rarity: 'R', image: 'https://placehold.co/600x800/003311/00e676?text=Bouncer' },
  { id: 'c5', name: 'Y2Kスケーター', rarity: 'SR', image: 'https://placehold.co/600x800/220033/b388ff?text=Skater' },
  { id: 'c6', name: 'ゴシックメイド', rarity: 'SR', image: 'https://placehold.co/600x800/220033/b388ff?text=Maid' },
  { id: 'c7', name: 'ネオンハッカー', rarity: 'SSR', image: 'https://placehold.co/600x800/443300/ffd700?text=Hacker' },
  { id: 'c8', name: '電脳歌姫・サイバーディヴァ', rarity: 'UR', image: 'https://placehold.co/600x800/440022/ff007f?text=Diva' }
];

const RATES = { 'N': 60, 'R': 25, 'SR': 10, 'SSR': 4, 'UR': 1 };
const CODES = { 'START2026': 100, 'TEST_CODE': 50 };

/* =========================================
   2. システムロジック・データ保存
========================================= */
const DB_KEY = "GachaAppDB";
const defaultUserData = { 
  tickets: 0, 
  lastRouletteDate: "", 
  inventory: {}, 
  usedCodes: [],
  favoriteCardId: "c8"
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
  document.getElementById('ui-tickets').innerText = userData.tickets;
  renderHomePartner();
  renderInventory();
  renderTradeOptions();
  checkRouletteTime();
}

function switchView(viewId, btnElement) {
  document.querySelectorAll('.view').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  btnElement.classList.add('active');
}

/* =========================================
   3. ホーム看板カード
========================================= */
function renderHomePartner() {
  const container = document.getElementById('partner-card-container');
  let favoriteCard = CARDS.find(c => c.id === userData.favoriteCardId);
  if (!favoriteCard) favoriteCard = CARDS[0];

  const count = userData.inventory[favoriteCard.id] || 0;
  container.innerHTML = createCardHTML(favoriteCard, count, false);
}

function setFavoriteCard(cardId) {
  userData.favoriteCardId = cardId;
  saveData();
  alert("ホームの看板カードに変更しました！");
}

/* =========================================
   4. デイリールーレット (15時リセット)
========================================= */
function openRouletteModal() {
  checkRouletteTime();
  document.getElementById('roulette-modal').style.display = 'flex';
}

function closeRouletteModal() {
  document.getElementById('roulette-modal').style.display = 'none';
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

  if(userData.lastRouletteDate === resetDate) {
    iconBtn.classList.remove('has-notice');
    noticeBadge.style.display = 'none';
    spinBtn.disabled = true;
    spinBtn.innerText = "本日は受取済み";
    msg.innerText = "次の更新は明日15:00です。";
  } else {
    iconBtn.classList.add('has-notice');
    noticeBadge.style.display = 'flex';
    spinBtn.disabled = false;
    spinBtn.innerText = "ルーレットを回す！";
    msg.innerText = "";
  }
  return resetDate;
}

function spinRoulette() {
  const resetDate = checkRouletteTime();
  if(document.getElementById('btn-roulette-spin').disabled) return;

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

/* =========================================
   5. ガチャ＆新演出ロジック
========================================= */
async function drawGacha(times) {
  if (times === 'max') {
    times = Math.min(userData.tickets, 100);
  }
  if(times === 0 || userData.tickets < times) {
    alert("チケットが足りません！");
    return;
  }
  
  userData.tickets -= times;
  const results = [];
  
  for(let i = 0; i < times; i++) {
    const r = Math.random() * 100;
    let targetRarity = 'N';
    let sum = 0;
    for(const [rarity, prob] of Object.entries(RATES)) {
      sum += prob;
      if(r <= sum) { targetRarity = rarity; break; }
    }
    
    const pool = CARDS.filter(c => c.rarity === targetRarity);
    const getCard = pool[Math.floor(Math.random() * pool.length)];
    
    // ガチャを引いた時点で「未所持(初獲得)」か判定
    const isNew = (!userData.inventory[getCard.id] || userData.inventory[getCard.id] === 0);
    
    results.push({ card: getCard, isNew: isNew });
    
    // 所持数（凸数）を加算
    userData.inventory[getCard.id] = (userData.inventory[getCard.id] || 0) + 1;
  }
  
  saveData();
  
  // 1枚ずつ高速演出開始
  await playGachaAnimation(results);
}

// 1枚ずつ高速表示 ＋ NEWカード停止アニメーション
function playGachaAnimation(results) {
  return new Promise((resolve) => {
    const modal = document.getElementById('gacha-result');
    const animContainer = document.getElementById('gacha-anim-container');
    const summaryContainer = document.getElementById('gacha-summary-container');
    const cardTarget = document.getElementById('gacha-anim-card-target');
    const newBadge = document.getElementById('gacha-anim-new');
    const tapMsg = document.getElementById('gacha-anim-tap-msg');

    summaryContainer.style.display = 'none';
    animContainer.style.display = 'block';
    modal.style.display = 'flex';

    let index = 0;

    async function nextCard() {
      if (index >= results.length) {
        // 全表示終了 ➔ 最終結果リスト画面へ
        animContainer.style.display = 'none';
        showGachaSummary(results);
        resolve();
        return;
      }

      const item = results[index];
      cardTarget.innerHTML = createCardHTML(item.card, 1, false);

      if (item.isNew) {
        // 未所持カード：一時停止してタップを待つ
        newBadge.style.display = 'inline-block';
        tapMsg.innerText = "【 NEWカード獲得！】タップで次へ";
        
        await waitForTap(modal);
        
        newBadge.style.display = 'none';
        tapMsg.innerText = "";
        index++;
        nextCard();
      } else {
        // 所持済みカード：超高速でスキップ (70ミリ秒)
        newBadge.style.display = 'none';
        tapMsg.innerText = "";
        index++;
        setTimeout(nextCard, 70);
      }
    }

    nextCard();
  });
}

// タップされるまで待機する処理
function waitForTap(element) {
  return new Promise((resolve) => {
    function handler(e) {
      e.stopPropagation();
      element.removeEventListener('click', handler);
      element.removeEventListener('touchstart', handler);
      resolve();
    }
    element.addEventListener('click', handler, { once: true });
    element.addEventListener('touchstart', handler, { once: true });
  });
}

// 最終結果（テキストリスト表示）
function showGachaSummary(results) {
  const summaryContainer = document.getElementById('gacha-summary-container');
  const resultList = document.getElementById('gacha-result-list');
  
  resultList.innerHTML = "";
  
  results.forEach(item => {
    const newTag = item.isNew ? `<span class="result-new-tag">NEW!</span>` : "";
    resultList.innerHTML += `
      <div class="result-item">
        <span class="result-rarity ${item.card.rarity}">${item.card.rarity}</span>
        <span class="result-name">${item.card.name}</span>
        ${newTag}
      </div>
    `;
  });

  summaryContainer.style.display = 'block';
}

function closeGachaResult() {
  document.getElementById('gacha-result').style.display = 'none';
}

/* =========================================
   6. インベントリ描画
========================================= */
function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = "";
  for(const [id, count] of Object.entries(userData.inventory)) {
    if(count <= 0) continue;
    const card = CARDS.find(c => c.id === id);
    if(!card) continue;
    grid.innerHTML += createCardHTML(card, count, true);
  }
}

/* =========================================
   7. 1v1 トレード (あいことば方式)
========================================= */
const SECRET_KEY = "GACHA26";

function renderTradeOptions() {
  const select = document.getElementById('trade-give-select');
  select.innerHTML = '<option value="">あげるカードを選択...</option>';
  for(const [id, count] of Object.entries(userData.inventory)) {
    if(count > 0) {
      const card = CARDS.find(c => c.id === id);
      select.innerHTML += `<option value="${id}">${card.name} (${card.rarity} / 所持:${count})</option>`;
    }
  }
}

function issueTradeCode() {
  const id = document.getElementById('trade-give-select').value;
  if(!id) return alert("カードを選んでください");
  if(userData.inventory[id] <= 0) return alert("所持していません");
  
  userData.inventory[id] -= 1;
  const timestamp = Date.now();
  const rawData = `${SECRET_KEY}|${id}|${timestamp}`;
  const code = btoa(encodeURIComponent(rawData));
  
  document.getElementById('trade-code-output').value = code;
  alert("コードを発行しました！手持ちからカードが1枚減りました。相手にコードを教えてあげてください。");
  saveData();
}

function receiveTradeCode() {
  const code = document.getElementById('trade-code-input').value.trim();
  if(!code) return;
  
  try {
    const rawData = decodeURIComponent(atob(code));
    const parts = rawData.split('|');
    if(parts[0] !== SECRET_KEY) throw new Error("不正なコード");
    
    const id = parts[1];
    const card = CARDS.find(c => c.id === id);
    if(!card) throw new Error("存在しないカード");
    
    userData.inventory[id] = (userData.inventory[id] || 0) + 1;
    document.getElementById('trade-code-input').value = "";
    alert(`トレード成功！\n「${card.name} (${card.rarity})」を受け取りました！`);
    saveData();
  } catch (e) {
    alert("無効なコード、または形式が間違っています。");
  }
}

/* =========================================
   8. シリアルコード & セーブデータ管理
========================================= */
function useSerialCode() {
  const code = document.getElementById('serial-input').value.trim().toUpperCase();
  if(!code) return;
  if(userData.usedCodes.includes(code)) return alert("既に使用済みのコードです。");
  if(CODES[code]) {
    userData.tickets += CODES[code];
    userData.usedCodes.push(code);
    alert(`コード承認！ ${CODES[code]}連分のチケットを獲得しました！`);
    document.getElementById('serial-input').value = "";
    saveData();
  } else {
    alert("存在しないシリアルコードです。");
  }
}

function exportData() {
  prompt("以下の文字列がセーブデータです。コピーして保存してください。", JSON.stringify(userData));
}

window.onload = loadData;

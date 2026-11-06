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

/* =========================================
   3. ホーム看板カード
========================================= */
function renderHomePartner() {
  const container = document.getElementById('partner-card-container');
  if(!container) return;
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

/* =========================================
   5. ガチャ＆爆速NEWカード限定演出ロジック
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
    
    // ガチャ引く前の所持数で NEW 判定
    const currentCount = userData.inventory[getCard.id] || 0;
    const isNew = (currentCount === 0);
    
    results.push({ card: getCard, isNew: isNew });
    
    // インベントリに加算
    userData.inventory[getCard.id] = currentCount + 1;
  }
  
  saveData();
  
  // 新・演出処理（NEWのみ表示）
  await playGachaAnimation(results);
}

function playGachaAnimation(results) {
  return new Promise((resolve) => {
    const modal = document.getElementById('gacha-result');
    const animContainer = document.getElementById('gacha-anim-container');
    const summaryContainer = document.getElementById('gacha-summary-container');
    const cardTarget = document.getElementById('gacha-anim-card-target');
    const newBadge = document.getElementById('gacha-anim-new');
    const tapMsg = document.getElementById('gacha-anim-tap-msg');

    // ガチャ結果の中で「未所持（NEW）」だったカードだけを抽出
    const newItems = results.filter(item => item.isNew);

    if (!modal || !animContainer || !summaryContainer || !cardTarget) {
      showGachaSummary(results);
      if(modal) modal.style.display = 'flex';
      resolve();
      return;
    }

    // 【爆速処理】NEWカードが1枚もない場合は、画像演出ゼロで即リスト表示！
    if (newItems.length === 0) {
      animContainer.style.display = 'none';
      showGachaSummary(results);
      resolve();
      return;
    }

    // NEWカードが存在する場合は1枚ずつタップで表示
    summaryContainer.style.display = 'none';
    animContainer.style.display = 'block';
    modal.style.display = 'flex';

    let index = 0;

    async function showNextNewCard() {
      if (index >= newItems.length) {
        // すべてのNEWを表示し終わったら結果リストへ
        animContainer.style.display = 'none';
        showGachaSummary(results);
        


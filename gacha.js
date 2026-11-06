/* =========================================
   ガチャシステム＆演出＆結果ソート表示
========================================= */

// ガチャ実行
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
    
    const currentCount = userData.inventory[getCard.id] || 0;
    const isNew = (currentCount === 0);
    
    results.push({ card: getCard, isNew: isNew });
    userData.inventory[getCard.id] = currentCount + 1;
  }
  
  saveData();
  await playGachaAnimation(results);
}

// 高速切り替え ＋ NEWストップ演出
function playGachaAnimation(results) {
  return new Promise((resolve) => {
    const modal = document.getElementById('gacha-result');
    const animContainer = document.getElementById('gacha-anim-container');
    const summaryContainer = document.getElementById('gacha-summary-container');
    const cardTarget = document.getElementById('gacha-anim-card-target');
    const newBadge = document.getElementById('gacha-anim-new');
    const tapMsg = document.getElementById('gacha-anim-tap-msg');

    if (!modal || !animContainer || !summaryContainer || !cardTarget) {
      showGachaSummary(results);
      if(modal) modal.style.display = 'flex';
      resolve();
      return;
    }

    summaryContainer.style.display = 'none';
    animContainer.style.display = 'block';
    modal.style.display = 'flex';

    let index = 0;

    async function nextCard() {
      if (index >= results.length) {
        animContainer.style.display = 'none';
        showGachaSummary(results);
        resolve();
        return;
      }

      const item = results[index];
      cardTarget.innerHTML = createCardHTML(item.card, 1, false);

      if (item.isNew) {
        if (newBadge) newBadge.style.display = 'inline-block';
        // 先バレ防止：総数やカウントを出さずに統一メッセージに修正
        if (tapMsg) tapMsg.innerText = "【 NEWカード獲得！】タップで次へ";

        await waitForTap(modal);

        if (newBadge) newBadge.style.display = 'none';
        if (tapMsg) tapMsg.innerText = "";
        index++;
        nextCard();
      } else {
        if (newBadge) newBadge.style.display = 'none';
        if (tapMsg) tapMsg.innerText = "";
        index++;
        setTimeout(nextCard, 100);
      }
    }

    nextCard();
  });
}

function waitForTap(element) {
  return new Promise((resolve) => {
    function handler(e) {
      if (e.type === 'touchstart') e.preventDefault();
      element.removeEventListener('click', handler);
      element.removeEventListener('touchstart', handler);
      resolve();
    }
    element.addEventListener('click', handler, { once: true });
    element.addEventListener('touchstart', handler, { once: true, passive: false });
  });
}

// 最終結果画面（集計 ＋ レアリティ高い順ソート）
function showGachaSummary(results) {
  const summaryContainer = document.getElementById('gacha-summary-container');
  const resultList = document.getElementById('gacha-result-list');
  const modal = document.getElementById('gacha-result');
  
  if(!summaryContainer || !resultList) return;
  
  const summaryMap = new Map();
  results.forEach(item => {
    const id = item.card.id;
    if(!summaryMap.has(id)) {
      summaryMap.set(id, {
        card: item.card,
        count: 0,
        isNew: item.isNew
      });
    }
    summaryMap.get(id).count += 1;
  });

  const sortedSummary = Array.from(summaryMap.values()).sort((a, b) => {
    const orderA = RARITY_ORDER[a.card.rarity] || 0;
    const orderB = RARITY_ORDER[b.card.rarity] || 0;
    return orderB - orderA;
  });

  resultList.innerHTML = "";
  sortedSummary.forEach(data => {
    const newTag = data.isNew ? `<span class="result-new-tag">NEW!</span>` : "";
    const countText = data.count > 1 ? `<span style="color:var(--primary); font-weight:bold; margin-left:6px;">×${data.count}</span>` : "";
    
    resultList.innerHTML += `
      <div class="result-item">
        <span class="result-rarity ${data.card.rarity}">${data.card.rarity}</span>
        <span class="result-name">${data.card.name}${countText}</span>
        ${newTag}
      </div>
    `;
  });

  summaryContainer.style.display = 'block';
  if(modal) modal.style.display = 'flex';
}

function closeGachaResult() {
  const modal = document.getElementById('gacha-result');
  if(modal) modal.style.display = 'none';
}


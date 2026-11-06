/* =========================================
   カードデータベース＆各種定数
========================================= */

// レアリティの並び順優先度（ソート用）
const RARITY_ORDER = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };

// カードデータ一覧
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

// ガチャ排出確率 (%)
const RATES = { 'N': 60, 'R': 25, 'SR': 10, 'SSR': 4, 'UR': 1 };

// シリアルコード
const CODES = { 'START2026': 100, 'TEST_CODE': 50 };

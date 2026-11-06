/* =========================================
   カードデータベース＆各種定数
========================================= */

// レアリティの並び順優先度（ソート用）
const RARITY_ORDER = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };

// カードデータ一覧
const CARDS = [
  { id: 'c1', name: '外山', rarity: 'N', image: 'https://placehold.co/600x800/222/888?text=外山' },
  { id: 'c2', name: '高橋', rarity: 'N', image: 'https://placehold.co/600x800/222/888?text=高橋' },
  { id: 'c3', name: '杉崎', rarity: 'R', image: 'https://placehold.co/600x800/003311/00e676?text=杉崎' },
  { id: 'c4', name: '榎本', rarity: 'R', image: 'https://placehold.co/600x800/003311/00e676?text=榎本' },
  { id: 'c5', name: '大野', rarity: 'SR', image: 'https://placehold.co/600x800/220033/b388ff?text=大野' },
  { id: 'c6', name: '松井', rarity: 'SR', image: 'https://placehold.co/600x800/220033/b388ff?text=松井' },
  { id: 'c7', name: '曽川', rarity: 'SSR', image: 'https://placehold.co/600x800/443300/ffd700?text=曽川' },
  { id: 'c8', name: '皮脂', rarity: 'UR', image: 'https://placehold.co/600x800/440022/ff007f?text=皮脂' }
];

// ガチャ排出確率 (%)
const RATES = { 'N': 60, 'R': 25, 'SR': 10, 'SSR': 4, 'UR': 1 };

// シリアルコード
const CODES = { 'START2026': 100, 'TEST_CODE': 50 };

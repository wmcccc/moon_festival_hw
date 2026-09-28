window.MoonBunnyGame = window.MoonBunnyGame || {};

window.MoonBunnyGame.ROOM_DATA = {
  hall: {
    description: '月光灑進寬敞的大廳，烤肉派對的香氣從門縫飄來。月亮大門卻緊緊鎖著，得想辦法找到出口。',
    objects: [
      { id: 'moon-door', name: '月亮大門', icon: '🚪', detail: '胡蘿蔔鎖頭', click: { type: 'keypad' } },
      { id: 'rabbit-sofa', name: '絨毛兔兔沙發', icon: '🛋️', detail: '軟綿綿的坐墊', click: { type: 'collect', item: 'hammer', once: 'hammerFound', message: '你在沙發縫裡找到一把金屬小鐵鎚。' } },
      { id: 'vent-grate', name: '通風口鐵網', icon: '▦', detail: '似乎可以敲開', click: { type: 'vent' } },
      { id: 'chang-e-portrait', name: '嫦娥仙子畫像', icon: '🖼️', detail: '畫像額頭留著一個空位', click: { type: 'portrait' }, drop: { item: 'carrotGem', target: 'portrait' } },
      { id: 'glow-wall', name: '空白螢光牆面', icon: '✧', detail: '牆上什麼也沒有', click: { type: 'inspect', message: '牆面看起來空無一物，也許需要特殊光線。' }, drop: { item: 'moonFlashlight', target: 'glow-wall' } },
      { id: 'osmanthus-table', name: '桂花茶几', icon: '🍵', detail: '月餅與柚子皮帽', click: { type: 'collect', item: 'driedOsmanthus', once: 'osmanthusCollected', message: '你在茶几旁找到一小包乾燥桂花。' } },
    ],
  },
  flourStorage: {
    description: '麵粉香飄散在窄小的儲藏室裡，通風管出口就在身後。角落的粉堆似乎藏著什麼。',
    objects: [
      { id: 'vent-exit', name: '通風管出口', icon: '↩', detail: '點擊爬回月宮大廳', click: { type: 'travel', room: 'hall' } },
      { id: 'flour-pile', name: '麵粉堆', icon: '☁', detail: '蓬鬆的麵粉堆裡有東西', click: { type: 'collect', item: 'carrotGem', once: 'gemFound', message: '你從麵粉堆裡翻出一顆胡蘿蔔紅寶石。' } },
      { id: 'flashlight-box', name: '兔兔手電筒盒', icon: '🔦', detail: '盒蓋上畫著一隻兔子', click: { type: 'collect', item: 'moonFlashlight', once: 'flashlightFound', message: '盒子裡是一支月兔手電筒，能照出隱藏的螢光線索。' } },
      { id: 'mochi-box', name: '麻糬麵糰箱', icon: '📦', detail: '蓋子上印著一組數字', click: { type: 'clue', clue: 'clue1', value: '1 : 0', message: '你發現線索 1：1 : 0，已記入手帳。' } },
      { id: 'baking-scale', name: '巨型烘焙磅秤', icon: '⚖️', detail: '磅秤顯示麵粉重量：8 斤', click: { type: 'inspect', message: '磅秤指針停在 8 斤，旁邊的儲藏櫃似乎已經空了。' } },
    ],
  },
  medicineRoom: {
    description: '藥香充滿廣寒宮的搗藥室，月光映在微微發亮的井水上。或許有辦法讓井底的梯子升起。',
    objects: [
      { id: 'portrait-door', name: '畫像暗門', icon: '↩', detail: '點擊返回月宮大廳', click: { type: 'travel', room: 'hall' } },
      { id: 'mortar', name: '玉兔搗藥缽', icon: '🥣', detail: '桂花可以在這裡搗碎', click: { type: 'mortar' } },
      { id: 'glimmering-well', name: '微光水井', icon: '🪣', detail: '井水下方隱約有梯子的影子', click: { type: 'well' } },
      { id: 'herb-cabinet', name: '古木藥櫃', icon: '🗄️', detail: '抽屜貼著一張小小的數字貼紙', click: { type: 'clue', clue: 'clue2', value: '2 : 1', message: '你發現線索 2：2 : 1，已記入手帳。' } },
      { id: 'medicine-packets', name: '中藥抓藥包', icon: '🌿', detail: '一整面牆都掛滿草藥包', click: { type: 'inspect', message: '草本香氣讓人精神一振，這裡暫時沒有其他線索。' } },
    ],
  },
  brewery: {
    description: '柚子香與糖香交織在釀造室裡，井底梯子通回搗藥室。天花板上有一扇小門。',
    objects: [
      { id: 'well-ladder', name: '水井梯子', icon: '↩', detail: '點擊返回廣寒搗藥室', click: { type: 'travel', room: 'medicineRoom' } },
      { id: 'distilling-barrel', name: '蒸餾釀造桶', icon: '🛢️', detail: '木桶上雕刻著一組數字', click: { type: 'clue', clue: 'clue3', value: '3 : 5', message: '你發現線索 3：3 : 5，已記入手帳。' } },
      { id: 'yuzu-pile', name: '柚子果實堆', icon: '🍊', detail: '金黃柚子裡閃著一點金光', click: { type: 'collect', item: 'yuzuKey', once: 'yuzuKeyFound', message: '你在柚子堆裡找到一把金黃柚子鑰匙。' } },
      { id: 'sugar-tester', name: '糖分測試儀', icon: '％', detail: '目前柚子茶糖度：100%', click: { type: 'inspect', message: '糖度剛剛好，派對的柚子茶一定很好喝。' } },
      { id: 'attic-hatch', name: '閣樓天花板小門', icon: '⌃', detail: '鎖孔形狀像一片柚子葉', click: { type: 'attic' } },
    ],
  },
  observatory: {
    description: '觀星閣高踞月宮之上，星光透過圓頂灑落。望遠鏡旁擺著為中秋烤肉派對準備的點心。',
    objects: [
      { id: 'attic-ladder', name: '閣樓梯子', icon: '↩', detail: '點擊返回柚子釀造室', click: { type: 'travel', room: 'brewery' } },
      { id: 'telescope', name: '天文望遠鏡', icon: '🔭', detail: '星星排列成一組數字', click: { type: 'clue', clue: 'clue4', value: '4 : 8', message: '你透過望遠鏡發現線索 4：4 : 8，已記入手帳。' } },
      { id: 'moon-chart', name: '月球星象圖', icon: '🌙', detail: '圖上標示地球與月球的相對位置', click: { type: 'inspect', message: '星象圖記錄著月球和地球的位置，星圖背面沒有其他字樣。' } },
      { id: 'party-table', name: '烤肉派對預備桌', icon: '🍡', detail: '烤肉架與棉花糖都準備好了', click: { type: 'inspect', message: '棉花糖已經串好，月兔逃出去就能開始派對。' } },
      { id: 'gift-safe', name: '中秋禮盒保險箱', icon: '🎁', detail: '保險箱上有一個小小的月相轉盤', click: { type: 'safe' } },
    ],
  },
};
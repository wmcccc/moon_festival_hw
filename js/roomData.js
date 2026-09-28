window.MoonBunnyGame = window.MoonBunnyGame || {};

window.MoonBunnyGame.ROOM_DATA = {
  hall: {
    description: '月光灑進寬敞的大廳，烤肉派對的香氣從門縫飄來。月亮大門緊鎖著，得找出離開月宮的方法。',
    objects: [
      { id: 'moon-door', name: '月亮大門', icon: '🚪', detail: '胡蘿蔔鎖頭', click: { type: 'keypad' } },
      { id: 'rabbit-sofa', name: '絨毛兔兔沙發', icon: '🛋️',  detail: '沙發縫隙裡似乎藏著東西', click: { type: 'collect', item: 'hammer', once: 'hammerFound', message: '你仔細翻找沙發縫隙，找到一把金屬小鐵鎚。' } },
      { id: 'vent-grate', name: '通風口鐵網', icon: '▦', detail: '鐵網鎖得很緊', click: { type: 'vent' }, drop: { item: 'hammer', target: 'vent' } },
      { id: 'chang-e-portrait', name: '嫦娥仙子畫像', icon: '🖼️', detail: '畫像額頭有一個凹槽', click: { type: 'portrait' }, drop: { item: 'carrotGem', target: 'portrait' } },
      { id: 'glow-wall', name: '空白螢光牆面', icon: '✧', detail: '牆上空無一物', click: { type: 'inspect', message: '牆面看起來空無一物' }, drop: { item: 'moonFlashlight', target: 'glow-wall' } },
      { id: 'osmanthus-table', name: '桂花茶几', icon: '🍵', detail: '半塊廣式月餅與柚子皮帽留在桌上', click: { type: 'inspect', message: '茶几上有半塊廣式月餅和一頂柚子皮帽' } },
    ],
  },
  flourStorage: {
    description: '麵粉香飄散在窄小的儲藏室裡，通風管出口就在身後。木箱和粉堆間藏著幾件派對用品。',
    objects: [
      { id: 'vent-exit', name: '通風管出口', icon: '↩', detail: '可返回月宮大廳', click: { type: 'travel', room: 'hall' } },
      { id: 'flour-pile', name: '麵粉堆', icon: '☁', detail: '粉堆深處有微小亮光', click: { type: 'collect', item: 'carrotGem', once: 'gemFound', message: '你在麵粉堆的亮光處找到一顆胡蘿蔔紅寶石。' } },
      { id: 'flashlight-box', name: '兔兔手電筒盒', icon: '🔦',  detail: '藏在木箱後方的兔子圖案盒子', click: { type: 'collect', item: 'moonFlashlight', once: 'flashlightFound', message: '有一支月兔手電筒' } },
      { id: 'mochi-box', name: '麻糬麵糰箱', icon: '📦',  detail: '烤箱刻度旁印著一組標籤', click: { type: 'clue', clue: 'clue1', value: '1 : 0', message: '你在麵糰箱上發現線索 ：1 : 0' } },
      { id: 'recipe-note-wall', name: '食譜便籤牆', icon: '📝', detail: '「月餅百般好，麻糬零瑕疵」', click: { type: 'inspect', message: '「月餅百般好，麻糬零瑕疵」。' } },
    ],
  },
  medicineRoom: {
    description: '藥香充滿廣寒宮的搗藥室，微光映在井面。藥櫃與抓藥包的排列似乎藏著空間提示。',
    objects: [
      { id: 'portrait-door', name: '畫像暗門', icon: '↩',detail: '可返回月宮大廳', click: { type: 'travel', room: 'hall' } },
      { id: 'mortar', name: '玉兔搗藥缽', icon: '🥣',  detail: '用來搗藥的', click: { type: 'mortar' } },
      { id: 'glimmering-well', name: '微光水井', icon: '🪣',  detail: '井水下方隱約有梯子的影子', click: { type: 'well' }, drop: { item: 'osmanthusPotion', target: 'well' } },
      { id: 'herb-cabinet', name: '古木藥櫃', icon: '🗄️',  detail: '甘草、桂皮、黃耆、枸杞藥罐排列在抽屜前', click: { type: 'clue', clue: 'clue2', value: '2 : 1', message: '依照藥罐位置與抓藥包軌跡找到正確抽屜，發現線索 ：2 : 1。' } },
      { id: 'medicine-packets', name: '中藥抓藥包', icon: '🌿', detail: '圖案符號排出一道空間軌跡', click: { type: 'collect', item: 'driedOsmanthus', once: 'osmanthusCollected', message: '你檢查抓藥包上的符號，找到一包乾燥桂花，也看出它們指向藥櫃的排列方式。' } },
    ],
  },
  brewery: {
    description: '柚子香與糖香交織在釀造室裡，水井梯子通回搗藥室。天花板上有一扇小門。',
    objects: [
      { id: 'well-ladder', name: '水井梯子', icon: '↩',  detail: '可返回廣寒搗藥室', click: { type: 'travel', room: 'medicineRoom' } },
      { id: 'distilling-barrel', name: '蒸餾釀造桶', icon: '🛢️', detail: '桶身刻著一首月夜燈謎', click: { type: 'barrel' } },
      { id: 'yuzu-pile', name: '柚子果實堆', icon: '🍊',  detail: '角落的柚子間閃著金光', click: { type: 'collect', item: 'yuzuKey', once: 'yuzuKeyFound', message: '你翻找柚子堆，在角落找到一把金黃柚子鑰匙。' } },
      { id: 'sugar-tester', name: '糖分測試儀', icon: '％', detail: '需要投入液體才能測試', click: { type: 'inspect', message: '測試儀尚未啟動。' }, drop: { item: 'yuzuJuice', target: 'sugar-tester' } },
      { id: 'attic-hatch', name: '閣樓天花板小門', icon: '⌃', detail: '門鎖卡榫需要先放鬆', click: { type: 'attic' }, drop: { item: 'yuzuKey', target: 'attic-hatch' } },
    ],
  },
  observatory: {
    description: '觀星閣高踞月宮之上，星光透過圓頂灑落。望遠鏡、星象圖和派對桌上的紙條或許能解開額外挑戰。',
    objects: [
      { id: 'attic-ladder', name: '閣樓梯子', icon: '↩', detail: '可返回柚子釀造室', click: { type: 'travel', room: 'brewery' } },
      { id: 'telescope', name: '天文望遠鏡', icon: '🔭', detail: '依照星象圖方向尋找亮星連線', click: { type: 'clue', clue: 'clue4', value: '4 : 8', message: '依亮星連線讀出星列，發現線索 ：4 : 8，已記入手帳。' } },
      { id: 'moon-chart', name: '月球星象軌跡圖', icon: '🌙', detail: '地球、月球與星座標出觀測方向', click: { type: 'inspect', message: '星象圖標示地球、月球與星座的相對位置，依照軌跡轉動望遠鏡，就能找到亮星連線。' } },
      { id: 'party-table', name: '烤肉派對預備桌', icon: '🍡', detail: '烤肉架與棉花糖都準備好了', click: { type: 'inspect', message: '桌上擺滿烤肉架與棉花糖，月兔逃出去後就能開始中秋派對。' } },
      { id: 'star-notebook', name: '星光觀測紀錄冊', icon: '📖', detail: '記錄著月宮歷年的觀星筆記', click: { type: 'inspect', message: '紀錄冊寫著：「先沿星象圖的弧線尋找亮星，再以望遠鏡對焦。」' } },
    ],
  },
};
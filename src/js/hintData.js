window.MoonBunnyGame = window.MoonBunnyGame || {};

// 提示階梯：從上往下比對遊戲進度，第一個成立的項目就是「接下來該做的事」。
// 設計原則（配合 SPEC 的驗收標準）：
//   1. 只講「去哪裡、對哪個物件、怎麼操作」，不代玩家解題。
//   2. 不寫出線索數字與密碼，密碼仍要玩家自己從手帳推。
//   3. 一次只給一個目標，避免變成整條攻略。
//   4. nudge 是第二層補充，玩家按「再說得清楚一點」才會出現。
(function () {
  const game = window.MoonBunnyGame;
  const visited = (state, roomId) => state.visitedRooms.includes(roomId);
  const has = (state, itemId) => state.inventory.includes(itemId);
  const clues = (state) => [state.clues.clue1, state.clues.clue2, state.clues.clue3, state.clues.clue4];

  game.HINT_STEPS = [
    {
      id: 'escaped',
      when: (state) => state.progress.escaped,
      goal: '你已经逃出廣寒宮了',
      text: '月亮大門在你身後關上，派對的香氣還在鼻尖。恭喜完成月兔的中秋密室大逃脫！想再玩一次就重新整理頁面。',
    },
    {
      id: 'find-hammer',
      when: (state) => !state.progress.hammerFound,
      room: 'hall',
      object: 'rabbit-sofa',
      goal: '先找一把敲得動的工具',
      text: '大廳裡的「絨毛兔兔沙發」靠墊交界處有道縫隙，看起來鬆鬆的。點開它的特寫檢查一下。',
      nudge: '翻開縫隙應該會拿到一把「金屬小鐵鎚」，它之後會用到很多次，先別亂丟。',
    },
    {
      id: 'open-vent',
      when: (state) => state.progress.hammerFound && !state.progress.ventOpened,
      room: 'hall',
      object: 'vent-grate',
      goal: '生鏽的鐵網需要工具',
      text: '把背包裡的「金屬小鐵鎚」拖曳到「通風口鐵網」上，螺絲生鏽的鐵網應該能敲鬆。',
      nudge: '不想拖曳也可以：先點開鐵網特寫，再把道具拖到特寫裡的「拖曳物件到此」放置區。',
    },
    {
      id: 'enter-flour',
      when: (state) => state.progress.ventOpened && !visited(state, 'flourStorage'),
      room: 'hall',
      object: 'vent-grate',
      goal: '從通風口爬進去',
      text: '鐵網鬆了，現在直接點擊「通風口鐵網」就能爬進胡蘿蔔麵粉庫。',
    },
    {
      id: 'open-flour-pile',
      when: (state) => !state.progress.flourPileOpened,
      room: 'flourStorage',
      object: 'flour-pile',
      goal: '麵粉堆裡有微弱的亮光',
      text: '在胡蘿蔔麵粉庫裡點開「麵粉堆」特寫，把堆在底下的麵粉撥開看看。',
    },
    {
      id: 'collect-gem',
      when: (state) => state.progress.flourPileOpened && !state.progress.gemFound,
      room: 'flourStorage',
      object: 'flour-pile',
      goal: '把露出的東西撿起來',
      text: '粉堆底下露出一顆「胡蘿蔔紅寶石」，在特寫裡按「拾起」把它收進背包。',
      nudge: '這顆紅寶石是回大廳開畫像暗門的鑰匙，先收好。',
    },
    {
      id: 'open-flashlight-box',
      when: (state) => state.progress.gemFound && !state.progress.flashlightBoxOpened,
      room: 'flourStorage',
      object: 'flashlight-box',
      goal: '木箱後方有個兔子圖案的盒子',
      text: '麵粉庫裡還有「兔兔手電筒盒」，點開特寫把盒蓋掀開。',
    },
    {
      id: 'collect-flashlight',
      when: (state) => state.progress.flashlightBoxOpened && !state.progress.flashlightFound,
      room: 'flourStorage',
      object: 'flashlight-box',
      goal: '盒蓋下就是手電筒',
      text: '掀開的盒蓋下躺著「月兔手電筒」，按「拿取」收進背包。',
      nudge: '大廳那面空蕩蕩的螢光牆面只有拿它照才會顯字，先放著等等會用到。',
    },
    {
      id: 'read-recipe',
      when: (state) => state.progress.flashlightFound && !state.progress.recipeNoteRead,
      room: 'flourStorage',
      object: 'recipe-note-wall',
      goal: '先讀懂刻度在說什麼',
      text: '麻糬箱的旋鈕只有刻度、沒有標示。點開「食譜便籤牆」，那首配方詩會告訴你該對到哪個數。',
    },
    {
      id: 'solve-mochi-dial',
      when: (state) => state.progress.recipeNoteRead && !state.clues.clue1,
      room: 'flourStorage',
      object: 'mochi-box',
      goal: '麻糬麵糰箱的旋鈕',
      text: '回到「麻糬麵糰箱」，把刻度滑桿調到食譜便籤所暗示的數字，再按「試試看」。',
      nudge: '提示只告訴你在第幾個房間、哪個物件，數字請自己從便籤讀出來——這關的設計就是如此。',
    },
    {
      id: 'place-gem',
      when: (state) => state.clues.clue1 && !state.progress.portraitGemPlaced,
      room: 'hall',
      object: 'chang-e-portrait',
      goal: '紅寶石要嵌回大廳的畫像',
      text: '回到月宮大廳，把背包裡的「胡蘿蔔紅寶石」拖曳到「嫦娥仙子畫像」額頭的凹槽上。',
    },
    {
      id: 'enter-medicine',
      when: (state) => state.progress.portraitGemPlaced && !visited(state, 'medicineRoom'),
      room: 'hall',
      object: 'chang-e-portrait',
      goal: '從畫像暗門進搗藥室',
      text: '畫像移開露出暗門了，點擊「嫦娥仙子畫像」就能進入廣寒搗藥室。',
    },
    {
      id: 'search-herbs',
      when: (state) => !state.progress.osmanthusCollected,
      room: 'medicineRoom',
      object: 'medicine-packets',
      goal: '有個藥包的綁繩鬆了',
      text: '搗藥室牆上的「中藥抓藥包」右下角有一處綁繩鬆開，點開特寫檢查它。',
      nudge: '鬆開的藥包裡是「乾燥桂花」，而紙背還寫著藥材的排列順序。',
    },
    {
      id: 'fill-mortar',
      // 桂花研好之後 mortarFilled 會被清回 false，所以要一起看 osmanthusGround，
      // 否則提示會在搗完之後又倒退回去叫玩家重新入缽。
      when: (state) => state.progress.osmanthusCollected && !state.progress.mortarFilled && !state.progress.osmanthusGround,
      room: 'medicineRoom',
      object: 'mortar',
      goal: '桂花要先入缽',
      text: '把背包裡的「乾燥桂花」拖曳到「玉兔搗藥缽」裡。',
    },
    {
      id: 'pound-mortar',
      when: (state) => state.progress.mortarFilled && !state.progress.osmanthusGround,
      room: 'medicineRoom',
      object: 'mortar',
      goal: '連續搗滿三次',
      text: '桂花入缽後，在特寫裡連按三次「搗一下」，桂花特調藥水就會完成。',
    },
    {
      id: 'raise-well',
      when: (state) => state.progress.osmanthusGround && !state.progress.wellRaised,
      room: 'medicineRoom',
      object: 'glimmering-well',
      goal: '藥水要倒進井裡',
      text: '把「桂花特調藥水」拖曳到「微光水井」，井水會升高、露出藏起來的梯子。',
    },
    {
      id: 'enter-brewery',
      when: (state) => state.progress.wellRaised && !visited(state, 'brewery'),
      room: 'medicineRoom',
      object: 'glimmering-well',
      goal: '順著井裡的梯子下去',
      text: '點擊「微光水井」就能下到柚子釀造室。',
    },
    {
      id: 'solve-barrel',
      when: (state) => !state.progress.yuzuJuiceFound,
      room: 'brewery',
      object: 'distilling-barrel',
      goal: '釀造桶身刻著一首燈謎',
      text: '點開「蒸餾釀造桶」，把「月相」與「日影」兩個滑桿調到刻詩所指的時辰，再按「轉動閥門」。',
      nudge: '古人的時辰和現代鐘點換算過，詩裡寫的「更」跟「時」要換算成滑桿上的數字。',
    },
    {
      id: 'move-yuzu',
      when: (state) => state.progress.yuzuJuiceFound && state.progress.yuzuMoves < 2,
      room: 'brewery',
      object: 'yuzu-pile',
      goal: '柚子堆後方有金色反光',
      text: '點開「柚子果實堆」，把大柚子移開兩次，藏在後面的東西才會露出來。',
    },
    {
      id: 'collect-yuzu-key',
      when: (state) => state.progress.yuzuMoves >= 2 && !state.progress.yuzuKeyFound,
      room: 'brewery',
      object: 'yuzu-pile',
      goal: '把鑰匙撿起來',
      text: '移開的柚子後面露出「金黃柚子鑰匙」，在特寫裡按「拿取」收進背包。',
    },
    {
      id: 'test-sugar',
      when: (state) => state.progress.yuzuKeyFound && !state.progress.sugarTested,
      room: 'brewery',
      object: 'sugar-tester',
      goal: '柚子汁要拿來測糖度',
      text: '把「釀造桶柚子汁」拖曳到「糖分測試儀」，指針走到 100% 才會放鬆天花板門鎖的卡榫。',
    },
    {
      id: 'open-attic',
      when: (state) => state.progress.sugarTested && !state.progress.atticLadderLowered,
      room: 'brewery',
      object: 'attic-hatch',
      goal: '用鑰匙開天花板小門',
      text: '卡榫已經放鬆，把「金黃柚子鑰匙」拖曳到「閣樓天花板小門」的鎖孔上。',
    },
    {
      id: 'enter-observatory',
      when: (state) => state.progress.atticLadderLowered && !visited(state, 'observatory'),
      room: 'brewery',
      object: 'attic-hatch',
      goal: '爬上閣樓',
      text: '點擊「閣樓天花板小門」就能上到月宮觀星閣。',
    },
    {
      id: 'free-telescope',
      when: (state) => !state.progress.telescopeMountFreed,
      room: 'observatory',
      object: 'telescope',
      goal: '望遠鏡的支架卡死了',
      text: '觀星閣的望遠鏡齒輪卡住、刻度環轉不動。用背包裡還留著的「金屬小鐵鎚」拖曳到「天文望遠鏡」把它敲鬆。',
    },
    {
      id: 'read-star-chart',
      when: (state) => !state.progress.starChartViewed,
      room: 'observatory',
      object: 'moon-chart',
      goal: '方位角藏在星象圖上',
      text: '方位環該調幾度，要從「月球星象軌跡圖」上讀。先點開圖表，看月弧與主星的交角。',
    },
    {
      id: 'read-party-table',
      when: (state) => !state.progress.partyTableSearched,
      room: 'observatory',
      object: 'party-table',
      goal: '焦距線索在派對桌上',
      text: '焦距的線索在「烤肉派對預備桌」：便籤怎麼寫、桌面上又擺了幾樣東西，去點開看看。',
      nudge: '冰露是幾盞、炙籤是幾串，把這兩個數字一起算算，別只看其中一個。',
    },
    {
      id: 'read-star-notebook',
      when: (state) => !state.progress.observatoryNotesRead,
      room: 'observatory',
      object: 'star-notebook',
      goal: '手稿寫著調整順序',
      text: '「星光觀測紀錄冊」說明先定方位、再調焦距，也提了焦距怎麼算。記得把頁面往後翻完。',
    },
    {
      id: 'focus-telescope',
      when: (state) => !state.clues.clue4,
      room: 'observatory',
      object: 'telescope',
      goal: '對齊兩個刻度環',
      text: '回到「天文望遠鏡」，方位環調到星圖的交角、焦距環調到便籤算出來的值，再按「觀察星空」。',
      nudge: '順序反了會一直糊成一片：先轉方位環定方向，再轉焦距環對焦。',
    },
    {
      id: 'reveal-order',
      when: (state) => !state.clues.flashlightOrder,
      room: 'hall',
      object: 'glow-wall',
      goal: '還差最後一組排列順序',
      text: '線索湊齊了，但順序還不對。回到月宮大廳，把「月兔手電筒」拖曳到「空白螢光牆面」，牆上會照出四位數字的排列順序。',
    },
    {
      id: 'escape',
      when: (state) => clues(state).every(Boolean) && state.clues.flashlightOrder && has(state, 'moonFlashlight'),
      room: 'hall',
      object: 'moon-door',
      goal: '線索齊了，回大門輸密碼',
      text: '回到月宮大廳點擊「月亮大門」，把手帳上依「順序」重新排好的四位數字輸進密碼盤。',
      nudge: '密碼是照螢光牆的「順序」去挑線索，不是照 1 到 4 的編號順序照抄。',
    },
  ];

  // 找出目前該提示的項目；進度再怎麼怪也會落在最後一項（escape）上。
  function findHintStep(state) {
    return game.HINT_STEPS.find((step) => step.when(state)) || game.HINT_STEPS[game.HINT_STEPS.length - 1];
  }

  game.findHintStep = findHintStep;
})();

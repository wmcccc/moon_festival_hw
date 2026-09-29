window.MoonBunnyGame = window.MoonBunnyGame || {};

(() => {
  const game = window.MoonBunnyGame;
  function getUI() {
    return {
      roomIndex: document.querySelector('#room-index'),
      roomTitle: document.querySelector('#room-title'),
      roomDescription: document.querySelector('#room-description'),
      objectCount: document.querySelector('#object-count'),
      objects: document.querySelector('#room-objects'),
      roomLinks: document.querySelector('#room-links'),
      gameMessage: document.querySelector('#game-message'),
      inventory: document.querySelector('#inventory-list'),
      inventoryCount: document.querySelector('#inventory-count'),
      notes: document.querySelector('#notebook-notes'),
      keypad: document.querySelector('#password-dialog'),
      keypadDisplay: document.querySelector('#keypad-display'),
      keypadMessage: document.querySelector('#keypad-message'),
      victory: document.querySelector('#victory-dialog'),
      objectDialog: document.querySelector('#object-dialog'),
      objectDialogRoom: document.querySelector('#object-dialog-room'),
      objectDialogIcon: document.querySelector('#object-dialog-icon'),
      objectDialogTitle: document.querySelector('#object-dialog-title'),
      objectDialogDescription: document.querySelector('#object-dialog-description'),
      objectDialogContent: document.querySelector('#object-dialog-content'),
      objectDialogMessage: document.querySelector('#object-dialog-message'),
      manualTrigger: document.querySelector('#manual-trigger'),
      manual: document.querySelector('#manual-dialog'),
    };
  }

  function getObjectDetail(object, state) {
    if (object.id === 'vent-grate' && state.progress.ventOpened) return '已敲開，點擊爬入麵粉庫';
    if (object.id === 'chang-e-portrait' && state.progress.portraitGemPlaced) return '暗門已開啟';
    if (object.id === 'glow-wall' && state.clues.flashlightOrder) return '3-2-4-1';
    if (object.id === 'glimmering-well' && state.progress.wellRaised) return '梯子已升起，點擊進入釀造室';
    if (object.id === 'attic-hatch' && state.progress.atticLadderLowered) return '梯子已放下，點擊進入觀星閣';
    if (object.id === 'sugar-tester' && state.progress.sugarTested) return '糖度 100%，門鎖卡榫已放鬆';
    if (object.click.type === 'collect' && state.progress[object.click.once]) return '已取得';
    return object.detail;
  }

  function renderObjects(state, ui) {
    const room = game.ROOM_DATA[state.currentRoom];
    ui.objects.replaceChildren();
    ui.objectCount.textContent = `${String(room.objects.length).padStart(2, '0')} OBJECTS`;

    room.objects.forEach((object) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'object';
      button.dataset.objectId = object.id;
      button.dataset.action = 'interact';
      if (object.id === 'vent-grate' && state.progress.ventOpened) button.classList.add('is-opened');
      if (object.id === 'chang-e-portrait' && state.progress.portraitGemPlaced) button.classList.add('is-opened');
      if (object.id === 'glow-wall' && state.clues.flashlightOrder) button.classList.add('is-glowing');
      if (object.drop) {
        button.classList.add('object-drop-target');
        button.dataset.dropTarget = object.drop.target;
      }

      const icon = document.createElement('span');
      icon.className = 'object-illustration';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = object.icon;

      const name = document.createElement('span');
      name.className = 'object-name';
      name.textContent = object.name;

      const detail = document.createElement('span');
      detail.className = 'object-detail';
      detail.textContent = getObjectDetail(object, state);

      button.append(icon, name, detail);
      ui.objects.append(button);
    });
  }

  function renderVisitedRooms(state, ui) {
    ui.roomLinks.replaceChildren();
    state.visitedRooms.forEach((roomId) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'visited-room';
      button.dataset.visitedRoom = roomId;
      button.textContent = game.ROOMS[roomId].name;
      if (roomId === state.currentRoom) {
        button.disabled = true;
        button.setAttribute('aria-current', 'page');
      }
      ui.roomLinks.append(button);
    });
  }

  function renderInventory(state, ui) {
    ui.inventory.replaceChildren();
    ui.inventoryCount.textContent = String(state.inventory.length).padStart(2, '0');
    if (!state.inventory.length) {
      const empty = document.createElement('li');
      empty.className = 'inventory-empty';
      empty.textContent = '背包目前是空的';
      ui.inventory.append(empty);
      return;
    }

    state.inventory.forEach((itemId) => {
      const item = game.ITEMS[itemId];
      const entry = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'inventory-item';
      button.draggable = true;
      button.dataset.itemId = itemId;
      button.setAttribute('aria-label', `${item.name}，可拖曳`);
      button.textContent = `${item.icon} ${item.name}`;
      entry.append(button);
      ui.inventory.append(entry);
    });
  }

  function objectViewMarkup(view, state) {
    switch (view) {
      case 'sofa':
        return state.progress.hammerFound
          ? '<div class="closeup-art sofa-art">🛋️</div><p>靠墊縫隙已經翻找過了。</p>'
          : '<div class="closeup-art sofa-art">🛋️</div><p>仔細查看靠墊交界的縫隙。</p><button class="modal-action" data-modal-action="search-sofa" type="button">查看縫隙</button>';
      case 'vent':
        return state.progress.ventOpened
          ? '<p class="detail-success">鐵網已鬆脫，可以進入麵粉庫。</p><button class="modal-action" data-modal-action="enter-flour" type="button">進入胡蘿蔔麵粉庫</button>'
          : '<div class="closeup-art vent-art">▦</div><p>鐵網上的螺絲已經生鏽，邊角有些鬆動。</p><div class="modal-drop-target" data-modal-drop="vent">拖曳物件到此</div>';
      case 'portrait':
        return state.progress.portraitGemPlaced
          ? '<div class="closeup-art portrait-art">🖼️</div><p class="detail-success">紅寶石卡入凹槽，畫像移開露出暗門。</p><button class="modal-action" data-modal-action="enter-medicine" type="button">進入廣寒搗藥室</button>'
          : '<div class="closeup-art portrait-art">🖼️<span class="portrait-slot">○</span></div><p>額頭的圓形凹槽邊緣有一道細微的磨痕。</p><div class="modal-drop-target" data-modal-drop="portrait">拖曳物件到此</div>';
      case 'glow-wall':
        return state.clues.flashlightOrder
          ? '<div class="closeup-art glow-wall-art is-revealed">3 - 2 - 4 - 1</div><p class="detail-success">紫光夜光塗層顯示了排列順序，請自行記入手帳。</p>'
          : '<div class="closeup-art glow-wall-art">這是一面普通的大理石牆</div><div class="modal-drop-target" data-modal-drop="glow-wall">拖曳物件到此</div>';
      case 'osmanthus-table':
        return '<div class="closeup-art table-art">🥮　🍵　🍈</div><p>半塊廣式月餅和一頂柚子皮帽放在茶几上，沒有可收集的道具。</p>';
      case 'flour-pile':
        return state.progress.flourPileOpened
          ? '<div class="closeup-art flour-art">☁️　💎</div><p>粉堆裡露出一點紅光。</p><button class="modal-action" data-modal-action="collect-gem" type="button">拾起胡蘿蔔紅寶石</button>'
          : '<div class="closeup-art flour-art">☁️　✧</div><p>麵粉堆深處有微小亮光，撥開粉堆看看。</p><button class="modal-action" data-modal-action="open-flour-pile" type="button">撥開麵粉</button>';
      case 'flashlight-box':
        return state.progress.flashlightBoxOpened
          ? '<div class="closeup-art box-art">📦　🔦</div><button class="modal-action" data-modal-action="collect-flashlight" type="button">拿取月兔手電筒</button>'
          : '<div class="closeup-art box-art">📦</div><p>木箱後方藏著一個兔子圖案的小盒子。</p><button class="modal-action" data-modal-action="open-flashlight-box" type="button">掀開盒蓋</button>';
      case 'mochi-box':
        return state.progress.mochiBoxOpened
          ? '<div class="closeup-art mochi-art">1 : 0</div><p class="detail-success">箱蓋彈開，內側烙印著 `1 : 0`。請自行記錄線索。</p>'
          : `<div class="closeup-art mochi-art">📦</div><p>箱蓋上的細線與內圈刻度似乎有所呼應。</p><label class="dial-control">刻度 <output id="mochi-dial-output">${state.progress.mochiDial}</output><input id="mochi-dial" type="range" min="0" max="9" step="1" value="${state.progress.mochiDial}"></label><button class="modal-action" data-modal-action="open-mochi-box" type="button">試試看</button>`;
      case 'recipe-note-wall':
        return '<div class="closeup-art note-art">月餅百般好，<br>麻糬零瑕疵<br><span>水印　0</span></div><p>便籤下方的「0」水印呼應麻糬麵糰箱上的數字。</p>';
      case 'mortar':
        if (state.progress.osmanthusGround) return '<div class="closeup-art mortar-art">🧪</div><p class="detail-success">桂花已研磨完成，桂花特調藥水在背包裡。</p>';
        if (!state.progress.mortarFilled) return '<div class="closeup-art mortar-art">🥣</div><p>缽底留著淡淡的花香。</p><div class="modal-drop-target" data-modal-drop="mortar">拖曳物件到此</div>';
        return `<div class="closeup-art mortar-art">🥣　🌼</div><p>連擊搗藥杵三次完成研磨。進度：${state.progress.mortarStrikes} / 3</p><button class="modal-action pestle-action" data-modal-action="pestle-strike" type="button">搗一下</button>`;
      case 'well':
        return state.progress.wellRaised
          ? '<div class="closeup-art well-art">🪜</div><p class="detail-success">井水已升起，隱藏梯子通往柚子釀造室。</p><button class="modal-action" data-modal-action="enter-brewery" type="button">下到柚子釀造室</button>'
          : '<div class="closeup-art well-art">🪣</div><p>水面下有個沉重的機關，井壁刻痕延伸至水線。</p><div class="modal-drop-target" data-modal-drop="well">拖曳物件到此</div>';
      case 'herb-cabinet':
        if (state.clues.clue2) return '<div class="closeup-art cabinet-art">2 : 1</div><p class="detail-success">正確抽屜打開，貼紙上寫著 `2 : 1`。請自行記錄線索。</p>';
        if (!state.progress.cabinetHintFound) return '<div class="closeup-art cabinet-art">🗄️</div><p>抽屜上的藥材圖樣排列得有些特別。</p>';
        return `<div class="drawer-grid" aria-label="藥櫃 4 乘 4 抽屜">${Array.from({ length: 16 }, (_, index) => `<button type="button" data-drawer="${index + 1}" aria-label="抽屜 ${index + 1}">${index + 1}</button>`).join('')}</div><p>抽屜圖樣與藥包紙上的線條似乎相互呼應。</p><p class="puzzle-progress">操作進度：${state.progress.cabinetSequence.length} / 3</p>`;
      case 'medicine-packets':
        return state.progress.osmanthusCollected
          ? '<div class="closeup-art herbs-art">🌿　🌼</div><p class="detail-success">鬆開的藥包裡有乾燥桂花。紙背留著一行淡字：「甘草成雙，桂皮伴北斗，黃耆守著十一更的月色。」</p>'
          : '<div class="closeup-art herbs-art">🌿　🌿　🌿</div><p>藥包上的圖樣各不相同，右下角有一處綁繩鬆開了。</p><button class="modal-action" data-modal-action="search-herbs" type="button">檢查藥包</button>';
      case 'distilling-barrel':
        return state.progress.yuzuJuiceFound
          ? '<div class="closeup-art barrel-art">3 : 5</div><p class="detail-success">取樣口已開啟，桶身顯示 `3 : 5`，柚子汁已放入背包。</p>'
          : `<div class="closeup-art barrel-art">🛢️</div><p>黃銅閥門旁刻著：「三更半夜月當空，午時曬日柚正紅」。</p><label class="dial-control">月相 <output id="barrel-hour-output">${state.progress.barrelHour}</output><input id="barrel-hour" type="range" min="0" max="12" step="1" value="${state.progress.barrelHour}"></label><label class="dial-control">日影 <output id="barrel-minute-output">${state.progress.barrelMinute}</output><input id="barrel-minute" type="range" min="0" max="12" step="1" value="${state.progress.barrelMinute}"></label><button class="modal-action" data-modal-action="unlock-barrel" type="button">轉動閥門</button>`;
      case 'yuzu-pile':
        return state.progress.yuzuKeyFound
          ? '<div class="closeup-art yuzu-art">🍊　🗝️</div><p class="detail-success">你已從柚子後方取得金黃柚子鑰匙。</p>'
          : state.progress.yuzuMoves >= 2
            ? '<div class="closeup-art yuzu-art">🍊　✦　🗝️</div><button class="modal-action" data-modal-action="collect-yuzu-key" type="button">拿取金黃柚子鑰匙</button>'
            : `<div class="closeup-art yuzu-art">🍊　🍊　🍊</div><p>柚子堆深處透出一點金色反光。${state.progress.yuzuMoves ? `已移動 ${state.progress.yuzuMoves} 顆。` : ''}</p><button class="modal-action" data-modal-action="move-yuzu" type="button">查看柚子堆</button>`;
      case 'sugar-tester':
        return state.progress.sugarTested
          ? '<div class="closeup-art tester-art">🧪　100%</div><p class="detail-success">指針停在 100% 糖度，天花板門鎖卡榫已放鬆。</p>'
          : '<div class="closeup-art tester-art">🧪　0%</div><p>玻璃試管空著，指針停在刻度起點。</p><div class="modal-drop-target" data-modal-drop="sugar-tester">拖曳物件到此</div>';
      case 'attic-hatch':
        return state.progress.atticLadderLowered
          ? '<div class="closeup-art hatch-art">🪜</div><p class="detail-success">閣樓梯子已放下。</p><button class="modal-action" data-modal-action="enter-observatory" type="button">上樓進入觀星閣</button>'
          : `<div class="closeup-art hatch-art">⌃</div><p>${state.progress.sugarTested ? '門鎖卡榫鬆開，鎖孔露了出來。' : '鎖孔邊緣有淡淡柚香，卡榫似乎卡住了。'}</p>${state.progress.sugarTested ? '<div class="modal-drop-target" data-modal-drop="attic-hatch">拖曳物件到此</div>' : ''}`;
      case 'telescope':
        return state.clues.clue4
          ? '<div class="closeup-art telescope-art is-focused">✦　4 : 8　✦</div><p class="detail-success">星線終於清晰地交會，顯出 `4 : 8`。請自行記錄線索。</p>'
          : !state.progress.telescopeMountFreed
            ? '<div class="closeup-art telescope-art is-blurred">✦　✧　✦</div><p>鏡筒支架的齒輪卡住了，刻度環無法轉動。</p><div class="modal-drop-target" data-modal-drop="telescope">拖曳物件到此</div>'
            : `<div class="closeup-art telescope-art is-blurred" style="--focus-blur:${Math.abs(state.progress.telescopeFocus - 36) / 5}px">✦　✧　✦</div><p>兩個刻度環分別影響星圖方位與影像清晰度。</p><label class="dial-control"><span>方位環</span><output id="angle-output">${state.progress.telescopeAngle}</output>°<input id="telescope-angle" type="range" min="0" max="360" value="${state.progress.telescopeAngle}"></label><label class="dial-control"><span>焦距環</span><output id="focus-output">${state.progress.telescopeFocus}</output><input id="telescope-focus" type="range" min="0" max="100" value="${state.progress.telescopeFocus}"></label><button class="modal-action" data-modal-action="focus-stars" type="button">觀察星空</button>`;
      case 'moon-chart':
        return '<div class="closeup-art chart-art"><span>地球　◯</span><span>　╲　✦ ✦</span><span>月球　◯　✧ ✦</span><span>　╲　✦</span><span>星座　✧</span></div><p>西側月弧與主星連線的交角記為 38°；八顆主星沿著弧線排列。</p>';
      case 'party-table':
        return '<div class="closeup-art party-art">🥤　🥤　🥤<br>🍢　🍢　🍢　🍢　🍢　🍢</div><p>桌上整齊排著 3 盞冷飲與 6 串烤肉籤。旁邊壓著一張派對備忘便籤：</p><p class="note-quote" style="margin:8px 0;padding:9px 12px;background:rgba(243,217,135,0.08);border-left:3px solid var(--moonlight);color:var(--moonlight);font-size:12px;line-height:1.7;">「先備三盞冰露，再進六串炙玉；依序凝望，焦點自明。」</p>';
      case 'star-notebook': {
        const pages = [
          '月弧與主星相交之處，標記著鏡筒應朝的方向。',
          '方位未定之前，焦環上的刻度沒有意義。',
          '若鏡中星影模糊，不妨留意案前冰盞與炙籤之數，以此雙數定其焦距。',
        ];
        return `<div class="closeup-art star-note-art">${pages[state.progress.starNotebookPage]}</div><div class="page-controls"><button class="modal-action" data-modal-action="previous-page" type="button" ${state.progress.starNotebookPage === 0 ? 'disabled' : ''}>上一頁</button><span>${state.progress.starNotebookPage + 1} / ${pages.length}</span><button class="modal-action" data-modal-action="next-page" type="button" ${state.progress.starNotebookPage === pages.length - 1 ? 'disabled' : ''}>下一頁</button></div>`;
      }
      default:
        return `<div class="closeup-art">${object.icon}</div><p>${object.detail}</p>`;
    }
  }

  function openObjectDialog(object, state, message = '') {
    const ui = game.Render.getUI();
    const viewByObject = {
      'vent-grate': 'vent',
      'glimmering-well': 'well',
      'attic-hatch': 'attic-hatch',
    };
    ui.objectDialogRoom.textContent = game.ROOMS[state.currentRoom].name;
    ui.objectDialogIcon.textContent = object.icon;
    ui.objectDialogTitle.textContent = object.name;
    ui.objectDialogDescription.textContent = object.category || '場景物件近景';
    ui.objectDialogContent.innerHTML = objectViewMarkup(object.click.view || viewByObject[object.id], state);
    ui.objectDialogMessage.textContent = message;
    ui.objectDialog.dataset.objectId = object.id;
    if (!ui.objectDialog.open) ui.objectDialog.showModal();
  }

  function renderGame(state, ui) {
    const room = game.ROOMS[state.currentRoom];
    const description = game.ROOM_DATA[state.currentRoom].description;
    document.body.dataset.room = state.currentRoom;
    ui.roomIndex.innerHTML = `CURRENT ROOM <span>・</span> ${room.index}`;
    ui.roomTitle.textContent = room.name;
    ui.roomDescription.textContent = description;
    ui.notes.value = state.notes;
    renderObjects(state, ui);
    renderVisitedRooms(state, ui);
    renderInventory(state, ui);
  }

  function setMessage(ui, message) {
    ui.gameMessage.textContent = message;
  }

  function openKeypad(ui) {
    ui.keypadMessage.textContent = '';
    ui.keypadDisplay.textContent = '----';
    if (!ui.keypad.open) ui.keypad.showModal();
  }

  function closeKeypad(ui) {
    if (ui.keypad.open) ui.keypad.close();
  }

  function updateKeypad(ui, value) {
    ui.keypadDisplay.textContent = value.padEnd(4, '—');
  }

  function showVictory(ui) {
    if (!ui.victory.open) ui.victory.showModal();
  }

  function closeObjectDialog(ui) {
    if (ui.objectDialog.open) ui.objectDialog.close();
  }

  function openManual(ui) {
    if (!ui.manual.open) ui.manual.showModal();
  }

  function closeManual(ui) {
    if (ui.manual.open) ui.manual.close();
  }

  game.Render = { getUI, renderGame, setMessage, openKeypad, closeKeypad, updateKeypad, showVictory, openObjectDialog, closeObjectDialog, openManual, closeManual };
})();
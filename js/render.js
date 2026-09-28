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
      objectDialog: document.querySelector('#object-dialog'),
      objectDialogRoom: document.querySelector('#object-dialog-room'),
      objectDialogIcon: document.querySelector('#object-dialog-icon'),
      objectDialogTitle: document.querySelector('#object-dialog-title'),
      objectDialogDescription: document.querySelector('#object-dialog-description'),
      objectDialogContent: document.querySelector('#object-dialog-content'),
      objectDialogMessage: document.querySelector('#object-dialog-message'),
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
      button.setAttribute('aria-label', `拖曳${item.name}到場景物件`);
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
          : '<div class="closeup-art vent-art">▦</div><p>鐵網的螺絲鎖得很緊，將金屬小鐵鎚拖到下方的鐵網位置。</p><div class="modal-drop-target" data-modal-drop="vent">將金屬小鐵鎚拖曳到這裡</div>';
      case 'portrait':
        return state.progress.portraitGemPlaced
          ? '<div class="closeup-art portrait-art">🖼️</div><p class="detail-success">紅寶石卡入凹槽，畫像移開露出暗門。</p><button class="modal-action" data-modal-action="enter-medicine" type="button">進入廣寒搗藥室</button>'
          : '<div class="closeup-art portrait-art">🖼️<span class="portrait-slot">○</span></div><p>畫像額頭有一個圓形凹槽，將胡蘿蔔紅寶石拖曳至凹槽。</p><div class="modal-drop-target" data-modal-drop="portrait">紅寶石凹槽</div>';
      case 'glow-wall':
        return state.clues.flashlightOrder
          ? '<div class="closeup-art glow-wall-art is-revealed">3 - 2 - 4 - 1</div><p class="detail-success">紫光夜光塗層顯示了排列順序，請自行記入手帳。</p>'
          : '<div class="closeup-art glow-wall-art">這是一面普通的大理石牆</div><p>將月兔手電筒拖曳到牆面顯影。</p><div class="modal-drop-target" data-modal-drop="glow-wall">照亮牆面</div>';
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
          : `<div class="closeup-art mochi-art">📦</div><p>旋轉刻度盤，將指示線對準烤箱標籤指示線（刻度 5）。</p><label class="dial-control">刻度 <output id="mochi-dial-output">${state.progress.mochiDial}</output><input id="mochi-dial" type="range" min="0" max="9" step="1" value="${state.progress.mochiDial}"></label><button class="modal-action" data-modal-action="open-mochi-box" type="button">對準並打開</button>`;
      case 'recipe-note-wall':
        return '<div class="closeup-art note-art">月餅百般好，<br>麻糬零瑕疵<br><span>水印　0</span></div><p>便籤下方的「0」水印呼應麻糬麵糰箱上的數字。</p>';
      case 'mortar':
        if (state.progress.osmanthusGround) return '<div class="closeup-art mortar-art">🧪</div><p class="detail-success">桂花已研磨完成，桂花特調藥水在背包裡。</p>';
        if (!state.progress.mortarFilled) return '<div class="closeup-art mortar-art">🥣</div><p>將背包裡的乾燥桂花拖入搗藥缽。</p><div class="modal-drop-target" data-modal-drop="mortar">搗藥缽</div>';
        return `<div class="closeup-art mortar-art">🥣　🌼</div><p>連擊搗藥杵三次完成研磨。進度：${state.progress.mortarStrikes} / 3</p><button class="modal-action pestle-action" data-modal-action="pestle-strike" type="button">搗一下</button>`;
      case 'well':
        return state.progress.wellRaised
          ? '<div class="closeup-art well-art">🪜</div><p class="detail-success">井水已升起，隱藏梯子通往柚子釀造室。</p><button class="modal-action" data-modal-action="enter-brewery" type="button">下到柚子釀造室</button>'
          : '<div class="closeup-art well-art">🪣</div><p>深井機關連著水面，將桂花特調藥水倒入井中。</p><div class="modal-drop-target" data-modal-drop="well">倒入藥水</div>';
      case 'herb-cabinet':
        if (state.clues.clue2) return '<div class="closeup-art cabinet-art">2 : 1</div><p class="detail-success">正確抽屜打開，貼紙上寫著 `2 : 1`。請自行記錄線索。</p>';
        if (!state.progress.cabinetHintFound) return '<div class="closeup-art cabinet-art">🗄️</div><p>抽屜面板有 4 × 4 個位置。先檢查中藥抓藥包上的軌跡圖再來解鎖。</p>';
        return `<div class="drawer-grid" aria-label="藥櫃 4 乘 4 抽屜">${Array.from({ length: 16 }, (_, index) => `<button type="button" data-drawer="${index + 1}" aria-label="抽屜 ${index + 1}">${index + 1}</button>`).join('')}</div><p>依序點選軌跡上的藥罐位置：甘草 → 桂皮 → 黃耆。</p><p class="puzzle-progress">操作進度：${state.progress.cabinetSequence.length} / 3</p>`;
      case 'medicine-packets':
        return state.progress.osmanthusCollected
          ? '<div class="closeup-art herbs-art">🌿　🌼</div><p class="detail-success">已取出綁繩鬆脫藥包中的乾燥桂花。包裝上的幾何軌跡提示順序：甘草 → 桂皮 → 黃耆。</p>'
          : '<div class="closeup-art herbs-art">🌿　🌿　🌿</div><p>右下角有一個綁繩鬆脫的藥包，背景包裝紙畫著幾何軌跡。</p><button class="modal-action" data-modal-action="search-herbs" type="button">查看鬆脫的藥包</button>';
      case 'distilling-barrel':
        return state.progress.yuzuJuiceFound
          ? '<div class="closeup-art barrel-art">3 : 5</div><p class="detail-success">取樣口已開啟，桶身顯示 `3 : 5`，柚子汁已放入背包。</p>'
          : `<div class="closeup-art barrel-art">🛢️</div><p>燈謎：「三更半夜月當空，午時曬日柚正紅」。將時辰刻度轉到 3 與 12。</p><label class="dial-control">月時 <output id="barrel-hour-output">${state.progress.barrelHour}</output><input id="barrel-hour" type="range" min="0" max="12" step="1" value="${state.progress.barrelHour}"></label><label class="dial-control">日時 <output id="barrel-minute-output">${state.progress.barrelMinute}</output><input id="barrel-minute" type="range" min="0" max="12" step="1" value="${state.progress.barrelMinute}"></label><button class="modal-action" data-modal-action="unlock-barrel" type="button">轉動閥門</button>`;
      case 'yuzu-pile':
        return state.progress.yuzuKeyFound
          ? '<div class="closeup-art yuzu-art">🍊　🗝️</div><p class="detail-success">你已從柚子後方取得金黃柚子鑰匙。</p>'
          : state.progress.yuzuMoves >= 2
            ? '<div class="closeup-art yuzu-art">🍊　✦　🗝️</div><button class="modal-action" data-modal-action="collect-yuzu-key" type="button">拿取金黃柚子鑰匙</button>'
            : `<div class="closeup-art yuzu-art">🍊　🍊　🍊</div><p>移開前方大柚子，查看後方角落。已移開 ${state.progress.yuzuMoves} / 2 顆。</p><button class="modal-action" data-modal-action="move-yuzu" type="button">移開一顆柚子</button>`;
      case 'sugar-tester':
        return state.progress.sugarTested
          ? '<div class="closeup-art tester-art">🧪　100%</div><p class="detail-success">指針停在 100% 糖度，天花板門鎖卡榫已放鬆。</p>'
          : '<div class="closeup-art tester-art">🧪　0%</div><p>將釀造桶柚子汁拖進玻璃試管。</p><div class="modal-drop-target" data-modal-drop="sugar-tester">滴入試管</div>';
      case 'attic-hatch':
        return state.progress.atticLadderLowered
          ? '<div class="closeup-art hatch-art">🪜</div><p class="detail-success">閣樓梯子已放下。</p><button class="modal-action" data-modal-action="enter-observatory" type="button">上樓進入觀星閣</button>'
          : `<div class="closeup-art hatch-art">⌃</div><p>${state.progress.sugarTested ? '卡榫已放鬆，將柚子鑰匙拖至鎖孔。' : '鎖孔近景。先讓糖分測試儀觸發卡榫，再使用柚子鑰匙。'}</p>${state.progress.sugarTested ? '<div class="modal-drop-target" data-modal-drop="attic-hatch">轉動門鎖</div>' : ''}`;
      case 'telescope':
        return state.progress.telescopeFocus >= 80
          ? '<div class="closeup-art telescope-art is-focused">✦　4 : 8　✦</div><p class="detail-success">星星連線清晰呈現 `4 : 8`。請自行記錄線索。</p>'
          : `<div class="closeup-art telescope-art is-blurred" style="--focus-blur:${Math.max(0, (100 - state.progress.telescopeFocus) / 12)}px">✦　✧　✦</div><p>滑動調焦滾輪，讓模糊星空逐漸清晰。</p><label class="dial-control">焦距 <output id="focus-output">${state.progress.telescopeFocus}</output>%<input id="telescope-focus" type="range" min="0" max="100" value="${state.progress.telescopeFocus}"></label><button class="modal-action" data-modal-action="focus-stars" type="button">對焦觀星</button>`;
      case 'moon-chart':
        return '<div class="closeup-art chart-art"><span>地球　◯</span><span>　╲　✦</span><span>月球　◯　✧</span><span>　╲　✦</span><span>星座　✧</span></div><p>沿著月球軌跡弧線尋找亮星，再依圖上的角度調整望遠鏡方向與焦距。</p>';
      case 'party-table':
        return '<div class="closeup-art party-art">🍢　🍡　🥤</div><p>烤肉架、棉花糖和飲品都已經準備好了，月兔逃出去就能參加派對。</p>';
      case 'star-notebook': {
        const pages = ['先查看星象圖上的方位角。', '沿月球軌跡尋找亮星連線。', '調整望遠鏡焦距，直到星點清晰。'];
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

  game.Render = { getUI, renderGame, setMessage, openKeypad, closeKeypad, updateKeypad, showVictory, openObjectDialog, closeObjectDialog };
})();
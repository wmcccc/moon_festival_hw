window.MoonBunnyGame = window.MoonBunnyGame || {};

(() => {
  const game = window.MoonBunnyGame;
  const clueLabels = {
    clue1: '房間 1',
    clue2: '房間 2',
    clue3: '房間 3',
    clue4: '房間 4',
    flashlightOrder: '暗光排列順序',
  };

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
      clues: document.querySelector('#clue-list'),
      notes: document.querySelector('#notebook-notes'),
      keypad: document.querySelector('#password-dialog'),
      keypadDisplay: document.querySelector('#keypad-display'),
      keypadMessage: document.querySelector('#keypad-message'),
      victory: document.querySelector('#victory-dialog'),
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

  function renderClues(state, ui) {
    ui.clues.querySelectorAll('[data-clue-id]').forEach((entry) => {
      const clueId = entry.dataset.clueId;
      const value = state.clues[clueId];
      if (clueId === 'flashlightOrder' && !value) {
        entry.hidden = true;
        return;
      }
      entry.hidden = false;
      const copy = entry.querySelector('.clue-copy');
      copy.querySelector('strong').textContent = clueLabels[clueId];
      copy.querySelector('span').textContent = value || '尚未發現';
    });
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
    renderClues(state, ui);
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

  game.Render = { getUI, renderGame, setMessage, openKeypad, closeKeypad, updateKeypad, showVictory };
})();
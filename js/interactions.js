window.MoonBunnyGame = window.MoonBunnyGame || {};

(() => {
  const game = window.MoonBunnyGame;
  const PASSWORD = '5180';

  function bindInteractions(state, ui, render) {
    let keypadInput = '';
    let draggedItem = '';

    function refresh(message) {
      if (message) game.Render.setMessage(ui, message);
      game.Render.renderGame(state, ui);
    }

    function hasItem(itemId) {
      return state.inventory.includes(itemId);
    }

    function addItem(itemId, onceFlag, message) {
      if (onceFlag && state.progress[onceFlag]) {
        game.Render.setMessage(ui, `背包裡已經沒有其他${game.ITEMS[itemId].name}了。`);
        return;
      }
      if (!hasItem(itemId)) state.inventory.push(itemId);
      if (onceFlag) state.progress[onceFlag] = true;
      refresh(message);
    }

    function removeItem(itemId) {
      state.inventory = state.inventory.filter((item) => item !== itemId);
    }

    function enterRoom(roomId) {
      if (!state.unlockedRooms[roomId]) {
        game.Render.setMessage(ui, '這條路目前還無法通行。');
        return;
      }
      state.currentRoom = roomId;
      if (!state.visitedRooms.includes(roomId)) state.visitedRooms.push(roomId);
      refresh(`你來到了${game.ROOMS[roomId].name}。`);
    }

    function unlockRoom(roomId) {
      state.unlockedRooms[roomId] = true;
    }

    function interact(object) {
      const action = object.click;
      switch (action.type) {
        case 'keypad':
          keypadInput = '';
          game.Render.openKeypad(ui);
          game.Render.updateKeypad(ui, keypadInput);
          break;
        case 'collect':
          addItem(action.item, action.once, action.message);
          break;
        case 'vent':
          if (state.progress.ventOpened) {
            enterRoom('flourStorage');
          } else {
            game.Render.setMessage(ui, '鐵網鎖得很緊。');
          }
          break;
        case 'travel':
          enterRoom(action.room);
          break;
        case 'portrait':
          if (state.progress.portraitGemPlaced) enterRoom('medicineRoom');
          else game.Render.setMessage(ui, '畫像額頭的凹槽形狀。');
          break;
        case 'clue':
          state.clues[action.clue] = action.value;
          refresh(action.message);
          break;
        case 'mortar':
          if (state.progress.osmanthusGround) {
            game.Render.setMessage(ui, '乾燥桂花已經搗成特調藥水了。');
          } else if (!hasItem('driedOsmanthus')) {
            game.Render.setMessage(ui, '搗藥缽裡還缺少材料。');
          } else {
            removeItem('driedOsmanthus');
            state.progress.osmanthusGround = true;
            state.inventory.push('osmanthusPotion');
            refresh('你將乾燥桂花放入玉兔搗藥缽，搗碎後調製成桂花特調藥水。');
          }
          break;
        case 'well':
          if (state.progress.wellRaised) {
            enterRoom('brewery');
          } else if (!hasItem('osmanthusPotion')) {
            game.Render.setMessage(ui, '井水深處有重力感應機關。');
          } else {
            game.Render.setMessage(ui, '將東西丟進井裡，讓水面升起。');
          }
          break;
        case 'attic':
          if (state.progress.atticLadderLowered) {
            enterRoom('observatory');
          } else if (!state.progress.sugarTested) {
            game.Render.setMessage(ui, '門鎖卡榫還卡著。');
          } else {
            game.Render.setMessage(ui, '門鎖卡榫還卡著。');
          }
          break;
        case 'barrel':
          state.clues.clue3 = '3 : 5';
          if (!state.progress.yuzuJuiceFound) {
            state.progress.yuzuJuiceFound = true;
            state.inventory.push('yuzuJuice');
          }
          refresh('解開桶身燈謎「三更半夜月當空，午時曬日柚正紅」，顯出線索 3：3 : 5。你也取了一小瓶釀造桶汁液。');
          break;
        case 'safe':
          if (state.progress.safeOpened) game.Render.setMessage(ui, '中秋禮盒保險箱已經打開了。');
          else game.Render.openSafe(ui);
          break;
        default:
          game.Render.setMessage(ui, action.message || object.detail);
      }
    }

    function handleDrop(itemId, object) {
      if (!object.drop) return;
      if (itemId !== object.drop.item) {
        game.Render.setMessage(ui, `「${game.ITEMS[itemId]?.name || itemId}」似乎不能用在${object.name}上。`);
        return;
      }

      switch (object.drop.target) {
        case 'vent':
          if (state.progress.ventOpened) return;
          state.progress.ventOpened = true;
          unlockRoom('flourStorage');
          refresh('你用金屬小鐵鎚敲開鐵網，通風管裡透出一點麵粉香。點擊鐵網即可爬入麵粉庫。');
          break;
        case 'portrait':
          if (state.progress.portraitGemPlaced) return;
          removeItem(itemId);
          state.progress.portraitGemPlaced = true;
          unlockRoom('medicineRoom');
          refresh('紅寶石嵌入嫦娥畫像的額頭，畫像旁的暗門應聲開啟。點擊畫像即可進入廣寒搗藥室。');
          break;
        case 'glow-wall':
          state.clues.flashlightOrder = '3-2-4-1';
          refresh('3-2-4-1');
          break;
        case 'well':
          if (state.progress.wellRaised) return;
          removeItem(itemId);
          state.progress.wellRaised = true;
          unlockRoom('brewery');
          refresh('你將桂花特調藥水倒進井裡，水面升起，露出通往柚子釀造室的梯子。再點一次水井即可下去。');
          break;
        case 'sugar-tester':
          if (state.progress.sugarTested) return;
          removeItem(itemId);
          state.progress.sugarTested = true;
          refresh('釀造桶汁液滴入測試儀，指針顯示糖度 100%，天花板門鎖卡榫隨之放鬆。');
          break;
        case 'attic-hatch':
          if (!state.progress.sugarTested) {
            game.Render.setMessage(ui, '小門的卡榫仍卡著。先使用糖分測試儀讓卡榫放鬆。');
            return;
          }
          if (state.progress.atticLadderLowered) return;
          state.progress.atticLadderLowered = true;
          unlockRoom('observatory');
          refresh('你用金黃柚子鑰匙打開小門，閣樓梯子緩緩放下。點擊小門即可上樓。');
          break;
      }
    }

    function submitSafeCode() {
      if (ui.safeCode.value.trim() !== '248') {
        ui.safeMessage.textContent = '密碼不正確，請再觀察星象圖與派對桌。';
        return;
      }
      state.progress.safeOpened = true;
      if (!state.progress.goldenPastryCollected) {
        state.progress.goldenPastryCollected = true;
        state.inventory.push('goldenPastry');
      }
      game.Render.closeSafe(ui);
      refresh('保險箱打開了！你獲得終極蛋黃酥，解鎖中秋派對成就。');
    }

    function submitPassword() {
      if (keypadInput !== PASSWORD) {
        ui.keypadMessage.textContent = '密碼不正確，再試一次。';
        keypadInput = '';
        game.Render.updateKeypad(ui, keypadInput);
        return;
      }
      state.progress.escaped = true;
      game.Render.closeKeypad(ui);
      game.Render.setMessage(ui, '月亮大門打開了！月兔成功逃出廣寒宮。');
      game.Render.showVictory(ui);
    }

    function pressKey(key) {
      if (key === 'clear') keypadInput = '';
      else if (key === 'delete') keypadInput = keypadInput.slice(0, -1);
      else if (/^\d$/.test(key) && keypadInput.length < 4) keypadInput += key;
      game.Render.updateKeypad(ui, keypadInput);
      ui.keypadMessage.textContent = '';
    }

    ui.objects.addEventListener('click', (event) => {
      const button = event.target.closest('[data-object-id]');
      if (!button) return;
      const room = game.ROOM_DATA[state.currentRoom];
      const object = room.objects.find((entry) => entry.id === button.dataset.objectId);
      if (object) interact(object);
    });

    ui.roomLinks.addEventListener('click', (event) => {
      const button = event.target.closest('[data-visited-room]');
      if (button && !button.disabled) enterRoom(button.dataset.visitedRoom);
    });

    ui.inventory.addEventListener('dragstart', (event) => {
      const item = event.target.closest('[data-item-id]');
      if (!item) return;
      draggedItem = item.dataset.itemId;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedItem);
    });

    ui.inventory.addEventListener('dragend', () => {
      draggedItem = '';
      ui.objects.querySelectorAll('.is-drop-ready').forEach((target) => target.classList.remove('is-drop-ready'));
    });

    ui.objects.addEventListener('dragover', (event) => {
      const target = event.target.closest('[data-drop-target]');
      if (!target) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      target.classList.add('is-drop-ready');
      target.setAttribute('aria-dropeffect', 'move');
    });

    ui.objects.addEventListener('dragleave', (event) => {
      const target = event.target.closest('[data-drop-target]');
      if (target && !target.contains(event.relatedTarget)) {
        target.classList.remove('is-drop-ready');
        target.removeAttribute('aria-dropeffect');
      }
    });

    ui.objects.addEventListener('drop', (event) => {
      const target = event.target.closest('[data-drop-target]');
      if (!target) return;
      event.preventDefault();
      target.classList.remove('is-drop-ready');
      target.removeAttribute('aria-dropeffect');
      const itemId = event.dataTransfer.getData('text/plain') || draggedItem;
      const object = game.ROOM_DATA[state.currentRoom].objects.find((entry) => entry.id === target.dataset.objectId);
      if (itemId && object) handleDrop(itemId, object);
    });

    ui.notes.addEventListener('input', () => {
      state.notes = ui.notes.value;
    });

    ui.keypad.addEventListener('click', (event) => {
      const key = event.target.closest('[data-key]');
      if (key) pressKey(key.dataset.key);
      if (event.target.closest('#keypad-submit')) submitPassword();
    });

    document.addEventListener('keydown', (event) => {
      if (!ui.keypad.open) return;
      if (/^\d$/.test(event.key)) pressKey(event.key);
      else if (event.key === 'Backspace') pressKey('delete');
      else if (event.key === 'Enter') submitPassword();
    });

    ui.victory.querySelector('#victory-close').addEventListener('click', () => ui.victory.close());
    ui.safe.querySelector('#safe-close').addEventListener('click', () => game.Render.closeSafe(ui));
    ui.safe.querySelector('#safe-submit').addEventListener('click', submitSafeCode);
    ui.safeCode.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitSafeCode();
      }
    });
  }

  game.Interactions = { bindInteractions };
})();
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

    function refreshObjectDialog(message = '') {
      const objectId = ui.objectDialog.dataset.objectId;
      if (!ui.objectDialog.open || !objectId) return;
      const object = game.ROOM_DATA[state.currentRoom].objects.find((entry) => entry.id === objectId);
      if (object) game.Render.openObjectDialog(object, state, message);
    }

    function openDetail(object, view = object.click.view) {
      game.Render.openObjectDialog({ ...object, click: { ...object.click, view } }, state);
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
          openDetail(object, 'vent');
          break;
        case 'travel':
          enterRoom(action.room);
          break;
        case 'portrait':
          openDetail(object, 'portrait');
          break;
        case 'clue':
          state.clues[action.clue] = action.value;
          refresh(action.message);
          break;
        case 'detail':
          if (action.view === 'moon-chart') state.progress.starChartViewed = true;
          if (action.view === 'party-table') state.progress.partyTableSearched = true;
          if (action.view === 'star-notebook') state.progress.observatoryNotesRead = true;
          if (action.view === 'recipe-note-wall') state.progress.recipeNoteRead = true;
          openDetail(object);
          break;
        case 'well':
          openDetail(object, 'well');
          break;
        case 'attic':
          openDetail(object, 'attic-hatch');
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
          refreshObjectDialog('鐵網鬆脫了。');
          break;
        case 'portrait':
          if (state.progress.portraitGemPlaced) return;
          removeItem(itemId);
          state.progress.portraitGemPlaced = true;
          unlockRoom('medicineRoom');
          refresh('紅寶石嵌入嫦娥畫像的額頭，畫像旁的暗門應聲開啟。點擊畫像即可進入廣寒搗藥室。');
          refreshObjectDialog('機關發出卡榫聲，畫像移開露出暗門。');
          break;
        case 'glow-wall':
          state.clues.flashlightOrder = '3-2-4-1';
          refresh('3-2-4-1');
          refreshObjectDialog('紫光夜光塗層顯影：3 - 2 - 4 - 1。請自行抄錄。');
          break;
        case 'mortar':
          if (state.progress.mortarFilled || state.progress.osmanthusGround) return;
          removeItem(itemId);
          state.progress.mortarFilled = true;
          game.Render.renderGame(state, ui);
          refreshObjectDialog('乾燥桂花已放入搗藥缽。');
          break;
        case 'well':
          if (state.progress.wellRaised) return;
          removeItem(itemId);
          state.progress.wellRaised = true;
          unlockRoom('brewery');
          refresh('你將桂花特調藥水倒進井裡，水面升起，露出通往柚子釀造室的梯子。再點一次水井即可下去。');
          refreshObjectDialog('井水升起，隱藏梯子已露出。');
          break;
        case 'sugar-tester':
          if (state.progress.sugarTested) return;
          removeItem(itemId);
          state.progress.sugarTested = true;
          refresh('釀造桶汁液滴入測試儀，指針顯示糖度 100%，天花板門鎖卡榫隨之放鬆。');
          refreshObjectDialog('指針轉至 100%，門鎖卡榫已放鬆。');
          break;
        case 'attic-hatch':
          if (!state.progress.sugarTested) {
            game.Render.setMessage(ui, '門鎖卡住，紋絲不動。');
            return;
          }
          if (state.progress.atticLadderLowered) return;
          state.progress.atticLadderLowered = true;
          unlockRoom('observatory');
          refresh('你用金黃柚子鑰匙打開小門，閣樓梯子緩緩放下。點擊小門即可上樓。');
          refreshObjectDialog('鎖孔轉動，梯子已經放下。');
          break;
        case 'telescope':
          if (state.progress.telescopeMountFreed) return;
          state.progress.telescopeMountFreed = true;
          refresh('望遠鏡支架的齒輪鬆開了。');
          refreshObjectDialog('鏡筒可以活動，兩個刻度環也能轉動了。');
          break;
      }
    }

    function handleModalAction(action) {
      const objectId = ui.objectDialog.dataset.objectId;
      const object = game.ROOM_DATA[state.currentRoom].objects.find((entry) => entry.id === objectId);
      const update = (message) => {
        game.Render.renderGame(state, ui);
        refreshObjectDialog(message);
      };

      switch (action) {
        case 'search-sofa':
          if (!state.progress.hammerFound) {
            state.progress.hammerFound = true;
            state.inventory.push('hammer');
            update('你從靠墊縫隙裡找到金屬小鐵鎚。');
          }
          break;
        case 'enter-flour':
          game.Render.closeObjectDialog(ui);
          enterRoom('flourStorage');
          break;
        case 'enter-medicine':
          game.Render.closeObjectDialog(ui);
          enterRoom('medicineRoom');
          break;
        case 'open-flour-pile':
          state.progress.flourPileOpened = true;
          update('麵粉被撥開，底下閃著紅光。');
          break;
        case 'collect-gem':
          if (!state.progress.gemFound) {
            state.progress.gemFound = true;
            state.inventory.push('carrotGem');
          }
          update('你取得胡蘿蔔紅寶石。');
          break;
        case 'open-flashlight-box':
          state.progress.flashlightBoxOpened = true;
          update('兔兔手電筒盒打開了。');
          break;
        case 'collect-flashlight':
          if (!state.progress.flashlightFound) {
            state.progress.flashlightFound = true;
            state.inventory.push('moonFlashlight');
          }
          update('你取得月兔手電筒。');
          break;
        case 'open-mochi-box':
          if (state.progress.mochiDial === 0) {
            state.progress.mochiBoxOpened = true;
            state.clues.clue1 = '1 : 0';
            update('箱蓋彈開，內側烙印著 1 : 0。請自行記錄線索。');
          } else {
            refreshObjectDialog('旋鈕轉動，箱蓋仍然緊閉。');
          }
          break;
        case 'search-herbs':
          if (!state.progress.osmanthusCollected) {
            state.progress.osmanthusCollected = true;
            state.progress.cabinetHintFound = true;
            state.inventory.push('driedOsmanthus');
          }
          update('你找到乾燥桂花，也記下藥材排列軌跡。');
          break;
        case 'pestle-strike':
          if (!state.progress.mortarFilled || state.progress.osmanthusGround) return;
          state.progress.mortarStrikes += 1;
          if (state.progress.mortarStrikes >= 3) {
            state.progress.osmanthusGround = true;
            state.progress.mortarFilled = false;
            state.inventory.push('osmanthusPotion');
            update('桂花研磨完成，你獲得桂花特調藥水。');
          } else {
            update('搗藥杵落下，繼續搗碎桂花。');
          }
          break;
        case 'enter-brewery':
          game.Render.closeObjectDialog(ui);
          enterRoom('brewery');
          break;
        case 'unlock-barrel':
          if (state.progress.barrelHour === 3 && state.progress.barrelMinute === 12) {
            state.progress.yuzuJuiceFound = true;
            state.clues.clue3 = '3 : 5';
            if (!hasItem('yuzuJuice')) state.inventory.push('yuzuJuice');
            update('閥門解鎖，取樣口露出 3 : 5 刻印，你也取得釀造桶柚子汁。');
          } else {
            refreshObjectDialog('閥門轉動了一下，又卡回原位。');
          }
          break;
        case 'move-yuzu':
          state.progress.yuzuMoves = Math.min(2, state.progress.yuzuMoves + 1);
          update(state.progress.yuzuMoves === 2 ? '兩顆大柚子移開了，後方露出一把鑰匙。' : '你移開一顆大柚子。');
          break;
        case 'collect-yuzu-key':
          if (!state.progress.yuzuKeyFound) {
            state.progress.yuzuKeyFound = true;
            state.inventory.push('yuzuKey');
          }
          update('你取得金黃柚子鑰匙。');
          break;
        case 'enter-observatory':
          game.Render.closeObjectDialog(ui);
          enterRoom('observatory');
          break;
        case 'focus-stars':
          if (!state.progress.telescopeMountFreed) {
            refreshObjectDialog('鏡筒支架卡住了，刻度環無法轉動。');
          } else if (state.progress.telescopeAngle !== 38) {
            refreshObjectDialog('鏡筒方位尚未對準星象圖指示的交角。');
          } else if (state.progress.telescopeFocus !== 36) {
            refreshObjectDialog('星點仍然有些重疊分散，焦距還需要微調。');
          } else if (!state.progress.starChartViewed || !state.progress.partyTableSearched || !state.progress.observatoryNotesRead) {
            refreshObjectDialog('星點隱約成形，但似乎還需翻閱觀星手稿與各項線索確認細節。');
          } else {
            state.clues.clue4 = '4 : 8';
            update('星星連線顯現 4 : 8。請自行記錄線索。');
          }
          break;
        case 'previous-page':
          state.progress.starNotebookPage = Math.max(0, state.progress.starNotebookPage - 1);
          update();
          break;
        case 'next-page':
          state.progress.starNotebookPage = Math.min(2, state.progress.starNotebookPage + 1);
          update();
          break;
        default:
          if (action.startsWith('drawer-')) {
            const selected = Number(action.slice('drawer-'.length));
            if (!state.progress.cabinetHintFound) return;
            const solution = [2, 7, 11];
            const expected = solution[state.progress.cabinetSequence.length];
            if (selected === expected) {
              state.progress.cabinetSequence.push(selected);
              if (state.progress.cabinetSequence.length === solution.length) state.clues.clue2 = '2 : 1';
              update(state.clues.clue2 ? '抽屜打開，貼紙顯示 2 : 1。請自行記錄線索。' : '這個抽屜位置正確，繼續沿軌跡尋找。');
            } else {
              state.progress.cabinetSequence = [];
              update('抽屜彈回原位。');
            }
          }
      }

    }

    function handleModalDrop(itemId, target) {
      const object = game.ROOM_DATA[state.currentRoom].objects.find((entry) => entry.drop?.target === target);
      if (object) handleDrop(itemId, object);
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

    ui.objectDialogContent.addEventListener('click', (event) => {
      const action = event.target.closest('[data-modal-action]');
      const drawer = event.target.closest('[data-drawer]');
      if (action) handleModalAction(action.dataset.modalAction);
      else if (drawer) handleModalAction(`drawer-${drawer.dataset.drawer}`);
    });

    ui.objectDialogContent.addEventListener('input', (event) => {
      const control = event.target;
      if (control.id === 'mochi-dial') {
        state.progress.mochiDial = Number(control.value);
        ui.objectDialogContent.querySelector('#mochi-dial-output').value = control.value;
      } else if (control.id === 'barrel-hour') {
        state.progress.barrelHour = Number(control.value);
        ui.objectDialogContent.querySelector('#barrel-hour-output').value = control.value;
      } else if (control.id === 'barrel-minute') {
        state.progress.barrelMinute = Number(control.value);
        ui.objectDialogContent.querySelector('#barrel-minute-output').value = control.value;
      } else if (control.id === 'telescope-focus') {
        state.progress.telescopeFocus = Number(control.value);
        ui.objectDialogContent.querySelector('#focus-output').value = control.value;
        const art = ui.objectDialogContent.querySelector('.telescope-art');
        art.style.setProperty('--focus-blur', `${Math.abs(state.progress.telescopeFocus - 36) / 5}px`);
      } else if (control.id === 'telescope-angle') {
        state.progress.telescopeAngle = Number(control.value);
        ui.objectDialogContent.querySelector('#angle-output').value = control.value;
      }
    });

    ui.objectDialogContent.addEventListener('dragover', (event) => {
      const target = event.target.closest('[data-modal-drop]');
      if (!target) return;
      event.preventDefault();
      target.classList.add('is-drop-ready');
      event.dataTransfer.dropEffect = 'move';
    });

    ui.objectDialogContent.addEventListener('dragleave', (event) => {
      const target = event.target.closest('[data-modal-drop]');
      if (target && !target.contains(event.relatedTarget)) target.classList.remove('is-drop-ready');
    });

    ui.objectDialogContent.addEventListener('drop', (event) => {
      const target = event.target.closest('[data-modal-drop]');
      if (!target) return;
      event.preventDefault();
      target.classList.remove('is-drop-ready');
      const itemId = event.dataTransfer.getData('text/plain') || draggedItem;
      if (itemId) handleModalDrop(itemId, target.dataset.modalDrop);
    });

    ui.objectDialog.querySelector('#object-dialog-close').addEventListener('click', () => game.Render.closeObjectDialog(ui));

    ui.manualTrigger.addEventListener('click', () => game.Render.openManual(ui));
    ui.manual.querySelector('#manual-close').addEventListener('click', () => game.Render.closeManual(ui));
    ui.manual.querySelector('#manual-dismiss').addEventListener('click', () => game.Render.closeManual(ui));

    ui.hintTrigger.addEventListener('click', () => game.Render.openHint(state, ui));
    ui.hint.querySelector('#hint-close').addEventListener('click', () => game.Render.closeHint(ui));
    ui.hint.querySelector('#hint-dismiss').addEventListener('click', () => game.Render.closeHint(ui));
    ui.hint.querySelector('#hint-more').addEventListener('click', () => game.Render.revealHintDetail(state, ui));
    ui.hint.addEventListener('close', () => {
      ui.objects.querySelectorAll('.is-hinted').forEach((object) => object.classList.remove('is-hinted'));
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
      // keydown 掛在 document 上，event.target 可能是 document 本身（沒有 closest），
      // 這裡一定要先確認是元素再往下走，否則整個鍵盤事件都會在這裡爆掉。
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, [contenteditable]')) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (ui.hint.open) {
        if (event.key === 'Escape') return; // 交給 <dialog> 自己處理
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          game.Render.closeHint(ui);
        }
        return;
      }

      // 密碼盤開著時，數字鍵盤只服務於密碼輸入。
      if (ui.keypad.open) {
        if (/^\d$/.test(event.key)) pressKey(event.key);
        else if (event.key === 'Backspace') pressKey('delete');
        else if (event.key === 'Enter') submitPassword();
        return;
      }

      const anyDialogOpen = ui.manual.open || ui.objectDialog.open || ui.victory.open;
      if (!anyDialogOpen && (event.key === 'h' || event.key === 'H' || event.key === '?')) {
        event.preventDefault();
        game.Render.openHint(state, ui);
      }
    });

    ui.victory.querySelector('#victory-close').addEventListener('click', () => ui.victory.close());
  }

  game.Interactions = { bindInteractions };
})();
window.MoonBunnyGame = window.MoonBunnyGame || {};

Object.assign(window.MoonBunnyGame, {
  ROOMS: {
    hall: { name: '月宮大廳', index: '00' },
    flourStorage: { name: '胡蘿蔔麵粉庫', index: '01' },
    medicineRoom: { name: '廣寒搗藥室', index: '02' },
    brewery: { name: '柚子釀造室', index: '03' },
    observatory: { name: '月宮觀星閣', index: '04' },
  },
  ITEMS: {
    hammer: { name: '金屬小鐵鎚', icon: '🔨' },
    carrotGem: { name: '胡蘿蔔紅寶石', icon: '💎' },
    moonFlashlight: { name: '月兔手電筒', icon: '🔦' },
    driedOsmanthus: { name: '乾燥桂花', icon: '🌼' },
    osmanthusPotion: { name: '桂花特調藥水', icon: '🧪' },
    yuzuKey: { name: '金黃柚子鑰匙', icon: '🗝️' },
    yuzuJuice: { name: '釀造桶柚子汁', icon: '🧴' },
    goldenPastry: { name: '終極蛋黃酥', icon: '🥮' },
  },
  CLUE_ORDER: ['clue3', 'clue2', 'clue4', 'clue1'],
  createInitialState() {
    return {
      currentRoom: 'hall',
      visitedRooms: ['hall'],
      inventory: [],
      notes: '',
      unlockedRooms: {
        hall: true,
        flourStorage: false,
        medicineRoom: false,
        brewery: false,
        observatory: false,
      },
      progress: {
        hammerFound: false,
        osmanthusCollected: false,
        gemFound: false,
        flashlightFound: false,
        yuzuKeyFound: false,
        yuzuJuiceFound: false,
        ventOpened: false,
        portraitGemPlaced: false,
        osmanthusGround: false,
        wellRaised: false,
        sugarTested: false,
        atticLadderLowered: false,
        safeOpened: false,
        goldenPastryCollected: false,
        escaped: false,
      },
      clues: {
        clue1: null,
        clue2: null,
        clue3: null,
        clue4: null,
        flashlightOrder: null,
      },
    };
  },
});
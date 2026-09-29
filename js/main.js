window.addEventListener('DOMContentLoaded', () => {
  const game = window.MoonBunnyGame;
  const state = game.createInitialState();
  const ui = game.Render.getUI();

  game.Render.renderGame(state, ui);
  game.Interactions.bindInteractions(state, ui, game.Render);

  // 首次進入先秀出遊玩手冊，讓玩家知道道具要拖曳、線索要自己記。
  game.Render.openManual(ui);
});
window.addEventListener('DOMContentLoaded', () => {
  const game = window.MoonBunnyGame;
  const state = game.createInitialState();
  const ui = game.Render.getUI();

  game.Render.renderGame(state, ui);
  game.Interactions.bindInteractions(state, ui, game.Render);
});
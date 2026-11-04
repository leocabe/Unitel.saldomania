(() => {
  'use strict';
  const AWARD_KEY = 'roleta-awarded-prize-v1';
  let savedAward = null;
  try { savedAward = JSON.parse(localStorage.getItem(AWARD_KEY)); } catch {}
  const requestedId = new URLSearchParams(location.search).get('premio');
  const prizeId = requestedId || savedAward?.id;
  const prize = Object.values(window.RoletaPrizes).find(item => item.id === prizeId);
  const $ = id => document.getElementById(id);

  if (!prize) {
    $('emptyState').hidden = false;
    document.title = 'O teu prémio começa na roleta';
    return;
  }

  document.title = `Parabéns! Ganhaste um ${prize.name}`;
  $('welcomePrize').textContent = prize.name;
  $('winnerContent').hidden = false;

  // Ajusta a largura da VSL (9:16) para que caiba inteira no ecrã sem scroll.
  const frame = $('vslContainer');
  const fitVideo = () => {
    frame.style.maxWidth = '';
    const top = frame.getBoundingClientRect().top + scrollY;
    const available = innerHeight - top - 12;
    const width = Math.max(200, Math.floor(available * 9 / 16));
    frame.style.maxWidth = `${width}px`;
  };
  fitVideo();
  addEventListener('resize', fitVideo);
  addEventListener('orientationchange', fitVideo);

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const colors = ['#f27114', '#5b257c', '#ffb784', '#9f70b7'];
    for (let index = 0; index < 24; index++) {
      const piece = document.createElement('span');
      piece.style.left = `${(index + 0.5) / 24 * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${(index % 6) * .12}s`;
      piece.style.transform = `rotate(${index * 37}deg)`;
      $('celebration').appendChild(piece);
    }
    setTimeout(() => $('celebration').replaceChildren(), 4200);
  }
})();

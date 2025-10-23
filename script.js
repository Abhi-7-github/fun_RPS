// script.js — game logic, assertions, and UI updates
(function(){
  // --- Assertions (simple runtime checks) ---
  function assert(condition, message){
    if(!condition) throw new Error("Assertion failed: " + (message||""));
  }

  // DOM
  const choicesEl = document.querySelectorAll('.choice');
  const playerScoreEl = document.getElementById('player-score');
  const computerScoreEl = document.getElementById('computer-score');
  const tiesEl = document.getElementById('ties');
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');
  const resetBtn = document.getElementById('reset');
  const livesEl = document.getElementById('lives');
  const bestOfSelect = document.getElementById('best-of');

  // Game state
  let state = {
    player:0, computer:0, ties:0, lives:3, history:[], bestOf: parseInt(bestOfSelect.value,10)
  };

  // Basic checks
  assert(choicesEl.length === 3, "There must be three choices (rock/paper/scissors).");
  assert(playerScoreEl && computerScoreEl && resultEl, "Required DOM elements missing.");

  // Helper
  function randChoice(){ return ['rock','paper','scissors'][Math.floor(Math.random()*3)]; }
  function outcome(player, comp){
    if(player===comp) return 'tie';
    if(
      (player==='rock' && comp==='scissors') ||
      (player==='paper' && comp==='rock') ||
      (player==='scissors' && comp==='paper')
    ) return 'win';
    return 'lose';
  }

  function updateUI(round){
    playerScoreEl.textContent = state.player;
    computerScoreEl.textContent = state.computer;
    tiesEl.textContent = state.ties;
    livesEl.textContent = '❤'.repeat(Math.max(0,state.lives));
    // history
    historyEl.innerHTML = state.history.slice().reverse().map(h => {
      return `<div class="entry ${h.outcome}">${h.time} — You: ${h.player} vs CPU: ${h.comp} → <strong>${h.outcome.toUpperCase()}</strong></div>`;
    }).join('');
    // final check for best of series
    const roundsNeeded = Math.ceil(state.bestOf/2);
    if(state.player >= roundsNeeded || state.computer >= roundsNeeded){
      const winner = state.player > state.computer ? 'You win the match!' : 'Computer wins the match.';
      resultEl.textContent = winner;
      // disable choices
      choicesEl.forEach(btn => btn.disabled = true);
      // simple confetti trigger for player win
      if(state.player > state.computer) {
        startConfetti();
      }
    }
  }

  // Core handler
  function play(playerChoice, btn){
    try{
      assert(['rock','paper','scissors'].includes(playerChoice), "Invalid player choice.");
      // mark selected
      choicesEl.forEach(b => b.setAttribute('aria-checked','false'));
      if(btn) btn.setAttribute('aria-checked','true');

      const comp = randChoice();
      const res = outcome(playerChoice, comp);

      const entry = { player: playerChoice, comp, outcome: res, time: new Date().toLocaleTimeString() };
      state.history.push(entry);

      if(res === 'win'){ state.player++; resultEl.textContent = "You won this round!"; resultEl.className = 'result win'; }
      else if(res === 'lose'){ state.computer++; state.lives = Math.max(0, state.lives-1); resultEl.textContent = "You lost this round."; resultEl.className = 'result lose'; }
      else { state.ties++; resultEl.textContent = "It's a tie."; resultEl.className = 'result tie'; }

      updateUI();
    }catch(e){
      console.error(e);
      resultEl.textContent = "An error occurred — check console.";
    }
  }

  // Attach listeners
  choicesEl.forEach(btn => {
    btn.addEventListener('click', (ev) => play(btn.dataset.choice, btn));
    btn.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); play(btn.dataset.choice, btn); }
    });
  });

  resetBtn.addEventListener('click', () => {
    state.player = 0; state.computer = 0; state.ties = 0; state.history = []; state.lives = 3;
    choicesEl.forEach(b => b.disabled = false);
    resultEl.textContent = "Pick your move to start.";
    resultEl.className = 'result';
    stopConfetti();
    updateUI();
  });

  bestOfSelect.addEventListener('change', () => {
    state.bestOf = parseInt(bestOfSelect.value,10);
    updateUI();
  });

  // --- Confetti (basic) ---
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas.getContext && confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let confettiRunning = false;
  function resizeCanvas(){ confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function startConfetti(){
    if(!ctx) return;
    confettiRunning = true;
    confettiPieces = Array.from({length:60}).map(() => {
      return {
        x: Math.random()*confettiCanvas.width,
        y: Math.random()*-confettiCanvas.height,
        vx: (Math.random()-0.5)*6,
        vy: Math.random()*6+2,
        r: Math.random()*6+4,
        life: Math.random()*90+60
      };
    });
    requestAnimationFrame(tick);
    setTimeout(()=>{ confettiRunning = false; }, 4000);
  }
  function stopConfetti(){ confettiPieces = []; confettiRunning = false; ctx && ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }
  function tick(){
    if(!ctx) return;
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life/5);
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      ctx.restore();
    });
    confettiPieces = confettiPieces.filter(p => p.life>0 && p.y < confettiCanvas.height+50);
    if(confettiRunning && confettiPieces.length) requestAnimationFrame(tick);
    else ctx && ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }

  // initial render
  updateUI();

  // Expose for testing/debug (non-blocking)
  window.__rps_state = state;
  window.__rps_play = play;

})();

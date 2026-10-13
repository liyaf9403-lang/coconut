// Coconut Oracle Web App Logic

class CoconutAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate an authentic thud + woody crack sound using Web Audio API
  playCrack() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Heavy wooden thud (sine burst dropping in frequency)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

    thudGain.gain.setValueAtTime(0.7, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.16);

    // 2. High snap / crack noise burst
    const bufferSize = this.ctx.sampleRate * 0.12;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass filter to sound like snapping wood/coconut shell
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(now + 0.02);
    whiteNoise.stop(now + 0.14);
  }

  // Musical chime for Blessed
  playBlessedChime() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.2;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  // Low comical buzz for Cursed
  playCursedBuzzer() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Fanfare for Jackpot
  playJackpotFanfare() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.15;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  }
}

class CoconutOracleApp {
  constructor() {
    this.audio = new CoconutAudio();
    this.isCracking = false;
    this.currentOutcome = null;

    // DOM References
    this.dilemmaInput = document.getElementById('dilemmaInput');
    this.clearInputBtn = document.getElementById('clearInputBtn');
    this.smashBtn = document.getElementById('smashBtn');
    this.coconutWrapper = document.getElementById('coconutWrapper');
    this.coconutWhole = document.getElementById('coconutWhole');
    this.hammer = document.getElementById('hammer');
    
    // Result & Art elements
    this.artBlessed = document.getElementById('artBlessed');
    this.artCursed = document.getElementById('artCursed');
    this.artJackpot = document.getElementById('artJackpot');
    this.resultCard = document.getElementById('resultCard');
    this.resultQuote = document.getElementById('resultQuote');
    this.resultBadge = document.getElementById('resultBadge');
    this.resultMessage = document.getElementById('resultMessage');
    this.resetBtn = document.getElementById('resetBtn');
    this.inputSection = document.getElementById('inputSection');
    this.actionBtnArea = document.getElementById('actionBtnArea');
    this.particleRain = document.getElementById('particleRain');

    // Tally & History elements
    this.blessedCountEl = document.getElementById('blessedCount');
    this.cursedCountEl = document.getElementById('cursedCount');
    this.jackpotCountEl = document.getElementById('jackpotCount');
    this.historyList = document.getElementById('historyList');

    // Load State
    this.history = JSON.parse(localStorage.getItem('coco_history') || '[]');
    this.tallies = JSON.parse(localStorage.getItem('coco_tallies') || '{"blessed":0,"cursed":0,"jackpot":0}');

    this.init();
  }

  init() {
    this.renderTallies();
    this.renderHistory();
    this.setupListeners();
    this.updateSmashButtonState();
  }

  setupListeners() {
    // Input listener to enable/disable button
    this.dilemmaInput.addEventListener('input', () => {
      this.updateSmashButtonState();
    });

    // Enter key triggers smash if valid
    this.dilemmaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.smashBtn.disabled && !this.isCracking) {
        this.performSmash();
      }
    });

    // Clear input button
    this.clearInputBtn.addEventListener('click', () => {
      this.dilemmaInput.value = '';
      this.updateSmashButtonState();
      this.dilemmaInput.focus();
    });

    // Tap on smash button
    this.smashBtn.addEventListener('click', () => {
      if (!this.smashBtn.disabled && !this.isCracking) {
        this.performSmash();
      }
    });

    // Tap directly on coconut
    this.coconutWrapper.addEventListener('click', () => {
      if (!this.isCracking) {
        if (!this.dilemmaInput.value.trim()) {
          // Gently focus & pulse the input
          this.dilemmaInput.focus();
          this.dilemmaInput.classList.add('pulse-focus');
          setTimeout(() => this.dilemmaInput.classList.remove('pulse-focus'), 400);
          return;
        }
        this.performSmash();
      }
    });

    // Reset button
    this.resetBtn.addEventListener('click', () => {
      this.resetToHome();
    });
  }

  updateSmashButtonState() {
    const text = this.dilemmaInput.value.trim();
    const hasText = text.length > 0;
    this.smashBtn.disabled = !hasText;
    this.clearInputBtn.style.display = hasText ? 'flex' : 'none';

    if (hasText) {
      this.coconutWrapper.classList.remove('disabled');
    } else {
      this.coconutWrapper.classList.add('disabled');
    }
  }

  // Pick outcome adhering to probability or URL force parameter
  pickOutcome() {
    // 1. Check hidden URL query parameter ?force=blessed|cursed|jackpot
    const urlParams = new URLSearchParams(window.location.search);
    const forceParam = urlParams.get('force');
    if (forceParam) {
      const lower = forceParam.toLowerCase();
      if (['blessed', 'cursed', 'jackpot'].includes(lower)) {
        return lower;
      }
    }

    // 2. Probabilities: 50% Blessed, 35% Cursed, 15% Jackpot
    const rand = Math.random() * 100;
    if (rand < 50) {
      return 'blessed';
    } else if (rand < 85) {
      return 'cursed';
    } else {
      return 'jackpot';
    }
  }

  performSmash() {
    const dilemma = this.dilemmaInput.value.trim();
    if (!dilemma || this.isCracking) return;

    this.isCracking = true;
    this.smashBtn.disabled = true;

    // Trigger Screen Vibration / Navigator Haptics
    if (navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 80]);
      } catch (err) {
        // Safe fallback
      }
    }

    // Step 1: Swing Hammer down
    this.hammer.classList.remove('swinging');
    void this.hammer.offsetWidth; // Force reflow
    this.hammer.classList.add('swinging');

    // Step 2: At impact moment (approx 200ms)
    setTimeout(() => {
      // Crack audio sound
      this.audio.playCrack();

      // Screen shake
      document.body.classList.add('screen-shaking');
      setTimeout(() => document.body.classList.remove('screen-shaking'), 450);

      // Coconut shake
      this.coconutWhole.classList.add('shaking');
    }, 200);

    // Step 3: Crack Open and Reveal Outcome Art (at 420ms)
    setTimeout(() => {
      const outcome = this.pickOutcome();
      this.currentOutcome = outcome;
      this.revealOutcome(outcome, dilemma);
    }, 450);
  }

  revealOutcome(outcome, dilemma) {
    // Hide whole coconut
    this.coconutWhole.classList.add('hidden');
    this.coconutWhole.classList.remove('shaking');

    // Reset all split arts
    this.artBlessed.classList.add('hidden');
    this.artCursed.classList.add('hidden');
    this.artJackpot.classList.add('hidden');

    // Show appropriate art & play specific sound
    if (outcome === 'blessed') {
      this.artBlessed.classList.remove('hidden');
      this.audio.playBlessedChime();
    } else if (outcome === 'cursed') {
      this.artCursed.classList.remove('hidden');
      this.audio.playCursedBuzzer();
    } else if (outcome === 'jackpot') {
      this.artJackpot.classList.remove('hidden');
      this.audio.playJackpotFanfare();
      this.spawnJackpotParticles();
    }

    // Update tallies & history
    this.recordResult(outcome, dilemma);

    // Show result card
    this.displayResultCard(outcome, dilemma);

    // Hide input and smash button to declutter view
    this.inputSection.classList.add('hidden');
    this.actionBtnArea.classList.add('hidden');

    this.isCracking = false;
  }

  displayResultCard(outcome, dilemma) {
    this.resultQuote.textContent = `"${dilemma}"`;
    this.resultCard.className = 'result-card'; // reset classes

    if (outcome === 'blessed') {
      this.resultCard.classList.add('state-blessed');
      this.resultBadge.textContent = '✨ BLESSED';
      this.resultMessage.textContent = 'Blessed! The universe says GO FOR IT.';
    } else if (outcome === 'cursed') {
      this.resultCard.classList.add('state-cursed');
      this.resultBadge.textContent = '🪰 CURSED';
      this.resultMessage.textContent = 'Cursed! Rotten omens. Rethink this.';
    } else if (outcome === 'jackpot') {
      this.resultCard.classList.add('state-jackpot');
      this.resultBadge.textContent = '🍫 JACKPOT!';
      this.resultMessage.textContent = 'JACKPOT! Chocolate inside. Extremely lucky.';
    }

    this.resultCard.classList.remove('hidden');
  }

  spawnJackpotParticles() {
    this.particleRain.innerHTML = '';
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'];
    
    // Spawn coins
    for (let i = 0; i < 18; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin-particle';
      coin.textContent = '🪙';
      coin.style.left = `${Math.random() * 95}vw`;
      coin.style.animationDelay = `${Math.random() * 0.7}s`;
      coin.style.animationDuration = `${1.4 + Math.random() * 0.8}s`;
      this.particleRain.appendChild(coin);
    }

    // Spawn confetti pieces
    for (let i = 0; i < 28; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti-particle';
      conf.style.left = `${Math.random() * 98}vw`;
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.animationDelay = `${Math.random() * 0.8}s`;
      conf.style.animationDuration = `${1.6 + Math.random() * 0.9}s`;
      this.particleRain.appendChild(conf);
    }

    // Clear after animation
    setTimeout(() => {
      this.particleRain.innerHTML = '';
    }, 2800);
  }

  recordResult(outcome, dilemma) {
    // 1. Tally
    if (this.tallies[outcome] !== undefined) {
      this.tallies[outcome]++;
      localStorage.setItem('coco_tallies', JSON.stringify(this.tallies));
      this.renderTallies();
    }

    // 2. History (keep last 5)
    this.history.unshift({
      outcome,
      dilemma,
      timestamp: Date.now()
    });

    if (this.history.length > 5) {
      this.history = this.history.slice(0, 5);
    }

    localStorage.setItem('coco_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderTallies() {
    this.blessedCountEl.textContent = this.tallies.blessed || 0;
    this.cursedCountEl.textContent = this.tallies.cursed || 0;
    this.jackpotCountEl.textContent = this.tallies.jackpot || 0;
  }

  renderHistory() {
    if (!this.history || this.history.length === 0) {
      this.historyList.innerHTML = '<li class="history-empty">No coconuts cracked yet. Your destiny awaits!</li>';
      return;
    }

    this.historyList.innerHTML = this.history.map(item => {
      let tagClass = 'tag-blessed';
      let tagLabel = 'Blessed';
      if (item.outcome === 'cursed') {
        tagClass = 'tag-cursed';
        tagLabel = 'Cursed';
      } else if (item.outcome === 'jackpot') {
        tagClass = 'tag-jackpot';
        tagLabel = 'Jackpot';
      }

      const escapedText = this.escapeHtml(item.dilemma);
      return `
        <li class="history-item">
          <span class="history-item-dilemma" title="${escapedText}">"${escapedText}"</span>
          <span class="history-item-tag ${tagClass}">${tagLabel}</span>
        </li>
      `;
    }).join('');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  resetToHome() {
    // Hide outcome art and show whole coconut
    this.artBlessed.classList.add('hidden');
    this.artCursed.classList.add('hidden');
    this.artJackpot.classList.add('hidden');
    this.coconutWhole.classList.remove('hidden');

    // Hide result card
    this.resultCard.classList.add('hidden');

    // Restore input section and button
    this.inputSection.classList.remove('hidden');
    this.actionBtnArea.classList.remove('hidden');

    // Reset input
    this.dilemmaInput.value = '';
    this.updateSmashButtonState();
    this.dilemmaInput.focus();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new CoconutOracleApp();
});

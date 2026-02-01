window.app = {
    navTo: (viewName) => {
        // 1. Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        // 2. Show target view
        document.getElementById(`view-${viewName}`).classList.add('active');

        // 3. Update Nav State
        document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
        document.getElementById(`nav-${viewName}`).classList.add('active');

        // 4. Scroll to top
        window.scrollTo(0, 0);
    }
};

class RehitTimer {
    constructor() {
        this.phases = [
            { name: "Warm Up", duration: 120, type: "normal" },
            { name: "SPRINT", duration: 20, type: "urgent" },
            { name: "Recovery", duration: 180, type: "calm" }, // 3 mins
            { name: "SPRINT", duration: 20, type: "urgent" },
            { name: "Cool Down", duration: 180, type: "calm" } // 3 mins
        ];
        this.state = {
            phaseIdx: 0,
            timeLeft: this.phases[0].duration,
            isRunning: false,
            wakeLock: null,
            noSleepVideo: null
        };
        this.interval = null;
        this.audioCtx = null;

        // Initial binding
        setTimeout(() => this.updateUI(), 100);
    }

    get ui() {
        return {
            phase: document.getElementById('timer-phase'),
            digits: document.getElementById('timer-digits'),
            next: document.getElementById('timer-next'),
            container: document.getElementById('rehit-display'),
            btnStart: document.getElementById('btn-start')
        };
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    async requestWakeLock() {
        // 1. Native Wake Lock API
        if ('wakeLock' in navigator) {
            try {
                this.state.wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake Lock error:', err);
            }
        }

        // 2. Fallback: Fake Video (NoSleep hack)
        // Only if checkbox is checked
        const useNoSleep = document.getElementById('chk-nosleep').checked;
        if (useNoSleep) {
            this.enableNoSleep();
        }
    }

    enableNoSleep() {
        // Create a video element if it doesn't exist
        if (!this.state.noSleepVideo) {
            this.state.noSleepVideo = document.createElement('video');
            this.state.noSleepVideo.setAttribute('playsinline', '');
            this.state.noSleepVideo.setAttribute('no-audio', '');
            this.state.noSleepVideo.setAttribute('muted', '');
            this.state.noSleepVideo.style.display = 'none'; // hidden
            document.body.appendChild(this.state.noSleepVideo);
        }

        // Create a canvas stream to "play"
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const stream = canvas.captureStream(1); // 1 FPS

        this.state.noSleepVideo.srcObject = stream;
        this.state.noSleepVideo.play().catch(e => console.log('NoSleep video play failed', e));
    }

    disableNoSleep() {
        if (this.state.noSleepVideo) {
            this.state.noSleepVideo.pause();
            this.state.noSleepVideo.srcObject = null;
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    updateUI() {
        if (!this.ui.phase) return; // Guard

        const phase = this.phases[this.state.phaseIdx];
        this.ui.phase.innerText = phase.name;
        this.ui.digits.innerText = this.formatTime(this.state.timeLeft);

        // Styles
        this.ui.container.className = 'timer-container ' + (phase.type !== 'normal' ? phase.type : '');

        // Next
        const nextPhase = this.phases[this.state.phaseIdx + 1];
        this.ui.next.innerText = nextPhase ? `Up Next: ${nextPhase.name}` : "Session Complete";

        // Button
        this.ui.btnStart.innerText = this.state.isRunning ? "PAUSE" : "START";
        this.ui.btnStart.style.borderColor = this.state.isRunning ? "var(--urgent)" : "var(--ink)";
    }

    playBeep(freq = 800, type = 'sine', duration = 0.1) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + duration);
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playSiren() {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + 1.5);
        osc.stop(this.audioCtx.currentTime + 1.5);
    }

    tick() {
        if (this.state.timeLeft > 0) {
            // Countdown logic (3-2-1)
            if (this.state.timeLeft <= 3) {
                this.playBeep(1200, 'square', 0.1);
            }

            this.state.timeLeft--;
            this.updateUI();
        } else {
            // Phase Transition
            if (this.state.phaseIdx < this.phases.length - 1) {
                this.state.phaseIdx++;
                this.state.timeLeft = this.phases[this.state.phaseIdx].duration;

                // Audio Cue for new phase
                const phase = this.phases[this.state.phaseIdx];
                if (phase.type === 'urgent') {
                    this.playSiren();
                } else {
                    this.playBeep(600, 'sine', 0.5);
                }

                this.updateUI();
            } else {
                this.complete();
            }
        }
    }

    complete() {
        this.state.isRunning = false;
        clearInterval(this.interval);
        clearInterval(this.interval);
        if (this.state.wakeLock) this.state.wakeLock.release();
        this.disableNoSleep();
        this.ui.phase.innerText = "DONE";
        this.ui.digits.innerText = "Good Job";
        this.ui.btnStart.innerText = "RESET";
        this.playBeep(800, 'sine', 0.5);
    }

    toggle() {
        // Check if completed
        if (this.ui.phase.innerText === "DONE") {
            this.reset();
            return;
        }

        if (!this.state.isRunning) {
            // Start
            this.initAudio();
            this.requestWakeLock();
            this.state.isRunning = true;
            this.interval = setInterval(() => this.tick(), 1000);
            this.updateUI();
        } else {
            // Pause
            this.state.isRunning = false;
            clearInterval(this.interval);
            clearInterval(this.interval);
            if (this.state.wakeLock) this.state.wakeLock.release();
            this.disableNoSleep();
            this.updateUI();
        }
    }

    reset() {
        this.state.isRunning = false;
        clearInterval(this.interval);
        clearInterval(this.interval);
        if (this.state.wakeLock) this.state.wakeLock.release();
        this.disableNoSleep();
        this.state.phaseIdx = 0;
        this.state.timeLeft = this.phases[0].duration;
        this.updateUI();
        this.ui.phase.innerText = "READY"; // Override the "Warm Up" for initial state
    }
}

window.rehit = new RehitTimer();

class Breather {
    constructor() {
        this.isRunning = false;
        this.textInterval = null;
        // Defer UI binding slightly or use getter
    }

    get ui() {
        return {
            container: document.getElementById('breather-container'),
            text: document.getElementById('breath-text'),
            btn: document.getElementById('btn-breathe')
        };
    }

    startLoop() {
        let phase = 0;
        const phases = ["INHALE", "HOLD", "EXHALE", "HOLD"];

        // Initial
        this.ui.text.innerText = phases[0];

        this.textInterval = setInterval(() => {
            phase = (phase + 1) % 4;
            this.ui.text.innerText = phases[phase];
        }, 4000); // 4s per phase
    }

    toggle() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.ui.container.classList.add('running');
            this.ui.btn.innerText = "STOP";
            this.startLoop();
        } else {
            this.isRunning = false;
            this.ui.container.classList.remove('running');
            this.ui.btn.innerText = "START BREATHING";
            clearInterval(this.textInterval);
            this.ui.text.innerText = "READY";
        }
    }
}

window.breather = new Breather();

window.toggleHelp = function () {
    const modal = document.getElementById('rehit-help-modal');
    if (modal.open) {
        modal.close();
    } else {
        modal.showModal();
    }
}

// Close modal if clicking on the backdrop (outside the content)
document.getElementById('rehit-help-modal').addEventListener('click', function (event) {
    const rect = this.getBoundingClientRect();
    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);

    // Check if we clicked on the ::backdrop (dialog element itself acts as backdrop when clicked outside contents)
    // However, strictly dealing with the div inside is safer for click targeting:
    // A simpler heuristic for a full screen dialog:
    if (event.target === this) {
        this.close();
    }
});

export class SoundManager {
    constructor(scene) {
        this.ctx = scene.sound.context;
        this.masterVolume = 0.5;
    }

    // Industrial Hum (Ambient)
    playAmbient() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 50; // Low hum

        // Filter to make it muddy
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(0.05 * this.masterVolume, this.ctx.currentTime);

        osc.start();
        this.ambientOsc = osc;
        this.ambientGain = gain;
    }

    // Hammer: Deep thud + sub bass
    playHammerImpact() {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

        gain.gain.setValueAtTime(1.0 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);

        // Sub bass kick
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(60, t);
        osc2.frequency.exponentialRampToValueAtTime(10, t + 0.3);
        gain2.gain.setValueAtTime(0.5 * this.masterVolume, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.3);
    }

    // Scalpel: Swishing slice sound
    playSlice() {
        const t = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.1; // 0.1 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // White noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(4000, t + 0.1); // Woosh up

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(t);
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // Gunshot: Loud bang
    playGunshot() {
        const t = this.ctx.currentTime;

        // 1. Noise Burst (The Crack)
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.0 * this.masterVolume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(3000, t);
        noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);

        // 2. Sub-bass Boom
        const osc = this.ctx.createOscillator();
        const mainGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);

        mainGain.gain.setValueAtTime(0.8 * this.masterVolume, t);
        mainGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        osc.connect(mainGain);
        mainGain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
    }
}

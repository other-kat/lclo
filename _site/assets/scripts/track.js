
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export class Track {
    constructor(pitch) {

        this.minVol          = -70
        this.basePitch        = pitch;
        this.pitch            = pitch + getRandomInt(-20,20);
        this.varyDirection    = Math.random() < 0.5 ? 1 : -1;
        this.varySpeed        = Math.random() * 0.4
        this.osc              = new Tone.Oscillator(pitch, "sine").toDestination();
        this.osc.volume.value = Math.random() < 0.30 ? getRandomInt(-50, -25) : this.minVol;
        this.waveScale        = 0.005

        this.prevVolume       = null
        this.muted            = false

        this.drawOffset       = 0

        this.createCanvas();

        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas);
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.draggable = false
        this.ctx    = this.canvas.getContext('2d');
        document.getElementById('waveformContainer').appendChild(this.canvas);
        this.canvas.dataset.basePitch = this.basePitch
    }

    changeVolume(amount) {
        this.osc.volume.value += amount
        if (this.osc.volume.value > -4) {this.osc.volume.value = -4}
        if (this.osc.volume.value < this.minVol) {this.osc.volume.value = this.minVol}
        if (this.osc.volume.value === this.minVol) {this.muted = true} else {this.muted = false}
    }

    mute() {
        this.muted = true
        this.prevVolume = this.osc.volume.value
        this.osc.volume.value = this.minVol
    }

    unmute() {
        this.muted = false
        this.osc.volume.value = this.prevVolume
    }

    changePitch(amount) {
        if (this.pitch < this.basePitch - 20 && amount < 0) {return}
        if (this.pitch > this.basePitch + 20 && amount > 0) {return}
        this.pitch = this.pitch + amount
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.logicalWidth = rect.width;
        this.logicalHeight = rect.height;
    }

    drawWaveform() {
        const width  = this.logicalWidth || this.canvas.width;
        const height = this.logicalHeight || this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        const alpha = (((this.minVol * -1) + this.osc.volume.value) / 105) + 0.1
        this.ctx.strokeStyle = `rgba(250,250,250,${alpha})`;
        if (this.isAtBasePitch() && this.osc.volume.value > -69) {
            this.ctx.strokeStyle = `rgba(244,218,104, ${alpha})`;
        }

        let x = 0;
        let y = 0;
        const amplitude = ((this.minVol * -1) + this.osc.volume.value);

        while (x < width) {
            y = height / 2 + amplitude * Math.sin((x + this.drawOffset) * this.waveScale * (this.pitch / 70));

            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            x = x + 1;
        }

        this.ctx.stroke();
    }

    start() {
        this.osc.start();
        setInterval(() => { this.varyFrequency(); }, 20);
    }

    varyFrequency() {

        this.pitch = this.pitch + ((this.varyDirection * 0.1) * (this.varySpeed * (this.isAtBasePitch() ? 0.15 : 1))) ;
        if (this.pitch > this.basePitch + 20 ) {
            this.varyDirection = -1;
        }
        if (this.pitch < this.basePitch - 20 ) {
            this.varyDirection = 1;
        }

        this.osc.frequency.value = this.pitch;
        this.drawWaveform();
    }

    isAtBasePitch() {
        return (Math.round(this.pitch) === Math.round(this.basePitch))
    }

}

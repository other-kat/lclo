export class Track {
    constructor(pitch) {
        function getRandomInt(min, max) {
            const minCeiled = Math.ceil(min);
            const maxFloored = Math.floor(max);
            return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
        }
        function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
        }
        this.basePitch        = pitch;
        this.pitch            = pitch + getRandomInt(-20,20);
        this.varyDirection    = Math.random() < 0.5 ? 1 : -1;
        this.varySpeed        = getRandomArbitrary(0.1, 1)
        this.osc              = new Tone.Oscillator(pitch, "sine").toDestination();
        this.osc.volume.value = getRandomInt(-60, -4);
        this.waveScale        = 0.01

        this.createCanvas();

        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas);
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx    = this.canvas.getContext('2d');
        document.getElementById('waveformContainer').appendChild(this.canvas);
        this.canvas.dataset.basePitch = this.basePitch
        // this.addCanvasControls()
    }

    addCanvasControls() {

        let changingAmp = false
        this.canvas.addEventListener('mousedown', function() {changingAmp = true})
        this.canvas.addEventListener('mouseup',   function() {changingAmp = false})
        this.canvas.addEventListener('mouseleave',function() {changingAmp = false})
        this.canvas.addEventListener('mousemove', (e) =>     {
            if (changingAmp) {
                this.changeVolume(e.movementY * 1.1)
                this.changePitch((e.movementX * 0.2) * -1)
            }
        })

    }

    changeVolume(amount) {
        this.osc.volume.value += amount
        if (this.osc.volume.value > -4) {this.osc.volume.value = -4}
        if (this.osc.volume.value < -60) {this.osc.volume.value = -60}


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
        this.ctx.strokeStyle = "rgb(250,250,250)";
        if (this.nearBasePitch) {
            this.ctx.strokeStyle = "rgb(244,218,104)";
        }

        let x = 0;
        let y = 0;
        const amplitude = (60 + this.osc.volume.value);

        while (x < width) {
            y = height / 2 + amplitude * Math.sin(x * this.waveScale * (this.pitch / 70));

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

        if (this.pitch < this.basePitch + 0.5 && this.pitch > this.basePitch - 0.5) {
            this.nearBasePitch = true
        } else {this.nearBasePitch = false}

        this.pitch = this.pitch + ((this.varyDirection * 0.1) * (this.varySpeed * (this.nearBasePitch ? 0.15 : 1))) ;
        if (this.pitch > this.basePitch + 20 ) {
            this.varyDirection = -1;
        }
        if (this.pitch < this.basePitch - 20 ) {
            this.varyDirection = 1;
        }
        this.setFrequency(this.pitch);
        this.drawWaveform();
    }

    setFrequency(newPitch, time = 0.02) {
        this.osc.frequency.rampTo(newPitch, time);
    }
}

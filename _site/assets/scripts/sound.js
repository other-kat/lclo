import { Track } from './track.js'

class soundManager {

    constructor() {

        this.tracks = []

        const twoeightfive = new Track(285)
        const threeninesix = new Track(396)
        const sixthreenine = new Track(639)
        const sevenfourone = new Track(741)
        const eightfivetwo = new Track(852)

        this.tracks.push(twoeightfive)
        this.tracks.push(threeninesix)
        this.tracks.push(sixthreenine)
        this.tracks.push(sevenfourone)
        this.tracks.push(eightfivetwo)

        this.lastTouchX = 0;
        this.lastTouchY = 0;
    }

    async start() {

        if (this.started) {return}
        await Tone.start();
        this.started = true
        for (const track of this.tracks) {
            await track.start();
        }
        document.getElementById('notification').style.display = 'none'
        document.getElementById('stats').style.display = 'block'
        setInterval(() => {this.drawStats()}, 10)
        this.addCanvasControls()

    }

    drawStats() {
        const stats = document.getElementById('stats')
        stats.innerHTML = ''
        for (const track of this.tracks) {
            stats.innerHTML += `<div class='${track.nearBasePitch ? 'yellow' : ''}'>${track.pitch.toFixed(0)}hz | ${track.osc.volume.value.toFixed(0)}</div>`
        }
    }

    addCanvasControls() {

        const main = document.querySelector('main')

        main.addEventListener('mousedown', (e) =>   {this.setSelectedTrack(e)})
        main.addEventListener('mousemove', (e) =>   {this.modifySelectedTrack(e)})
        main.addEventListener('mouseup', () =>      {this.selectedTrack = null})

        main.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            }
            this.setSelectedTrack(e);
        }, { passive: false });
        main.addEventListener('touchmove', (e) =>   {this.modifySelectedTrack(e)})
        main.addEventListener('touchend', () => { this.selectedTrack = null; });

    }

    setSelectedTrack(e) {

        const canvas = e.target.closest('canvas')
        if (!canvas) {return}

        this.tracks.forEach(track => {
            console.log(track.basePitch,canvas.dataset.basePitch)
            if (track.basePitch === parseInt(canvas.dataset.basePitch)) {
                this.selectedTrack = track
            }

        })
        if (!this.selectedTrack) {return}
    }

    modifySelectedTrack(e) {
        if (!this.selectedTrack) {return}

        let movementX = 0;
        let movementY = 0;

        if (e.touches && e.touches.length > 0) {
            e.preventDefault();

            movementX = e.touches[0].clientX - this.lastTouchX;
            movementY = e.touches[0].clientY - this.lastTouchY;

            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        } else {
            movementX = e.movementX;
            movementY = e.movementY;
        }

        this.selectedTrack.changeVolume(movementY * 1.1);
        this.selectedTrack.changePitch((movementX * 0.2) * -1);
    }

}

const sound = new soundManager()

document.addEventListener('click',      async function() {if (!sound.started) {await sound.start()}})
document.addEventListener('touchstart', async function() {if (!sound.started) {await sound.start()}})

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
        main.addEventListener('touchstart', (e) =>  {this.setSelectedTrack(e)})

        main.addEventListener('mousemove', (e) =>   {this.modifySelectedTrack(e)})
        main.addEventListener('touchmove', (e) =>   {this.modifySelectedTrack(e)})

        main.addEventListener('mouseup', () =>      {this.selectedTrack = null})
        main.addEventListener('mouseup', () =>      {this.selectedTrack = null})

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

        this.selectedTrack.changeVolume(e.movementY * 1.1)
        this.selectedTrack.changePitch((e.movementX * 0.2) * -1)
    }

}

const sound = new soundManager()

document.addEventListener('click',     async function() {if (!sound.started) {await sound.start()}})
document.addEventListener('touchdown', async function() {if (!sound.started) {await sound.start()}})

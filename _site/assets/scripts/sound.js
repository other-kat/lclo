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

    }

    drawStats() {
        const stats = document.getElementById('stats')
        stats.innerHTML = ''
        for (const track of this.tracks) {
            stats.innerHTML += `<div class='${track.nearBasePitch ? 'yellow' : ''}'>${track.pitch.toFixed(0)}hz | ${track.osc.volume.value.toFixed(0)}</div>`
        }
    }

}

const sound = new soundManager()

document.addEventListener('click', async function() {
    if (!sound.started) {
        await sound.start()
    }
})

import { Track } from './track.js'
import { CommunalCanvas } from './communalcanvas.js'

class soundManager {

    constructor() {

        this.username = prompt('Enter your name! Or leave it empty <3')
        if (!this.username) {this.username = 'anonymous'}


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
        document.getElementById('muteButton').style.display = 'block'
        setInterval(() => {
            this.drawStats();
            for (const track of this.tracks) {
                if (track.varyDirection === -1) {track.drawOffset = track.drawOffset + 0.5}
                else {track.drawOffset = track.drawOffset - 0.5}
            }
        }, 10)
        setInterval(() => {this.sendSoundInfo()}, 2000)
        this.addCanvasControls()

        this.communalCanvas = new CommunalCanvas()

    }

    drawStats() {
        const stats = document.getElementById('stats')
        stats.innerHTML = ''
        for (const track of this.tracks) {
            const drawYellow = (track.isAtBasePitch() && !track.muted)
            stats.innerHTML += `<div class='${drawYellow ? 'yellow' : ''}'>${Math.round(track.pitch)}hz | ${track.osc.volume.value.toFixed(0)}</div>`
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

        const muteButton = document.getElementById('muteButton')
        muteButton.addEventListener('mousedown', () => {this.mute()})
        muteButton.addEventListener('mouseup',   () => {this.unmute()})

    }

    mute() {
        this.tracks.forEach(track => {track.mute()})
    }
    unmute() {
        this.tracks.forEach(track => {track.unmute()})
    }

    setSelectedTrack(e) {

        const canvas = e.target.closest('canvas')
        if (!canvas) {return}

        this.tracks.forEach(track => {
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

    async sendSoundInfo() {
        const xhr = new XMLHttpRequest();
        const url = "https://www.iso-bel.computer/lclo/tonesendpoint";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                this.communalCanvas.updateUserData(json.activeUsers)
            }
        };

        const vendor = navigator?.vendor ? navigator.vendor : 'Unknown'
        const payload = {
            "username": this.username,
            "vendor": vendor,
            "tracks": []
        }

        for (const track of this.tracks) {
            const trackData = {
                "volume": track.osc.volume.value,
                "pitch": track.pitch,
                "basePitch": track.basePitch
            }
            payload['tracks'].push(trackData)
        }

        const data = JSON.stringify(payload);
        xhr.send(data);

        // full disclosure - this is sending data back to my server to coordinate. all we're sending
        // is the IP and the track data, and everything which comes back is then shown.
        // nothing's stored on the backend, everything's kept in RAM and dissapears on server
        // shutdown.
        //
        // the source code for the backend:-
        //
        //
        // ACTIVELCLOUSERS = {}
        // data_lock = threading.Lock()

        // @app.route('/lclo/tonesendpoint', methods=['POST'])
        // def tones():

        //     now = datetime.now()

        //     data = request.get_json()

        //     username = data['username']
        //     userIp   = str(request.remote_addr)
        //     userId   = f'{data["username"]}_{userIp}'
        //     with data_lock:
        //         ACTIVELCLOUSERS[userId] = {
        //             'username': username,
        //             'userIp': userIp,
        //             'tracks': data['tracks'],
        //             'lastSeen': now.isoformat()
        //         }
        //         activeUsers = dict(ACTIVELCLOUSERS)

        //     return jsonify({
        //         'response': 'received :)',
        //         "activeUsers": activeUsers
        //     })
        //
        // and an example of what the server is sending every client back:-
        //
        // {
        //     "activeUsers": {
        //         "test_10.0.5.156": {
        //             "lastSeen": "2026-07-05T21:15:06.419494",
        //             "tracks": [
        //                 {
        //                     "basePitch": 285,
        //                     "muted": false,
        //                     "pitch": 303.92398410726616,
        //                     "volume": -70
        //                 },
        //                 {
        //                     "basePitch": 396,
        //                     "muted": false,
        //                     "pitch": 412.793545941625,
        //                     "volume": -70
        //                 },
        //                 {
        //                     "basePitch": 639,
        //                     "muted": false,
        //                     "pitch": 638.7327996055377,
        //                     "volume": -70
        //                 },
        //                 {
        //                     "basePitch": 741,
        //                     "muted": true,
        //                     "pitch": 741.3937338310778,
        //                     "volume": -70
        //                 },
        //                 {
        //                     "basePitch": 852,
        //                     "muted": false,
        //                     "pitch": 850.1988285666948,
        //                     "volume": -70
        //                 }
        //             ],
        //             "userIp": "10.0.5.156",
        //             "username": "test"
        //         }
        //     },
        //     "response": "received :)"
        // }

    }

}

const sound = new soundManager()

document.addEventListener('click',      async function() {if (!sound.started) {await sound.start()}})
document.addEventListener('touchstart', async function() {if (!sound.started) {await sound.start()}})

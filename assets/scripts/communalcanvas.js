
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

let LOGICALWIDTH  = 999 // making these global to serve as placeholders
let LOGICALHEIGHT = 999

class User {
    constructor() {
        this.pos      = {
            'x': getRandomArbitrary(0, LOGICALWIDTH),
            'y': getRandomArbitrary(0, LOGICALHEIGHT)
        }
        this.vector   = {
            'x': getRandomArbitrary(-0.3,-0.3),
            'y': getRandomArbitrary(-0.3,0.3)
        }

        this.randomTargetOffset = {
            "x": getRandomArbitrary(-5, 5),
            "y": getRandomArbitrary(-5, 5)
        }
        this.loudestVolume = 0
    }

    updateServerData(serverData) {
        console.log(serverData)
        this.userId   = serverData['userId']
        this.username = serverData['username']
        this.pid      = serverData['pid']
        this.userIp   = serverData['userIp']
        this.tracks   = serverData['tracks']
        this.lastSeen = serverData['lastSeen']
    }

    draw(ctx) {

        ctx.font = "8px Courier New";
        const alpha = (this.loudestVolume / 70) + 0.15
        ctx.fillStyle = `rgba(255,255,255, ${alpha * 0.7})`
        ctx.fillText(`${this.userIp}`, this.pos.x + 5, this.pos.y + 10);
        ctx.fillText(`${this.username}_p${this.pid}`, this.pos.x + 5, this.pos.y + 17);
        ctx.strokeStyle = `rgba(255,255,255, ${alpha * 0.7})`;
        ctx.fillStyle = `rgba(255,255,255, ${alpha * 0.3})`
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 0.4, 0, 2 * Math.PI);
        ctx.stroke();
    }
    move(centrePoints, ctx) {
        if (!centrePoints) { return; }
        const vectorsByAudio = [];
        this.loudestVolume = 0

        this.tracks.forEach(track =>  {
            const trackPoint = centrePoints[track['bp'] || track['basePitch']];

            const targetX = trackPoint ? trackPoint.x + this.randomTargetOffset.x : this.pos.x;
            const targetY = trackPoint ? trackPoint.y + this.randomTargetOffset.y : this.pos.y;

            const gravityStrength = 0.000004;

            const volume =  66 + track['v'];

            if (volume > this.loudestVolume) {this.loudestVolume = volume}

            const xDistance = targetX - this.pos.x
            const yDistance = targetY - this.pos.y

            let force = {
                "x": xDistance * (volume * gravityStrength),
                "y": yDistance * (volume  * gravityStrength),

            };


            if (volume < 2) {
                force = {'x': 0, "y": 0}
            } else {

                vectorsByAudio.push(force);
            }


        });

        let finalForce = { "x": 0, "y": 0 };
        vectorsByAudio.forEach(force => {
                finalForce.x += force.x;
                finalForce.y += force.y;
        });

        this.vector.x += finalForce.x;
        this.vector.y += finalForce.y;

        const wrongDirectionDampening = 0.93
        const rightDirectionDampening = 0.975

        if (this.vector.x * finalForce.x < 0) {
            this.vector.x *= wrongDirectionDampening;
        } else {this.vector.x *= rightDirectionDampening}

        if (this.vector.y * finalForce.y < 0) {
            this.vector.y *= wrongDirectionDampening;
        } else {this.vector.y *= rightDirectionDampening}

        // if (this.vector.x > 1) {this.vector.x = 1}
        // if (this.vector.y > 1) {this.vector.y = 1}

        this.pos.x += this.vector.x;
        this.pos.y += this.vector.y;

        ctx.beginPath();
        vectorsByAudio.forEach(force => {


            ctx.strokeStyle = `rgba(255,255,255, 0.2)`;
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(this.pos.x + (force.x * 300), this.pos.y + (force.y * 300));
        })
        ctx.stroke()

        // Boundary constraints (bounce off the walls or stop at screen edges)
        if (this.pos.x > LOGICALWIDTH) { this.pos.x = LOGICALWIDTH; this.vector.x *= -1; }
        if (this.pos.x < 0) { this.pos.x = 0; this.vector.x *= -1; }
        if (this.pos.y > LOGICALHEIGHT) { this.pos.y = LOGICALHEIGHT; this.vector.y *= -1; }
        if (this.pos.y < 0) { this.pos.y = 0; this.vector.y *= -1; }
    }
}


export class CommunalCanvas {
    constructor() {
        this.users    = []

        this.createCanvas();
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas);

        this.centrePoints = {}

        this.drawUsers = this.drawUsers.bind(this);
        this.drawUsers()

    }


    cullUsers() {
        const now = new Date()
        this.users = this.users.filter(user => {
            const lastSeen = new Date(user.lastSeen);
            const timeDifference = now.getTime() - 3600000 - lastSeen.getTime();
            console.log(timeDifference)

            const isAlive = timeDifference < 30000;

            return isAlive;
        });
    }

    createCanvas() {
        this.canvas = document.getElementById('communalCanvas');
        this.ctx    = this.canvas.getContext('2d');
        this.canvas.dataset.basePitch = this.basePitch

    }


    drawCentrePoints() {
        const centrePoints = {
            '285': { "x": 0.0,    "y": -1.0   },
            '396': { "x": 0.951,  "y": -0.309 },
            '639': { "x": 0.588,  "y": 0.809  },
            '741': { "x": -0.588, "y": 0.809  },
            '852': { "x": -0.951, "y": -0.309 }
        };

        let multiplier = null;
        let circleScale = 2.1;
        if (LOGICALWIDTH < LOGICALHEIGHT) {
            multiplier = LOGICALWIDTH / circleScale;
        } else {
            multiplier = LOGICALHEIGHT / circleScale;
        }

        let translateX = LOGICALWIDTH / 2;
        let translateY = LOGICALHEIGHT / 1.9;


        for (const [key, point] of Object.entries(centrePoints)) {

            const screenX = (point.x * multiplier) + translateX;
            const screenY = (point.y * multiplier) + translateY;

            if (!this.centrePoints[key]) {
                this.centrePoints[key] = {};
            }

            this.centrePoints[key]['x'] = screenX;
            this.centrePoints[key]['y'] = screenY;

            this.ctx.fillStyle = 'rgba(0,0,0, 0.1)'
            this.ctx.strokeStyle = 'rgba(255,255,255, 0.1)';

            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, multiplier / 10, 0, 2 * Math.PI);
            this.ctx.fill()
            this.ctx.stroke()

        };
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        LOGICALWIDTH = rect.width;
        LOGICALHEIGHT = rect.height;

        if (this.centrePoints) {this.drawCentrePoints()}
    }

    updateUserData(userData) {


        // takes the response from the server and feeds it into our local understanding.
        // we then need to process this data into the visuals separately.
        for (const user of userData) {
            const serverData = Array(user)[0] // just a stupid annoying quirk of the server side code. dont worry abt it kitten.
            console.log(serverData)
            const found = this.users.find(user => user.userId === serverData.userId)
            if (!found) {
                const newUser = new User(LOGICALWIDTH, LOGICALHEIGHT)
                newUser.updateServerData(serverData)
                this.users.push(newUser)
            } else {
                found.updateServerData(serverData)
            }
        }
        this.cullUsers()
    }

    drawUsers() {
        if (this.ctx && LOGICALWIDTH && LOGICALHEIGHT) {
            this.ctx.clearRect(0, 0, LOGICALWIDTH, LOGICALHEIGHT);
        }
        const positions = []

        if (this.centrePoints) {this.drawCentrePoints()}
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.99)';
        this.ctx.fillStyle = '#ffffff99'
        this.users.forEach(user => {
            user.move(this.centrePoints, this.ctx)
            user.draw(this.ctx)
            positions.push(user.pos)
        })

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {

                // Calculate the length of the line
                const dx = positions[i].x - positions[j].x;
                const dy = positions[i].y - positions[j].y;
                const lineLength = Math.sqrt(dx * dx + dy * dy);

                let normalized = 0
                // Normalize line length: 0px -> 1, 1000px -> 0
                // also handle for phones and laptops so they look... kinda similar?
                if (window.innerHeight > window.innerWidth) {
                    normalized = 1 - lineLength / (window.innerHeight * 0.4);
                } else {
                    normalized = 1 - lineLength / (window.innerWidth * 0.4);
                }
                normalized = Math.max(0, normalized); // clamp at 0
                const transparency = (normalized * 0.3) + getRandomArbitrary(-0.01, 0.01)

                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${transparency})`;

                this.ctx.moveTo(positions[i].x, positions[i].y);
                this.ctx.lineTo(positions[j].x, positions[j].y);

                this.ctx.stroke()
            }
        }


        requestAnimationFrame(this.drawUsers)
    }


}

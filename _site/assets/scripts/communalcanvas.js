
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}



class User {
    constructor(logicalWidth, logicalHeight) {
        this.pos      = {
            'x': getRandomArbitrary(0,logicalWidth),
            'y': getRandomArbitrary(0,logicalHeight)
        }
        this.vector   = {
            'x': getRandomArbitrary(-0.3,-0.3),
            'y': getRandomArbitrary(-0.3,0.3)
        }
        this.logicalWidth = logicalWidth
        this.logicalHeight = logicalHeight
    }

    updateServerData(serverData) {
        this.userId   = serverData['userId']
        this.username = serverData['username']
        this.vendor   = serverData['vendor']
        this.pid      = serverData['pid']
        this.userIp   = serverData['userIp']
        this.tracks   = serverData['tracks']
    }

    draw(ctx) {

        const xOffset = getRandomArbitrary(-0.4,0.4)
        const yOffset = getRandomArbitrary(-0.4,0.4)
        ctx.font = "9px Courier New";
        ctx.fillText(`${this.userIp}`, this.pos.x + 5 + xOffset, this.pos.y + 10 + yOffset);
        ctx.fillText(`${this.username} | p${this.pid}`, this.pos.x + 5 + xOffset, this.pos.y + 17 + yOffset);
        ctx.beginPath();
        ctx.arc(this.pos.x + xOffset, this.pos.y + yOffset, 0.5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill()
    }
    move(centrePoints) {
        if (!centrePoints) { return; }
        const vectorsByAudio = [];

        this.tracks.forEach(track => {
            const trackPoint = centrePoints[track['bP'] || track['basePitch']];

            const targetX = trackPoint ? trackPoint.x : this.pos.x;
            const targetY = trackPoint ? trackPoint.y : this.pos.y;

            const gravityStrength = 0.000002;

            const volume =  66 + track['v'];

            let force = {
                "x": (targetX - this.pos.x) * (volume * gravityStrength),
                "y": (targetY - this.pos.y) * (volume  * gravityStrength),
            };

            if (volume < 2) {
                force = {'x': 0, "y": 0}
            }

            vectorsByAudio.push(force);
        });

        let finalForce = { "x": 0, "y": 0 };
        vectorsByAudio.forEach(force => {
            finalForce.x += force.x;
            finalForce.y += force.y;
        });

        this.vector.x += finalForce.x;
        this.vector.y += finalForce.y;

        if (this.vector.x * finalForce.x < 0) {
            this.vector.x *= 0.95;
        } else {this.vector.x *= 0.99}

        if (this.vector.y * finalForce.y < 0) {
            this.vector.y *= 0.95;
        } else {this.vector.y *= 0.999}

        if (this.vector.x > 1) {this.vector.x = 1}
        if (this.vector.y > 1) {this.vector.y = 1}

        this.pos.x += this.vector.x;
        this.pos.y += this.vector.y;

        // Boundary constraints (bounce off the walls or stop at screen edges)
        if (this.pos.x > this.logicalWidth) { this.pos.x = this.logicalWidth; this.vector.x *= -1; }
        if (this.pos.x < 0) { this.pos.x = 0; this.vector.x *= -1; }
        if (this.pos.y > this.logicalHeight) { this.pos.y = this.logicalHeight; this.vector.y *= -1; }
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
        if (this.logicalWidth < this.logicalHeight) {
            multiplier = this.logicalWidth / circleScale;
        } else {
            multiplier = this.logicalHeight / circleScale;
        }

        let translateX = this.logicalWidth / 2;
        let translateY = this.logicalHeight / 1.9;


        for (const [key, point] of Object.entries(centrePoints)) {

            const screenX = (point.x * multiplier) + translateX;
            const screenY = (point.y * multiplier) + translateY;

            this.centrePoints[key] = { x: screenX, y: screenY };

            this.ctx.fillStyle = 'rgba(255,255,255, 0.03)'
            this.ctx.strokeStyle = 'rgba(255,255,255, 0.1)';

            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, multiplier / 10, 0, 2 * Math.PI);
            this.ctx.fill()

        };
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.logicalWidth = rect.width;
        this.logicalHeight = rect.height;

        if (this.centrePoints) {this.drawCentrePoints()}
    }

    updateUserData(userData) {
        // takes the response from the server and feeds it into our local understanding.
        // we then need to process this data into the visuals separately.
        for (const user of userData) {
            const serverData = user[1] // just a stupid annoying quirk of the server side code. dont worry abt it kitten.
            const found = this.users.find(user => user.userId === serverData.userId)
            if (!found) {
                const newUser = new User(this.logicalWidth, this.logicalHeight)
                newUser.updateServerData(serverData)
                this.users.push(newUser)
            } else {
                found.updateServerData(serverData)
            }
        }
    }

    drawUsers() {
        if (this.ctx && this.logicalWidth && this.logicalHeight) {
            this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        }
        const positions = []

        if (this.centrePoints) {this.drawCentrePoints()}
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillStyle = '#ffffff90'
        this.users.forEach(user => {
            user.move(this.centrePoints)
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

                // Normalize line length: 0px -> 1, 1000px -> 0
                let normalized = 1 - lineLength / (window.innerHeight * 0.80);
                normalized = Math.max(0, normalized); // clamp at 0
                const transparency = (normalized * 0.4) + getRandomArbitrary(-0.03, 0.03)

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

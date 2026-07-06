
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}



class User {
    constructor(serverData, logicalWidth, logicalHeight) {
        this.pos      = {
            'x': getRandomArbitrary(0,logicalWidth),
            'y': getRandomArbitrary(0,logicalHeight)
        }
        this.userId   = serverData['userId']
        this.username = serverData['username']
        this.vendor   = serverData['vendor']
        this.userIp   = serverData['userIp']
        this.tracks   = serverData['tracks']
        this.vector   = {
            'x': getRandomArbitrary(-0.3,-0.3),
            'y': getRandomArbitrary(-0.3,0.3)
        }
        this.logicalWidth = logicalWidth
        this.logicalHeight = logicalHeight
    }

    draw(ctx) {

        this.pos.x = this.pos.x + getRandomArbitrary(-0.3,0.3)
        this.pos.y = this.pos.y + getRandomArbitrary(-0.3,0.3)
        ctx.font = "8px Courier New";
        ctx.fillText(this.userIp + " | " + this.username + " | " + this.vendor, this.pos.x + 5, this.pos.y + 10);
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill()
    }

    move() {
        this.pos.x += this.vector.x
        this.pos.y += this.vector.y

        if (this.pos.x > this.logicalWidth) {this.vector.x = getRandomArbitrary(-0.3,0)}
        if (this.pos.x < 0) {this.vector.x = getRandomArbitrary(0,0.3)}
        if (this.pos.y > this.logicalHeight) {this.vector.y = getRandomArbitrary(-0.3,0)}
        if (this.pos.y < 0) {this.vector.y = getRandomArbitrary(0,0.3)}


    }
}


export class CommunalCanvas {
    constructor() {
        this.users    = []

        this.createCanvas();
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.resizeCanvas();
        window.addEventListener("resize", this.resizeCanvas);

        this.drawUsers = this.drawUsers.bind(this);
        this.drawUsers()
    }



    createCanvas() {
        this.canvas = document.getElementById('communalCanvas');
        this.ctx    = this.canvas.getContext('2d');
        this.canvas.dataset.basePitch = this.basePitch
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

    updateUserData(userData) {
        // takes the response from the server and feeds it into our local understanding.
        // we then need to process this data into the visuals separately.
        for (const user of userData) {
            const serverData = user[1] // just a stupid annoying quirk of the server side code. dont worry abt it kitten.
            const found = this.users.find(user => user.userId === serverData.userId)
            if (!found) {
                this.users.push(new User(serverData, this.logicalWidth, this.logicalHeight))
            }
        }
        console.log(this.users)
    }

    drawUsers() {
        if (this.ctx && this.logicalWidth && this.logicalHeight) {
            this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        }
        const positions = []

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
        this.ctx.fillStyle = '#ffffff90'
        this.users.forEach(user => {
            user.move()
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
                let normalized = 1 - lineLength / (window.innerHeight * 0.45);
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

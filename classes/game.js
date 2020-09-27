const Vector = require('./vector.js');

class Snake {
    constructor(width, height, cellSize, startSize) {
        this.playArea = new Vector(width, height).divTo(cellSize);
        this.pos = this.playArea.mult(0.5).truncTo();
        this.vel = new Vector(-1, 0);
        this.score = 0;
        this.body = [];

        while (startSize-- > 0) {
            this.body.push(this.pos.add(new Vector(this.body.length + 1, 0)));
        }
    }

    /*  Return codes:
        0 - Game Over
        1 - Normal
        2 - Food eaten
    */
    move(foodPos) {
        if (!this.vel.x && !this.vel.y) return;
        let i = this.body.length;
        while (i-- > 0) {
            this.body[i] = Vector.from(i ? this.body[i].equals(this.body[i - 1]) ? this.body[i] : this.body[i - 1] : this.pos).wrapTo(0, this.playArea.x - 1);
        }
        this.pos.addTo(this.vel).wrapTo(0, this.playArea.x - 1);
        i = this.body.length;
        while (i-- > 0) {
            if (this.body[i].equals(this.pos)) return 0;
        }
        if (this.pos.equals(foodPos)) {
            this.addBody();
            this.score++;
            return 2;
        }
        return 1;
    }

    addBody() {
        this.body.push(Vector.from(this.body[this.body.length - 1]));
    }
}

module.exports = class Game {
    constructor(width, height) {
        this.width = ~~(width * (9 / 16));
        this.height = ~~height;
        this.directionTable = [
            new Vector(1, 0),
            new Vector(0, -1),
            new Vector(0, 1),
            new Vector(-1, 0)
        ]
        this.frame = 0;
        this.cellSize = 12;
        this.player = new Snake(this.width, this.height, this.cellSize, 3);
        this.foodPos = null;
        this.highscore = 0;
        this.gameOver = 0;
        this.spawnFood();
    }

    spawnFood() {
        while (true) {
            const v = Vector.random(this.player.playArea.x).truncTo();
            let i = this.player.body.length,
                valid = true;
            while (i-- > 0) {
                if (this.player.body[i].equals(v)) {
                    valid = false;
                    break;
                }
            }
            if (valid && !this.player.pos.equals(v)) {
                this.foodPos = v;
                break;
            }
        }
    }

    update(directions) {
        this.frame++;
        if (this.gameOver) {
            this.gameOver++;
            if (this.gameOver >= 30 * 5) {
                this.gameOver = 0;
                this.player = new Snake(this.width, this.height, this.cellSize, 3);
            }
            return;
        }
        if (this.frame >= (Math.max(20 - this.player.score, 2))) { //this will break if the framerate isnt 30, too bad
            this.frame = 0;

            let i = directions.length;
            while (i-- > 0) {
                const proposed = Vector.from(this.directionTable[directions[i]])
                if (!proposed.mult(-1).equals(this.player.vel)) {
                    this.player.vel = proposed;
                    break;
                }
            }
            const code = this.player.move(this.foodPos);
            if (!code) {
                this.gameOver = 1;
            } else if (code == 2) {
                this.highscore = Math.max(this.highscore, this.player.score);
                this.spawnFood();
            };
            return true;
        }
        return false;
    }

    render(canvas) {
        canvas.write('Hi-Score', 32, 8, 32, 32)
        canvas.write(this.highscore.toString().padStart(3, '0'), 32, 32 + 16, 32, 32);
        const scoreText = 'score',
            scoreTextwidth = scoreText.length * 32,
            offset = (this.width - scoreTextwidth) - 32;
        canvas.write(scoreText, offset, 8, 32, 32);
        canvas.write(this.player.score.toString().padStart(3, '0'), offset, 32 + 16, 32, 32);

        if (this.gameOver) {
            const gameoverText = "Game Over!",
                gameoverWidth = gameoverText.length * 64,
                hw = this.width * 0.5,
                hh = this.height * 0.5;
            canvas.write(gameoverText, hw - gameoverWidth * 0.5, hh - 32, 64, 64);
        } else {
            canvas.rect(this.player.pos.x * this.cellSize, this.player.pos.y * this.cellSize, this.cellSize, this.cellSize, 0xffffff);
            let i = this.player.body.length;
            while (i-- > 0) {
                canvas.rect(this.player.body[i].x * this.cellSize, this.player.body[i].y * this.cellSize, this.cellSize, this.cellSize, 0xaeaeae);
            }
            canvas.rect(this.foodPos.x * this.cellSize, this.foodPos.y * this.cellSize, this.cellSize, this.cellSize, 0x00ff00);
        }
    }
}
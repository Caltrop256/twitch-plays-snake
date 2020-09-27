module.exports = class Canvas {
    constructor(width, height) {
        this.width = ~~width;
        this.height = ~~height;
        this.buffer = Buffer.alloc(this.width * this.height * 3, 255);
        this.spritesheetWidth = 123;
        this.spritesheet = null;
        this.onready = () => {};
        require('png-js').decode('./spritesheet.png', px => {
            const temp = [];
            for (let i = 0; i < px.length; ++i) {
                if ((i + 1) % 4) temp.push(px[i]);
            }
            this.spritesheet = Buffer.from(temp);
            this.onready();
        });
    }

    _hexToRGB(hex) {
        if (hex.__proto__.push) return hex;
        return [
            (hex >> 0x10) & 0xFF,
            (hex >> 0x8) & 0xFF,
            hex & 0xFF
        ]
    }

    randomColor() {
        return (Math.random() * 0xffffff) << 0;
    }

    xyToIndex(x, y) {
        x = Math.clamp(x, 0, this.width - 1);
        y = Math.clamp(y, 0, this.height - 1);
        return (y * this.width + x) * 3;
    }

    clear() {
        let i = this.buffer.length;
        while (i-- > 0) this.buffer[i] = 0;
    }

    rect(px, py, sx, sy, clr = [0, 0, 0]) {
        px <<= 0;
        py <<= 0;
        clr = this._hexToRGB(clr);
        for (let i = 0; i < sy; ++i) {
            let ind = this.xyToIndex(px, py + i);
            for (let j = 0; j < sx; ++j) {
                this.buffer[ind++] = clr[0];
                this.buffer[ind++] = clr[1];
                this.buffer[ind++] = clr[2];
            }
        }
    }

    // despair despair despair
    drawSprite(dx, dy, sprX, sprY, sx, sy, w, h) {
        dx <<= 0;
        dy <<= 0;
        sprX <<= 0;
        sprY <<= 0;
        if (!w) w = sx;
        if (!h) h = sy;

        const xFactor = sx / w,
            yFactor = sy / h;

        for (let y = 0; y < h; ++y) {
            const offset = ((y * yFactor) | 0) * this.spritesheetWidth;
            let dstIndex = this.xyToIndex(dx, dy + y);
            for (let x = 0; x < w; ++x) {
                let srcIndex = (((offset + x * xFactor) << 0) + (sprY * this.spritesheetWidth + sprX)) * 3;

                this.buffer[dstIndex++] = this.spritesheet[srcIndex++];
                this.buffer[dstIndex++] = this.spritesheet[srcIndex++];
                this.buffer[dstIndex++] = this.spritesheet[srcIndex++];
            }
        }
    }

    write(str, px, py, lw = 8, lh = 8) {
        px <<= 0;
        py <<= 0;
        lw <<= 0;
        lh <<= 0;
        const valid = /[a-z0-9./"\-!]/i;
        let a = str.toString().split('\n');
        for (let y = 0; y < a.length; ++y) {
            for (let x = 0; x < a[y].length; ++x) {
                const c = a[y][x];
                if (!valid.test(c)) continue;
                const specialList = {
                    ".": [104, 15],
                    "/": [81, 16],
                    "\"": [97, 15],
                    "-": [89, 16],
                    "!": [90, 8]
                };
                const special = specialList[c];
                if (special) {
                    this.drawSprite(px + (x * lw), py + (y * lh), special[0], special[1], 8, 8, lw, lh);
                } else if (isNaN(c)) {
                    let n = parseInt(c.toLowerCase(), 36) - 10;
                    const tx = n % 15,
                        ty = ~~(n / 15);
                    this.drawSprite(px + (x * lw), py + (y * lh), tx * 8 + 1, ty * 8, 8, 8, lw, lh);
                } else {
                    if (c == ' ') continue;
                    this.drawSprite(px + (x * lw), py + (y * lh), 1 + c * 8, 16, 8, 8, lw, lh)
                }
            }
        }
    }
}
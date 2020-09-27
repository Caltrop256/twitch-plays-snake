module.exports = class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    wrapTo(min, max) {
        if (this.x > max) this.x = min;
        if (this.x < min) this.x = max;
        if (this.y > max) this.y = min;
        if (this.y < min) this.y = max;
        return this;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    isNull() {
        return !this.x && !this.y
    }

    addTo(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }

    divTo(n) {
        this.x /= n;
        this.y /= n;
        return this;
    }

    truncTo() {
        this.x <<= 0;
        this.y <<= 0;
        return this;
    }

    equals(v) {
        return this.x == v.x && this.y == v.y;
    }

    static from(v) {
        return new Vector(v.x, v.y);
    }

    static random(max) {
        return new Vector(Math.random() * max, Math.random() * max);
    }
}
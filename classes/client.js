module.exports = class Client {
    constructor() {

        this.config = require('../config.json');
        this.msDelay = 1000 / this.config.framerate;
        this.previousTick = Date.now();

        this.frame = 0;

        for (let k of ['canvas', 'sidebar', 'game']) this[k] = new(require('./' + k + '.js'))(this.config.width, this.config.height);

        this.canvas.onready = () => {
            this.ffmpeg = require('child_process').spawn('./ffmpeg/bin/ffmpeg.exe', [
                '-f', 'rawvideo',
                '-pix_fmt', 'rgb24', //specify default rgb color format
                '-s', this.config.width + 'x' + this.config.height, //our aspect ratio
                '-i', '-', //allow us to insert a buffer through stdin
                '-vf', 'format=yuv420p', //output must be YUV 4:2:0 for live streaming
                '-c:v', 'libx264', '-c:a', 'aac', //enable new encoder
                '-framerate', this.config.framerate,
                '-g', this.config.framerate * 2,
                '-f', 'flv',
                'rtmp://live.twitch.tv/app/' + this.config.streamToken,
                '-re', '-f', 'lavfi', '-i', 'anullsrc', //creates silent audio source
            ]);
            this.ffmpeg.stderr.pipe(process.stdout);
            this.ffmpeg.stdout.pipe(process.stdout);

            // use setInterval because recursive setTimeout loops cause a massive memory leak on this version of node for some reason
            setInterval(this.loop.bind(this), this.msDelay);
        }
    }

    loop() {
        if (this.game.update(this.sidebar.directions)) this.sidebar.directions.length = 0;
        this.canvas.clear();
        this.game.render(this.canvas);
        this.sidebar.render(this.canvas);

        try {
            this.ffmpeg.stdin.write(Buffer.from(this.canvas.buffer)); //copy buffer to avoid massive slow down
        } catch (e) {
            console.error(e);
        }
    }
}
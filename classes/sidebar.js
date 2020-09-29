module.exports = class Sidebar {
    constructor(width, height, cName) {
        this.width = ~~(width * (1 - (9 / 16)));
        this.height = ~~height;
        this.offsetX = width - this.width;

        this.commands = [];
        this.commandSize = 32;

        this.directions = [];

        this.chat = new(require("dank-twitch-irc").ChatClient)();

        this.chat.on("ready", () => console.log("Successfully connected to chat"));
        this.chat.on("close", (error) => {
            if (error != null) {
                console.error("Client closed due to error", error);
            }
        });

        this.chat.on("PRIVMSG", (msg) => {
            const valid = ['right', 'up', 'down', 'left'],
                str = msg.messageText.toLowerCase();
            for (let i = 0; i < valid.length; ++i) {
                if (valid[i] == str || valid[i].charAt(0) == str) {
                    this.addCommand(msg.displayName, valid[i]);
                    this.directions.push(i);
                    break;
                }
            }
        });
        this.chat.connect();
        this.chat.join(cName);
    }

    render(canvas) {
        const dividerSize = 32;
        canvas.rect(this.offsetX, 0, dividerSize, canvas.height, 0xA4A4A4);
        const hw = this.width * 0.5,
            title0text = 'Twitch plays',
            title0size = 46,
            title1text = 'Snake',
            title1size = 96;
        canvas.write(title0text, this.offsetX + (hw - (title0text.length * title0size) * 0.5) + 16, 32, title0size, title0size);
        canvas.write(title1text, this.offsetX + (hw - (title1text.length * title1size) * 0.5) + 16, 32 + title0size + 8, title1size, title1size);

        const ms = Date.now() - global.startup,
            day = ~~(ms / 86400000),
            hour = ~~(ms / 3600000) % 24,
            minute = ~~(ms / 60000) % 60,
            second = ~~(ms / 1000) % 60,
            timeSideMargins = 8,
            numberSize = 48,
            unitSize = 32;

        ((times = {
            day,
            hour,
            minute,
            second
        }) => {
            let i = 4;
            for (let k in times) {
                const x = (this.offsetX + this.width) - (i - 1) * ((this.width + dividerSize) / 4) - timeSideMargins - (dividerSize * 4)
                canvas.write(this.pad(times[k], 2), x, 196, numberSize, numberSize);
                canvas.write(k.charAt(0), x + numberSize * 2, 196 + (numberSize - unitSize) - 1, unitSize, unitSize);
                i--;
            }
        })();

        const footer0text = 'caltrop.dev/snake',
            footer0size = 32;
        canvas.write(footer0text, this.offsetX + (hw - (footer0text.length * footer0size) * 0.5) + 16, this.height - footer0size - 8, footer0size, footer0size);

        const unavailableTop = 264,
            unavailableTopBottom = footer0size + 32,
            unavailableY = unavailableTop + unavailableTopBottom,
            spliceIndex = Math.floor((this.height - unavailableY) / (this.commandSize + 8));
        while (this.commands.length > spliceIndex) {
            this.commands.shift();
        }
        for (let i = 0; i < this.commands.length; ++i) {
            canvas.write(this.commands[i], this.offsetX + dividerSize + 16, unavailableTop + i * (this.commandSize + 8), this.commandSize, this.commandSize);
        }
    }

    addCommand(name, command) {
        let str = '';
        const commandWidth = command.length * this.commandSize,
            availableWidth = this.width - 48,
            nameRawWidth = name.length * this.commandSize,
            spaceVal = Math.floor((availableWidth - (commandWidth + nameRawWidth)) / this.commandSize);
        if (nameRawWidth + commandWidth >= availableWidth) {
            str = name.substring(0, (name.length - 1) + spaceVal) + ' ' + command;
        } else {
            str = name + ' '.repeat(spaceVal) + command;
        }
        this.commands.push(str);
    }

    pad(s, num) {
        s = String(s);
        const len = s.length;
        return len >= num ? s : '0'.repeat(num - len) + s;
    }

}
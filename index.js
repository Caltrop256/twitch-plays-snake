// TODO: rewrite this entire mess in c++ or literally any other actually *reasonable* language

console.clear();
global.startup = Date.now();
global.client = new(require('./classes/client'))();

Math.clamp = function (n, min, max) {
    return Math.max(Math.min(max, n), min);
}

const stdin = process.openStdin();
let input = '';
stdin.addListener('data', s => {
    input += s
    if (s.toString().endsWith('\n')) {
        let evaled = '';
        try {
            evaled = eval(input);
        } catch (e) {
            evaled = e;
        }
        console.log(evaled);
        input = '';
    }
});
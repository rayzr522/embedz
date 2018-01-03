process.stdin.on('data', chunk => {
    let input = `${chunk}`.trim();
    console.log(require('./parser')(input));
});
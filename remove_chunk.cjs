const fs = require('fs');

const lines = fs.readFileSync('src/game/GameEngine.ts', 'utf8').split('\n');

// 1-indexed to 0-indexed conversion
// keep 0 to 1353 (which is lines 1 to 1354) -- wait, array index 0 is line 1.
// We want to delete 1354 to 1957 inclusive.
// Array index for line 1354 is 1353.
// Array index for line 1957 is 1956.

// So we slice(0, 1353) which gives 0 to 1352 (lines 1 to 1353).
// And we slice(1957) which gives 1957 to end (lines 1958 to end).

const fixedLines = [
    ...lines.slice(0, 1353),
    ...lines.slice(1957)
];

fs.writeFileSync('src/game/GameEngine.ts', fixedLines.join('\n'));
console.log('Fixed overlapping chunk!');

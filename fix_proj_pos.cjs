const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const startIndex = code.indexOf('private checkReactions(enemy: Enemy) {');
const endIndex = code.indexOf('private triggerReaction(id:', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    let middle = code.substring(startIndex, endIndex);

    middle = middle.replace(/proj\.pos/g, 'enemy.pos');

    fs.writeFileSync('src/game/GameEngine.ts', before + middle + after);
    console.log('Fixed proj.pos!');
} else {
    console.log('Could not find boundaries: ', startIndex, endIndex);
}

const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const sIdx = code.indexOf('private checkReactions(enemy: Enemy) {');
const eIdx = code.indexOf('private triggerReaction(id:', sIdx);

if (sIdx !== -1 && eIdx !== -1) {
    let before = code.substring(0, sIdx);
    let after = code.substring(eIdx);
    let middle = code.substring(sIdx, eIdx);
    console.log("Middle block length:", middle.length);
    let occurrences = (middle.match(/proj\.pos/g) || []).length;
    console.log("Found proj.pos occurrences:", occurrences);
    middle = middle.replace(/proj\.pos/g, 'enemy.pos');
    fs.writeFileSync('src/game/GameEngine.ts', before + middle + after);
    console.log("Done.");
} else {
    console.log("Bounds not found.", sIdx, eIdx);
}

const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Interface
const interfaceTarget = `showProtonTutorial: boolean;`;
if(code.includes(interfaceTarget)) {
    code = code.replace(interfaceTarget, `showProtonTutorial: boolean;\n  hasSeenTutorial: boolean;`);
}

// 2. setItem (save)
const setItemTarget = `showProtonTutorial: this.state.showProtonTutorial,`;
if(code.includes(setItemTarget)) {
    code = code.replace(setItemTarget, `showProtonTutorial: this.state.showProtonTutorial,\n        hasSeenTutorial: this.state.hasSeenTutorial,`);
}

// 3. let init
const letTarget = `let showProtonTutorial = false;`;
if(code.includes(letTarget)) {
    code = code.replace(letTarget, `let showProtonTutorial = false;\n    let hasSeenTutorial = false;`);
}

// 4. load
const parseTarget = `if (parsed.showProtonTutorial) showProtonTutorial = parsed.showProtonTutorial;`;
if(code.includes(parseTarget)) {
    code = code.replace(parseTarget, `if (parsed.showProtonTutorial) showProtonTutorial = parsed.showProtonTutorial;\n                if (parsed.hasSeenTutorial !== undefined) hasSeenTutorial = parsed.hasSeenTutorial;`);
}

// 5. return state
const returnTarget = `showProtonTutorial,`;
if(code.includes(returnTarget)) {
    code = code.replace(returnTarget, `showProtonTutorial,\n      hasSeenTutorial,`);
}

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log("GameEngine patched with hasSeenTutorial");

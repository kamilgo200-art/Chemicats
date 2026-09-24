const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Add to GameEngineState interface
const interfaceTarget = `bondsRoomsLeft: number;`;
if(code.includes(interfaceTarget)) {
    code = code.replace(interfaceTarget, `bondsRoomsLeft: number;\n  feedbackSubmitted?: boolean;`);
}

// 2. Add to constructor serialization (setItem)
const setItemTarget = `bondsRoomsLeft: this.state.bondsRoomsLeft,`;
if(code.includes(setItemTarget)) {
    code = code.replace(setItemTarget, `bondsRoomsLeft: this.state.bondsRoomsLeft,\n        feedbackSubmitted: this.state.feedbackSubmitted,`);
}

// 3. Add to let declarations
const letTarget = `let bondsRoomsLeft = 0;`;
if(code.includes(letTarget)) {
    code = code.replace(letTarget, `let bondsRoomsLeft = 0;\n    let feedbackSubmitted = false;`);
}

// 4. Add to parsing
const parseTarget = `if (parsed.bondsRoomsLeft !== undefined) bondsRoomsLeft = parsed.bondsRoomsLeft;`;
if(code.includes(parseTarget)) {
    code = code.replace(parseTarget, `if (parsed.bondsRoomsLeft !== undefined) bondsRoomsLeft = parsed.bondsRoomsLeft;\n                if (parsed.feedbackSubmitted !== undefined) feedbackSubmitted = parsed.feedbackSubmitted;`);
}

// 5. Add to state initialization return
const stateInitTarget = `bondsRoomsLeft,\n      showingShop: false,`;
if(code.includes(stateInitTarget)) {
    code = code.replace(stateInitTarget, `bondsRoomsLeft,\n      feedbackSubmitted,\n      showingShop: false,`);
}

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log("GameEngine patched");

const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// Replace SnakeGourdSegment atoms sharing
code = code.replace(/type: 'SnakeGourdSegment' as any, atoms: bossAtoms,/g, "type: 'SnakeGourdSegment' as any, atoms: { ...bossAtoms },");

// Replce the main boss sharing
code = code.replace(/type: bossType as any, atoms: bossAtoms,/g, "type: bossType as any, atoms: { ...bossAtoms },");

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed atoms ref!');

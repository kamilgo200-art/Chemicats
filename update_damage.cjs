const fs = require('fs');

let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

file = file.replace(/damage: 15 \* Math\.pow\(3, this\.state\.level - 1\)/g, 'damage: 20 * Math.pow(3, this.state.level - 1)');
file = file.replace(/damage: 10 \* Math\.pow\(3, this\.state\.level - 1\)/g, 'damage: 15 * Math.pow(3, this.state.level - 1)');
file = file.replace(/damage: 25 \* Math\.pow\(3, this\.state\.level - 1\)/g, 'damage: 35 * Math.pow(3, this.state.level - 1)');
file = file.replace(/damage: 20 \* Math\.pow\(3, this\.state\.level - 1\)/g, 'damage: 30 * Math.pow(3, this.state.level - 1)');

file = file.replace(/p\.hp -= 45 \* Math\.pow\(3, this\.state\.level - 1\) \* armorMultiplier;/g, 'p.hp -= 60 * Math.pow(3, this.state.level - 1) * armorMultiplier;');
file = file.replace(/p\.hp -= 65 \* Math\.pow\(3, this\.state\.level - 1\) \* armorMultiplier;/g, 'p.hp -= 85 * Math.pow(3, this.state.level - 1) * armorMultiplier;');

fs.writeFileSync('src/game/GameEngine.ts', file, 'utf8');
console.log("Updated damage values");

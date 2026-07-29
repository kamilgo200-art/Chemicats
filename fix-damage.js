const fs = require('fs');

let code = fs.readFileSync('src/game/GameEngine.ts', 'utf-8');

// Replace EnemyBullet damage to 1/3
code = code.replace(/damage: 35 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 10 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 40 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.2\)/g, "damage: 12 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 50 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.3\)/g, "damage: 15 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 25 \* \(this\.state\.level \* 0\.5\)/g, "damage: 8 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 30 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 8 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 15 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 5 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 20 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 6 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 45 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 15 * (1 + (this.state.level - 1) * 0.2)");
code = code.replace(/damage: 25 \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\)/g, "damage: 8 * (1 + (this.state.level - 1) * 0.2)");

// Fix poison
code = code.replace(/let poisonDmg = \(enemy\.type === 'Hogweed' \? 400 : 100\) \* dt;/g, "let poisonDmg = (enemy.type === 'Hogweed' ? 60 : 20) * dt;");

// Fix bite damage
code = code.replace(/let biteDmg = \(enemy\.type === 'Root' \? 30 : 60\) \* \(1 \+ \(this\.state\.level - 1\) \* 0\.5\) \* armorMultiplier;/g, "let biteDmg = (enemy.type === 'Root' ? 10 : 20) * (1 + (this.state.level - 1) * 0.2) * armorMultiplier;");

// Fix player's damage taking if needed
// Or let's see if there are other damage texts

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Done!');

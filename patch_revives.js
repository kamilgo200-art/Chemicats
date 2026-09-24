import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/        showProtonTutorial: this\.state\.showProtonTutorial,\n      revivesUsed,/,
`        showProtonTutorial: this.state.showProtonTutorial,
        revivesUsed: this.state.revivesUsed,`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

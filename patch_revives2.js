import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/                if \(parsed\.showProtonTutorial\) showProtonTutorial = parsed\.showProtonTutorial;/,
`                if (parsed.showProtonTutorial) showProtonTutorial = parsed.showProtonTutorial;
                if (parsed.revivesUsed !== undefined) revivesUsed = parsed.revivesUsed;`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

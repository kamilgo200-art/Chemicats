import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/  public enterDungeon\(\) {/,
`  public enterDungeon() {
      this.state.revivesUsed = 0;`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

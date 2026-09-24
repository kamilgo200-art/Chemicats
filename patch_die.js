import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/  public forceWipeReset\(\) \{/,
`  public forceWipeReset() {
      this.state.state = 'playing';`
);

content = content.replace(
/      p\.isDead = false;\n      p\.deadTimer = 0;\n      this\.state\.state = 'playing';\n      this\.state\.isLobby = true;\n      this\.state\.characterSelected = false;\n      this\.state\.electrons = 0;\n      this\.state\.bondsBalance = 0;[\s\S]*?      this\.saveGame\(\);\n  \}/,
`      p.isDead = true;
      p.hp = 0;
      this.state.state = 'gameover';
  }`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

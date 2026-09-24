import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/  public update\(dt: number\) \{/,
`  public revivePlayer() {
      this.state.player.hp = this.state.player.maxHp;
      this.state.player.isDead = false;
      this.state.player.iFrameTimer = 3.0;
      this.state.state = 'playing';
      this.state.revivesUsed++;
  }

  public update(dt: number) {`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

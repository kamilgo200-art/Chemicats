const { execSync } = require('child_process');
try {
  execSync('git checkout src/game/GameEngine.ts');
  console.log('Restored GameEngine.ts from git!');
} catch (e) {
  console.error(e.toString());
}

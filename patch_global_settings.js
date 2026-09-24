import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/  public saveGame\(force: boolean = false\) \{/,
`  public saveGlobalSettings() {
      if (typeof window === 'undefined') return;
      const settings = {
          language: this.state.language,
          difficulty: this.state.difficulty,
          autoNextLevel: this.state.autoNextLevel,
          showCombatLog: this.state.showCombatLog,
          disableScreenShake: this.state.disableScreenShake,
          uiScale: this.state.uiScale,
          cameraZoom: this.state.cameraZoom
      };
      localStorage.setItem('mendelejew_global_settings', JSON.stringify(settings));
  }

  public saveGame(force: boolean = false) {
      this.saveGlobalSettings();`
);

content = content.replace(
/    let difficulty: 'kids' \| 'easy' \| 'normal' \| 'hard' = 'normal';\n    let language: 'pl' \| 'en' = 'pl';/,
`    let difficulty: 'kids' | 'easy' | 'normal' | 'hard' = 'normal';
    let language: 'pl' | 'en' = 'pl';
    let autoNextLevel = true;
    let disableScreenShake = false;
    let uiScale = 1.0;
    let showCombatLog = false;
    let cameraZoom = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 1.0 : 0.55;

    if (typeof window !== 'undefined') {
        const globalStr = localStorage.getItem('mendelejew_global_settings');
        if (globalStr) {
            try {
                const global = JSON.parse(globalStr);
                if (global.difficulty) difficulty = global.difficulty;
                if (global.language) language = global.language;
                if (global.autoNextLevel !== undefined) autoNextLevel = global.autoNextLevel;
                if (global.disableScreenShake !== undefined) disableScreenShake = global.disableScreenShake;
                if (global.uiScale !== undefined) uiScale = global.uiScale;
                if (global.showCombatLog !== undefined) showCombatLog = global.showCombatLog;
                if (global.cameraZoom !== undefined) cameraZoom = global.cameraZoom;
            } catch(e) {}
        }
    }`
);

// We need to remove the redundant redeclarations from `getInitialState`
content = content.replace(/    let autoNextLevel = true;\n    let disableScreenShake = false;\n    let uiScale = 1\.0;\n    let showCombatLog = false;\n/, '');

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');

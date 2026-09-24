const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Add mendelejew to unlocked characters if level === 6
const levelUpReplacement = `        this.state.level++;
        this.state.companion = null;
        
        if (this.state.level === 6) {
             if (!this.state.unlockedCharacters.includes('mendelejew')) {
                 this.state.unlockedCharacters.push('mendelejew');
             }
        }`;
code = code.replace(/this\.state\.level\+\+;\s*this\.state\.companion = null;/, levelUpReplacement);

// 2. Add mendelejew to charUpgrades init in getInitialState
const charUpgradesReplacement = `    let charUpgrades: Record<string, any> = {
      ginger_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      black_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      bohr_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      curie_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      mendelejew: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false }
    };`;
code = code.replace(/let charUpgrades: Record<string, any> = {[\s\S]*?};/, charUpgradesReplacement);

// 3. Update unlockedAtoms logic for Mendelejew
const atomsReplacement = `    let unlockedAtoms = ['H', 'O'];
    if (!loadCurrentSlot && selectedCharacter === 'curie_cat') {
        unlockedAtoms = ['Ra', 'Po'];
    } else if (!loadCurrentSlot && selectedCharacter === 'mendelejew') {
        const pool = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Sc', 'Ti', 'Fe'];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        unlockedAtoms = shuffled.slice(0, 4);
    }`;
code = code.replace(/let unlockedAtoms = \['H', 'O'\];\s*if \(\!loadCurrentSlot && selectedCharacter === 'curie_cat'\) {\s*unlockedAtoms = \['Ra', 'Po'\];\s*}/, atomsReplacement);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed GameEngine');

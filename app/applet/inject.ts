import * as fs from 'fs';

let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const clReactions = `
    // Cl2
    if (a.Cl >= 2) {
       const forms = Math.floor(a.Cl/2);
       a.Cl -= forms * 2;
       this.triggerReaction('cl2', 'Chlor (Gaz)', '2Cl ➔ Cl₂', 'Toksyczny zielony gaz, dusi wroga.', ['Cl','Cl']);
       enemy.hp -= 220 * forms;
       enemy.status.dotTimer = 6.0;
       enemy.status.dotDamage = 60 * forms;
       this.addParticle(enemy.pos, '#10b981', 300, 35);
    }
    // HCl
    if (a.H >= 1 && a.Cl >= 1) {
       const forms = Math.floor(Math.min(a.H, a.Cl));
       a.H -= forms; a.Cl -= forms;
       this.triggerReaction('hcl', 'Kwas Solny', 'H + Cl ➔ HCl', 'Żrący kwas uderzający cel punktowo z potężną siłą.', ['H','Cl']);
       enemy.hp -= 180 * forms;
       this.addParticle(enemy.pos, '#34d399', 150, 25);
    }
    // CCl4
    if (a.C >= 1 && a.Cl >= 4) {
       const forms = Math.floor(Math.min(a.C, a.Cl/4));
       a.C -= forms; a.Cl -= forms * 4;
       this.triggerReaction('ccl4', 'Tetrachlorometan', 'C + 4Cl ➔ CCl₄', 'Potężny wybuch kwasowy zamrażający wszystko dookoła.', ['C','Cl','Cl','Cl','Cl']);
       enemy.hp -= 600 * forms;
       enemy.status.frozenTimer += 4.0 * forms;
       this.addParticle(enemy.pos, '#a7f3d0', 400, 40);
    }
`;

file = file.replace(/const a = enemy.atoms;\n\s*\/\/ Priorities matter!/, 'const a = enemy.atoms;\n' + clReactions + '\n    // Priorities matter!');

const pReactions = `
    // Cl2
    if (a.Cl >= 2) {
       const forms = Math.floor(a.Cl/2);
       a.Cl -= forms * 2;
       this.triggerReaction('cl2', 'Chlor (Gaz)', '2Cl ➔ Cl₂', 'Toksyczna chmura zielonego gazu.', ['Cl','Cl']);
       this.addParticle(proj.pos, '#10b981', 350, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 120 * forms;
           other.status.dotTimer = 6.0;
           other.status.dotDamage = 60 * forms;
         }
       });
    }
    // HCl
    if (a.H >= 1 && a.Cl >= 1) {
       const forms = Math.floor(Math.min(a.H, a.Cl));
       a.H -= forms; a.Cl -= forms;
       this.triggerReaction('hcl', 'Kwas Solny', 'H + Cl ➔ HCl', 'Gwałtowny wyrzut kwasu solnego o potężnej sile żrącej!', ['H','Cl']);
       this.addParticle(proj.pos, '#34d399', 200, 30 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 150) {
           other.hp -= 150 * forms;
         }
       });
    }
`;

// Insert the projectile combinations
file = file.replace(/(\/\/ SiC Karborund[\s\S]*?\}\n\s*\})/m, '$1\n' + pReactions);

fs.writeFileSync('src/game/GameEngine.ts', file);
console.log('Reactions inserted!');

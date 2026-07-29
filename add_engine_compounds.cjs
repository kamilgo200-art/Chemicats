const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const additionalProjectiles = `          else if (p.selectedReaction === 'nacl') { speed = 650; radius = 40; damage = 750; newAtoms['Na'] = 1; newAtoms['Cl'] = 1; (newAtoms as any).NaCl = 1; projType = 'NACL'; p.stamina -= 50; fireTime = 2.4; heatCost = 120; }
          else if (p.selectedReaction === 'naoh') { speed = 550; radius = 50; damage = 1300; newAtoms['Na'] = 1; newAtoms['O'] = 1; newAtoms['H'] = 1; (newAtoms as any).NaOH = 1; projType = 'NAOH'; p.stamina -= 60; fireTime = 2.8; heatCost = 160; }
          else if (p.selectedReaction === 'nahco3') { speed = 400; radius = 65; damage = 900; newAtoms['Na'] = 1; newAtoms['H'] = 1; newAtoms['C'] = 1; newAtoms['O'] = 3; (newAtoms as any).NaHCO3 = 1; projType = 'NAHCO3'; p.stamina -= 70; fireTime = 3.2; heatCost = 180; }
          else if (p.selectedReaction === 'al2o3') { speed = 450; radius = 55; damage = 2500; newAtoms['Al'] = 2; newAtoms['O'] = 3; (newAtoms as any).Al2O3 = 1; projType = 'AL2O3'; p.stamina -= 80; fireTime = 3.5; heatCost = 210; }
          else if (p.selectedReaction === 'alcl3') { speed = 500; radius = 60; damage = 1800; newAtoms['Al'] = 1; newAtoms['Cl'] = 3; (newAtoms as any).AlCl3 = 1; projType = 'ALCL3'; p.stamina -= 65; fireTime = 3.0; heatCost = 175; }
`;

code = code.replace(/          else { speed = 0; fireTime = 0\.2; }\n      }/, additionalProjectiles + '          else { speed = 0; fireTime = 0.2; }\n      }');

const additionalHits = `
    // nacl: Na + Cl
    if ((a.Na || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Na, a.Cl));
       a.Na -= forms; a.Cl -= forms;
       this.triggerReaction('nacl', 'NaCl (Chlorek Sodu)', 'Na + Cl ➔ NaCl', 'Ogromny, trzeszczący ładunek soli!', ['Na','Cl']);
       this.addParticle(proj.pos, '#f8fafc', 350, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 400 * forms;
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage += 80 * forms;
         }
       });
    }

    // naoh: Na + O + H
    if ((a.Na || 0) >= 1 && (a.O || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Na, a.O, a.H));
       a.Na -= forms; a.O -= forms; a.H -= forms;
       this.triggerReaction('naoh', 'NaOH (Wodorotlenek Sodu)', 'Na + O + H ➔ NaOH', 'Silnie kaustyczna para sodowa!', ['Na','O','H']);
       this.addParticle(proj.pos, '#cbd5e1', 400, 80 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 1000 * forms;
           other.status.dotTimer += 12.0 * forms;
           other.status.dotDamage += 150 * forms;
         }
       });
    }

    // nahco3: Na + H + C + 3O
    if ((a.Na || 0) >= 1 && (a.H || 0) >= 1 && (a.C || 0) >= 1 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Na, a.H, a.C, a.O/3));
       a.Na -= forms; a.H -= forms; a.C -= forms; a.O -= forms * 3;
       this.triggerReaction('nahco3', 'NaHCO₃ (Soda Oczyszczona)', 'Na + H + C + 3O ➔ NaHCO₃', 'Gazująca chmura osłabiająca wrogów!', ['Na','H','C','O','O','O']);
       this.addParticle(proj.pos, '#fef08a', 450, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 600 * forms;
           other.status.slowTimer += 12.0 * forms;
         }
       });
    }

    // al2o3: 2Al + 3O
    if ((a.Al || 0) >= 2 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Al/2, a.O/3));
       a.Al -= forms * 2; a.O -= forms * 3;
       this.triggerReaction('al2o3', 'Al₂O₃ (Korund)', '2Al + 3O ➔ Al₂O₃', 'Masywny potężny kryształ niszczący masą.', ['Al','Al','O','O','O']);
       this.addParticle(proj.pos, '#94a3b8', 600, 150 * forms);
       this.state.screenShake = 20;
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 3000 * forms;
           other.status.frozenTimer += 5.0 * forms;
         }
       });
    }

    // alcl3: Al + 3Cl
    if ((a.Al || 0) >= 1 && (a.Cl || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Al, a.Cl/3));
       a.Al -= forms; a.Cl -= forms * 3;
       this.triggerReaction('alcl3', 'AlCl₃ (Chlorek Glinu)', 'Al + 3Cl ➔ AlCl₃', 'Zagęszczająca kwasowa mgła!', ['Al','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#64748b', 500, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 1200 * forms;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }
`;

code = code.replace(/\n    let remainingAtoms = 0;/, additionalHits + '\n    let remainingAtoms = 0;');

fs.writeFileSync('src/game/GameEngine.ts', code);

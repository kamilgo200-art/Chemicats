import * as fs from 'fs';

let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const pReactionsStr = `
    // P4
    if (a.P >= 4) {
       const forms = Math.floor(a.P/4);
       a.P -= forms * 4;
       this.triggerReaction('p4', 'Biały Fosfor (Zapalający)', '4P ➔ P₄', 'Ogromna eksplozja zapalająca o długotrwałym efekcie spalania.', ['P','P','P','P']);
       enemy.hp -= 400 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#facc15', 500, 45); // yellow fire
    }
    // PH3
    if (a.P >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.P, a.H/3));
       a.P -= forms; a.H -= forms * 3;
       this.triggerReaction('ph3', 'Fosfiniak (Fosforowodór)', 'P + 3H ➔ PH₃', 'Niezwykle trujący i palny gaz obezwładniający cel.', ['P','H','H','H']);
       enemy.hp -= 300 * forms;
       enemy.status.slowTimer += 6.0 * forms;
       this.addParticle(enemy.pos, '#a3e635', 300, 30);
    }
    // H3PO4
    if (a.H >= 3 && a.P >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/3, a.P, a.O/4));
       a.H -= forms * 3; a.P -= forms; a.O -= forms * 4;
       this.triggerReaction('h3po4', 'Kwas Fosforowy', '3H + P + 4O ➔ H₃PO₄', 'Kwas ortofosforowy całkowicie zatrzymujący wroga w kwasie i niszczący pancerz.', ['H','P','O','O']);
       enemy.hp -= 500 * forms;
       enemy.status.frozenTimer += 8.0 * forms;
       this.addParticle(enemy.pos, '#3b82f6', 200, 40);
    }
`;

file = file.replace(/const a = enemy.atoms;/, 'const a = enemy.atoms;\n' + pReactionsStr);

const pProjReactionsStr = `
    // P4
    if (a.P >= 4) {
       const forms = Math.floor(a.P/4);
       a.P -= forms * 4;
       this.triggerReaction('p4', 'Biały Fosfor (Zapalający)', '4P ➔ P₄', 'Obszarowa eksplozja zapalająca wszystko dookoła.', ['P','P','P','P']);
       this.addParticle(proj.pos, '#facc15', 400, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 200 * forms;
           other.status.dotTimer = 10.0 * forms;
           other.status.dotDamage = 80 * forms;
         }
       });
    }
    // PH3
    if (a.P >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.P, a.H/3));
       a.P -= forms; a.H -= forms * 3;
       this.triggerReaction('ph3', 'Fosforowodór', 'P + 3H ➔ PH₃', 'Eksplozja toksycznego gazu.', ['P','H','H','H']);
       this.addParticle(proj.pos, '#a3e635', 350, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 150 * forms;
           other.status.slowTimer += 4.0 * forms;
         }
       });
    }
    // H3PO4
    if (a.H >= 3 && a.P >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/3, a.P, a.O/4));
       a.H -= forms * 3; a.P -= forms; a.O -= forms * 4;
       this.triggerReaction('h3po4', 'Kwas Fosforowy', '3H + P + 4O ➔ H₃PO₄', 'Eksplozja ortofosforowa zatrzymująca wrogów!', ['H','P','O','O']);
       this.addParticle(proj.pos, '#3b82f6', 300, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 150) {
           other.hp -= 200 * forms;
           other.status.frozenTimer += 5.0 * forms;
         }
       });
    }
`;

file = file.replace(/(\/\/ SiO2 Silicon Dioxide[\s\S]*?\}\n\s*\})/m, '$1\n' + pProjReactionsStr);

fs.writeFileSync('src/game/GameEngine.ts', file);
console.log('P Reactions inserted!');

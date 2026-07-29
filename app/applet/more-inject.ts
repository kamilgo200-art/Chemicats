import * as fs from 'fs';

let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const moreReactions = `
    // NCl3
    if (a.N >= 1 && a.Cl >= 3) {
       const forms = Math.floor(Math.min(a.N, a.Cl/3));
       a.N -= forms; a.Cl -= forms * 3;
       this.triggerReaction('ncl3', 'Trójchlorek Azotu', 'N + 3Cl ➔ NCl₃', 'Ekstremalnie czuły ładunek wybuchowy! Eksploduje w kontakcie z wrogiem z potężną siłą.', ['N','Cl','Cl','Cl']);
       enemy.hp -= 450 * forms;
       enemy.status.frozenTimer += 1.0 * forms;
       this.addParticle(enemy.pos, '#fbbf24', 250, 40);
    }
    // PCl5
    if (a.P >= 1 && a.Cl >= 5) {
       const forms = Math.floor(Math.min(a.P, a.Cl/5));
       a.P -= forms; a.Cl -= forms * 5;
       this.triggerReaction('pcl5', 'Pentachlorek Fosforu', 'P + 5Cl ➔ PCl₅', 'Wściekle reaktywny i toksyczny opad wyniszczający wszystko w okolicy.', ['P','Cl','Cl','Cl','Cl','Cl']);
       enemy.hp -= 200 * forms;
       enemy.status.dotTimer += 10.0 * forms;
       enemy.status.dotDamage += 150 * forms;
       this.addParticle(enemy.pos, '#84cc16', 300, 35);
    }
`;

file = file.replace(/const a = enemy.atoms;/, 'const a = enemy.atoms;\n' + moreReactions);

const moreProjReactions = `
    // NCl3
    if (a.N >= 1 && a.Cl >= 3) {
       const forms = Math.floor(Math.min(a.N, a.Cl/3));
       a.N -= forms; a.Cl -= forms * 3;
       this.triggerReaction('ncl3', 'Trójchlorek Azotu', 'N + 3Cl ➔ NCl₃', 'Wielka strefowa eksplozja przy najmniejszym dotyku!', ['N','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#fbbf24', 450, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 350 * forms;
         }
       });
    }
    // PCl5
    if (a.P >= 1 && a.Cl >= 5) {
       const forms = Math.floor(Math.min(a.P, a.Cl/5));
       a.P -= forms; a.Cl -= forms * 5;
       this.triggerReaction('pcl5', 'Pentachlorek Fosforu', 'P + 5Cl ➔ PCl₅', 'Rozprysk potężnej toksyny kwasowej.', ['P','Cl','Cl','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#84cc16', 400, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 200 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }
`;

file = file.replace(/(\/\/ SiO2 Silicon[\s\S]*?\}\n\s*\})/m, '$1\n' + moreProjReactions);

fs.writeFileSync('src/game/GameEngine.ts', file);
console.log('More Reactions inserted!');

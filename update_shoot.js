const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const targetStr = `      if (p.selectedAtom === 'H') { speed = 700; radius = 5; damage = 5; newAtoms['H'] = 1; fireTime = 0.15; heatCost = 8; }
      else if (p.selectedAtom === 'O') { speed = 400; radius = 8; damage = 10; newAtoms['O'] = 1; fireTime = 0.20; heatCost = 12; }
      else if (p.selectedAtom === 'C') { speed = 450; radius = 9; damage = 12; newAtoms['C'] = 1; fireTime = 0.25; heatCost = 15; }
      else if (p.selectedAtom === 'N') { speed = 550; radius = 7; damage = 8; newAtoms['N'] = 1; fireTime = 0.20; heatCost = 12; }
      else if (p.selectedAtom === 'S') { speed = 350; radius = 10; damage = 15; newAtoms['S'] = 1; fireTime = 0.30; heatCost = 18; }
      else if (p.selectedAtom === 'Si') { speed = 300; radius = 12; damage = 8; newAtoms['Si'] = 1; fireTime = 0.35; heatCost = 20; }
      else if (p.selectedAtom === 'H2O') { speed = 600; radius = 12; damage = 0; newAtoms['H'] = 2; newAtoms['O'] = 1; p.stamina -= 12; fireTime = 0.4; heatCost = 30; }
      else if (p.selectedAtom === 'CH4') { speed = 350; radius = 15; damage = 0; newAtoms['C'] = 1; newAtoms['H'] = 4; p.stamina -= 25; fireTime = 0.5; heatCost = 45; }
      else if (p.selectedAtom === 'NH3') { speed = 400; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['H'] = 3; p.stamina -= 20; fireTime = 0.4; heatCost = 40; }
      else if (p.selectedAtom === 'CO2') { speed = 300; radius = 16; damage = 0; newAtoms['C'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 0.5; heatCost = 40; }
      else if (p.selectedAtom === 'NO2') { speed = 350; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['O'] = 2; p.stamina -= 15; fireTime = 0.4; heatCost = 35; }
      else if (p.selectedAtom === 'H2S') { speed = 400; radius = 18; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; p.stamina -= 30; fireTime = 0.6; heatCost = 50; }
      else if (p.selectedAtom === 'SO2') { speed = 300; radius = 15; damage = 0; newAtoms['S'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 0.5; heatCost = 45; }
      else if (p.selectedAtom === 'H2SO4') { speed = 250; radius = 20; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; newAtoms['O'] = 4; p.stamina -= 40; fireTime = 0.8; heatCost = 80; }
      else if (p.selectedAtom === 'SiO2') { speed = 300; radius = 18; damage = 0; newAtoms['Si'] = 1; newAtoms['O'] = 2; p.stamina -= 25; fireTime = 0.6; heatCost = 50; }
      else if (p.selectedAtom === 'SiC') { speed = 250; radius = 22; damage = 0; newAtoms['Si'] = 1; newAtoms['C'] = 1; p.stamina -= 35; fireTime = 0.7; heatCost = 60; }`;

const newStr = `      if (this.state.equippedWeapon !== 'super') {
          if (p.selectedAtom === 'H') { speed = 700; radius = 5; damage = 5; newAtoms['H'] = 1; fireTime = 0.15; heatCost = 8; }
          else if (p.selectedAtom === 'O') { speed = 400; radius = 8; damage = 10; newAtoms['O'] = 1; fireTime = 0.20; heatCost = 12; }
          else if (p.selectedAtom === 'C') { speed = 450; radius = 9; damage = 12; newAtoms['C'] = 1; fireTime = 0.25; heatCost = 15; }
          else if (p.selectedAtom === 'N') { speed = 550; radius = 7; damage = 8; newAtoms['N'] = 1; fireTime = 0.20; heatCost = 12; }
          else if (p.selectedAtom === 'S') { speed = 350; radius = 10; damage = 15; newAtoms['S'] = 1; fireTime = 0.30; heatCost = 18; }
          else if (p.selectedAtom === 'Si') { speed = 300; radius = 12; damage = 8; newAtoms['Si'] = 1; fireTime = 0.35; heatCost = 20; }
          else if (p.selectedAtom === 'H2O' as any) { speed = 600; radius = 12; damage = 0; newAtoms['H'] = 2; newAtoms['O'] = 1; p.stamina -= 12; fireTime = 0.4; heatCost = 30; }
          else if (p.selectedAtom === 'CH4' as any) { speed = 350; radius = 15; damage = 0; newAtoms['C'] = 1; newAtoms['H'] = 4; p.stamina -= 25; fireTime = 0.5; heatCost = 45; }
          else if (p.selectedAtom === 'NH3' as any) { speed = 400; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['H'] = 3; p.stamina -= 20; fireTime = 0.4; heatCost = 40; }
          else if (p.selectedAtom === 'CO2' as any) { speed = 300; radius = 16; damage = 0; newAtoms['C'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 0.5; heatCost = 40; }
          else if (p.selectedAtom === 'NO2' as any) { speed = 350; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['O'] = 2; p.stamina -= 15; fireTime = 0.4; heatCost = 35; }
          else if (p.selectedAtom === 'H2S' as any) { speed = 400; radius = 18; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; p.stamina -= 30; fireTime = 0.6; heatCost = 50; }
          else if (p.selectedAtom === 'SO2' as any) { speed = 300; radius = 15; damage = 0; newAtoms['S'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 0.5; heatCost = 45; }
          else if (p.selectedAtom === 'H2SO4' as any) { speed = 250; radius = 20; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; newAtoms['O'] = 4; p.stamina -= 40; fireTime = 0.8; heatCost = 80; }
          else if (p.selectedAtom === 'SiO2' as any) { speed = 300; radius = 18; damage = 0; newAtoms['Si'] = 1; newAtoms['O'] = 2; p.stamina -= 25; fireTime = 0.6; heatCost = 50; }
          else if (p.selectedAtom === 'SiC' as any) { speed = 250; radius = 22; damage = 0; newAtoms['Si'] = 1; newAtoms['C'] = 1; p.stamina -= 35; fireTime = 0.7; heatCost = 60; }
          else { speed = 0; fireTime = 0.1; }
      } else {
          if (p.selectedReaction === 'h2o') { speed = 800; radius = 20; damage = 50; newAtoms['H'] = 2; newAtoms['O'] = 1; p.stamina -= 20; fireTime = 0.8; heatCost = 50; }
          else if (p.selectedReaction === 'ch4') { speed = 600; radius = 30; damage = 100; newAtoms['C'] = 1; newAtoms['H'] = 4; p.stamina -= 40; fireTime = 1.2; heatCost = 80; }
          else if (p.selectedReaction === 'nh3') { speed = 650; radius = 25; damage = 80; newAtoms['N'] = 1; newAtoms['H'] = 3; p.stamina -= 35; fireTime = 1.0; heatCost = 70; }
          else if (p.selectedReaction === 'co2') { speed = 550; radius = 28; damage = 60; newAtoms['C'] = 1; newAtoms['O'] = 2; p.stamina -= 35; fireTime = 1.0; heatCost = 70; }
          else if (p.selectedReaction === 'no2') { speed = 600; radius = 24; damage = 70; newAtoms['N'] = 1; newAtoms['O'] = 2; p.stamina -= 30; fireTime = 0.9; heatCost = 65; }
          else if (p.selectedReaction === 'h2s') { speed = 650; radius = 32; damage = 90; newAtoms['H'] = 2; newAtoms['S'] = 1; p.stamina -= 45; fireTime = 1.2; heatCost = 75; }
          else if (p.selectedReaction === 'so2') { speed = 550; radius = 26; damage = 85; newAtoms['S'] = 1; newAtoms['O'] = 2; p.stamina -= 40; fireTime = 1.1; heatCost = 75; }
          else if (p.selectedReaction === 'h2so4') { speed = 500; radius = 40; damage = 150; newAtoms['H'] = 2; newAtoms['S'] = 1; newAtoms['O'] = 4; p.stamina -= 60; fireTime = 1.8; heatCost = 100; }
          else if (p.selectedReaction === 'sio2') { speed = 550; radius = 35; damage = 50; newAtoms['Si'] = 1; newAtoms['O'] = 2; p.stamina -= 40; fireTime = 1.2; heatCost = 80; }
          else if (p.selectedReaction === 'sic') { speed = 500; radius = 40; damage = 120; newAtoms['Si'] = 1; newAtoms['C'] = 1; p.stamina -= 50; fireTime = 1.5; heatCost = 90; }
          else { speed = 0; fireTime = 0.1; }
      }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/game/GameEngine.ts', code, 'utf8');
    console.log("Success!");
} else {
    console.log("Not found.");
}

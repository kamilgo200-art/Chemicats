const fs = require('fs');

const replacement = `  public devSpawnBoss(bossType: string) {
      if (this.state.state !== 'playing') return;
      
      const p = this.state.player;
      
      // Clear specific things
      this.state.enemies = [];
      this.state.projectiles = [];
      
      p.pos.x = 0;
      p.pos.y = 0;
      
      const cx = 0;
      const cy = -400;
      
         let bossName = '';
         let bossDesc = '';
         let bossHp = 10000;
         let bossSpeed = 100;
         let bossRadius = 35;
         let bossAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         
         if (bossType === 'Celery') {
             bossName = 'Sal su moner';
             bossDesc = 'Potężny Seler, wchłaniacz tlenu.';
             bossHp = 35000;
             bossSpeed = 60;
             bossRadius = 35;
             bossAtoms = { H: 0, O: 200, C: 50, N: 10, S: 5, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 10, K: 50, Mg: 20, Ca: 30 };
         } else if (bossType === 'SnakeGourdHead') {
             bossName = 'Tykwa węzowa z 4 oczami';
             bossDesc = 'Długa i niebezpieczna, osaczy Cię z każdej strony!';
             bossHp = 40000;
             bossSpeed = 160; 
             bossRadius = 45;
             bossAtoms = { H: 50, O: 50, C: 80, N: 20, S: 10, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 15, K: 40, Mg: 15, Ca: 20 };
         } else if (bossType === 'Hogweed') {
             bossName = 'Barszcz Sosnowskiego';
             bossDesc = 'Toksyczny i rozrastający się... Uważaj na żrący dotyk!';
             bossHp = 60000;
             bossSpeed = 40;
             bossRadius = 60;
             bossAtoms = { H: 100, O: 80, C: 120, N: 30, S: 20, Si: 0, Ra: 0, Po: 0, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
         } else if (bossType === 'Durian') {
             bossName = 'Radioaktywny Durian';
             bossDesc = 'Król owoców... Miotający sterylnymi kolcami i zatruwający otoczenie radem!';
             bossHp = 80000;
             bossSpeed = 70;
             bossRadius = 75;
             bossAtoms = { H: 40, O: 80, C: 100, N: 30, S: 150, Si: 20, Ra: 40, Po: 30, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
         } else if (bossType === 'GiantTree') {
             bossName = 'Pradawny Dąb';
             bossDesc = 'Monumentalne drzewo o gęstych korzeniach. Strzeż się barier drewnianych!';
             bossHp = 120000;
             bossSpeed = 0;
             bossRadius = 90;
             bossAtoms = { H: 200, O: 180, C: 320, N: 30, S: 20, Si: 40, Ra: 0, Po: 0, Cl: 0, P: 20, K: 80, Mg: 50, Ca: 60 };
         } else if (bossType === 'MutantPolimer') {
             bossName = 'Zmutowany Hiper-Polimer';
             bossDesc = 'Błąd natury. Niestabilna mutacja wszechrzeczy, chaos i destrukcja!';
             bossHp = 250000;
             bossSpeed = 200;
             bossRadius = 120;
             bossAtoms = { H: 100, O: 180, C: 220, N: 130, S: 120, Si: 50, Ra: 20, Po: 20, Cl: 130, P: 120, K: 160, Mg: 130, Ca: 140 };
         }

         bossHp = Math.floor(bossHp * (1 + (this.state.level - 1) * 0.5));
         const multiPlayerCount = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
         bossHp = Math.floor(bossHp * (1 + multiPlayerCount * 0.8));
         if (this.state.difficulty === 'kids') bossHp = Math.floor(bossHp * 0.3);
         if (this.state.difficulty === 'easy') bossHp = Math.floor(bossHp * 0.7);

         const headId = nextId++;
         this.state.enemies.push({
          id: headId,
          pos: { x: cx, y: cy },
          radius: bossRadius, speed: bossSpeed, hp: bossHp, maxHp: bossHp,
          type: bossType as any, atoms: { ...bossAtoms },
          attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
         });

         if (bossType === 'SnakeGourdHead') {
             let lastId = headId;
             for(let i=1; i<=35; i++) {
                 const segId = nextId++;
                 this.state.enemies.push({
                  id: segId,
                  pos: { x: cx, y: cy - i * 45 },
                  radius: 35, speed: bossSpeed, hp: Math.floor(12000 * (1 + (this.state.level - 1) * 0.5)), maxHp: Math.floor(12000 * (1 + (this.state.level - 1) * 0.5)),
                  type: 'SnakeGourdSegment' as any, atoms: { ...bossAtoms },
                  attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                  leaderId: lastId, segmentIndex: i
                 });
                 lastId = segId;
             }
         }
        
        this.state.showingBossIntro = true;
        this.state.bossIntroTimer = 4.0;
        this.state.bossIntroName = bossName;
        this.state.bossIntroDesc = bossDesc;
  }

  private spawnEnemiesForRoom(room: RoomInfo) {
    this.state.enemies = []; // Clear
    const roomCenterX = room.gridX * ROOM_WIDTH;
    const roomCenterY = room.gridY * ROOM_HEIGHT;
    
    if (room.isBoss) {
         let bossCount = this.state.level >= 4 ? 2 : 1;
         if (this.state.level >= 7) bossCount = 3;
         let fullBossName = '';
         let fullBossDesc = '';
         
         for (let bIndex = 0; bIndex < bossCount; bIndex++) {
             let bossType = 'Celery';
             if (this.state.level === 2) {
                 bossType = Math.random() < 0.5 ? 'SnakeGourdHead' : 'Hogweed';
             } else if (this.state.level === 3) {
                 const r = Math.random();
                 if (r < 0.25) bossType = 'SnakeGourdHead';
                 else if (r < 0.5) bossType = 'Hogweed';
                 else if (r < 0.75) bossType = 'Durian';
                 else bossType = 'GiantTree';
             } else if (this.state.level >= 4) {
                 bossType = Math.random() < 0.5 ? 'GiantTree' : 'MutantPolimer';
             }

             let bossName = '';
             let bossDesc = '';
             let bossHp = 10000;
             let bossSpeed = 100;
             let bossRadius = 35;
             let bossAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             
             if (bossType === 'Celery') {
                 bossName = 'Sal su moner';
                 bossDesc = 'Potężny Seler, wchłaniacz tlenu.';
                 bossHp = 35000;
                 bossSpeed = 60;
                 bossRadius = 35;
                 bossAtoms = { H: 0, O: 200, C: 50, N: 10, S: 5, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 10, K: 50, Mg: 20, Ca: 30 };
             } else if (bossType === 'SnakeGourdHead') {
                 bossName = 'Tykwa węzowa z 4 oczami';
                 bossDesc = 'Długa i niebezpieczna, osaczy Cię z każdej strony!';
                 bossHp = 40000;
                 bossSpeed = 160; 
                 bossRadius = 45;
                 bossAtoms = { H: 50, O: 50, C: 80, N: 20, S: 10, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 15, K: 40, Mg: 15, Ca: 20 };
             } else if (bossType === 'Hogweed') {
                 bossName = 'Barszcz Sosnowskiego';
                 bossDesc = 'Toksyczny i rozrastający się... Uważaj na żrący dotyk!';
                 bossHp = 60000;
                 bossSpeed = 40;
                 bossRadius = 60;
                 bossAtoms = { H: 100, O: 80, C: 120, N: 30, S: 20, Si: 0, Ra: 0, Po: 0, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
             } else if (bossType === 'Durian') {
                 bossName = 'Radioaktywny Durian';
                 bossDesc = 'Król owoców... Miotający sterylnymi kolcami i zatruwający otoczenie radem!';
                 bossHp = 80000;
                 bossSpeed = 70;
                 bossRadius = 75;
                 bossAtoms = { H: 40, O: 80, C: 100, N: 30, S: 150, Si: 20, Ra: 40, Po: 30, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
             } else if (bossType === 'GiantTree') {
                 bossName = 'Pradawny Dąb';
                 bossDesc = 'Monumentalne drzewo o gęstych korzeniach. Strzeż się barier drewnianych!';
                 bossHp = 120000;
                 bossSpeed = 0;
                 bossRadius = 90;
                 bossAtoms = { H: 200, O: 180, C: 320, N: 30, S: 20, Si: 40, Ra: 0, Po: 0, Cl: 0, P: 20, K: 80, Mg: 50, Ca: 60 };
             } else if (bossType === 'MutantPolimer') {
                 bossName = 'Zmutowany Hiper-Polimer';
                 bossDesc = 'Błąd natury. Niestabilna mutacja wszechrzeczy, chaos i destrukcja!';
                 bossHp = 250000;
                 bossSpeed = 200;
                 bossRadius = 120;
                 bossAtoms = { H: 100, O: 180, C: 220, N: 130, S: 120, Si: 50, Ra: 20, Po: 20, Cl: 130, P: 120, K: 160, Mg: 130, Ca: 140 };
             }

             bossHp = Math.floor(bossHp * (1 + (this.state.level - 1) * 0.5));
             const multiPlayerCount2 = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
             bossHp = Math.floor(bossHp * (1 + multiPlayerCount2 * 0.8));
             if (this.state.difficulty === 'kids') bossHp = Math.floor(bossHp * 0.3);
             if (this.state.difficulty === 'easy') bossHp = Math.floor(bossHp * 0.7);

             const headId = nextId++;
             let offsetX = 0;
             let offsetY = 0;
             if (bossCount === 2) {
                 offsetX = bIndex === 0 ? -150 : 150;
             }

             this.state.enemies.push({
              id: headId,
              pos: { x: roomCenterX + offsetX, y: roomCenterY + offsetY },
              radius: bossRadius, speed: bossSpeed, hp: bossHp, maxHp: bossHp,
              type: bossType as any, atoms: { ...bossAtoms },
              attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
             });

             if (bossType === 'SnakeGourdHead') {
                 let lastId = headId;
                 for(let i=1; i<=35; i++) {
                     const segId = nextId++;
                     this.state.enemies.push({
                      id: segId,
                      pos: { x: roomCenterX + offsetX, y: roomCenterY + offsetY - i * 45 },
                      radius: 35, speed: bossSpeed, hp: Math.floor(12000 * (1 + (this.state.level - 1) * 0.5)), maxHp: Math.floor(12000 * (1 + (this.state.level - 1) * 0.5)),
                      type: 'SnakeGourdSegment' as any, atoms: { ...bossAtoms },
                      attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                      leaderId: lastId, segmentIndex: i
                     });
                     lastId = segId;
                 }
             }
             
             if (bIndex === 0) {
                 fullBossName = bossName;
                 fullBossDesc = bossDesc;
             } else {
                 fullBossName += \` & \${bossName}\`;
                 fullBossDesc += \` + \${bossDesc}\`;
             }
         }
         
         this.state.showingBossIntro = true;
         this.state.bossIntroTimer = 4.0; // 4 seconds intro
         this.state.bossIntroName = fullBossName;
         this.state.bossIntroDesc = fullBossDesc;
         
         return;
    }

    const isMultiPlayer = this.state.networkPlayers && this.state.networkPlayers.length > 0;
`;

let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

const sIdx = code.indexOf('public devSpawnBoss(bossType: string) {');
const eIdxMatch = code.match(/const isMultiPlayer = this\.state\.networkPlayers && this\.state\.networkPlayers\.length > 0;/);

if (sIdx !== -1 && eIdxMatch) {
    const before = code.substring(0, sIdx);
    const after = code.substring(eIdxMatch.index + eIdxMatch[0].length);
    fs.writeFileSync('src/game/GameEngine.ts', before + replacement + after);
    console.log('Successfully repaired GameEngine.ts');
} else {
    console.log('Indexes not found!');
}

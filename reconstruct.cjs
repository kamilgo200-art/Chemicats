const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const replacement = `                                   } else {
                                      const isMultiplayer = localStorage.getItem("lanActive") === "true";
                                      const isBlackLocked = !isMultiplayer && st.selectedCharacter === 'black_cat' && !st.unlockedCharacters.includes('black_cat');
                                      const isBohrLocked = !isMultiplayer && st.selectedCharacter === 'bohr_cat' && !st.unlockedCharacters.includes('bohr_cat');
                                      const isCurieLocked = !isMultiplayer && st.selectedCharacter === 'curie_cat' && !st.unlockedCharacters.includes('curie_cat');
                                      const isMendelejewLocked = !isMultiplayer && st.selectedCharacter === 'mendelejew' && !st.unlockedCharacters.includes('mendelejew');
                                       
                                       if (isBlackLocked) {
                                           if (st.protons >= 1) {
                                               st.protons -= 1;
                                               st.unlockedCharacters.push('black_cat');
                                               st.characterSelected = true;
                                               engineRef.current?.selectCharacter(st.selectedCharacter);
                                               engineRef.current?.saveGame();
                                           } else { setShakeChar('black_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                       } else if (isBohrLocked) {
                                           if (st.protons >= 3) {
                                               st.protons -= 3;
                                               st.unlockedCharacters.push('bohr_cat');
                                               st.characterSelected = true;
                                               engineRef.current?.selectCharacter(st.selectedCharacter);
                                               engineRef.current?.saveGame();
                                           } else { setShakeChar('bohr_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                       } else if (isCurieLocked) {
                                            if (st.protons >= 10) {
                                                st.protons -= 10;
                                                st.unlockedCharacters.push('curie_cat');
                                                st.characterSelected = true;
                                                engineRef.current?.selectCharacter(st.selectedCharacter);
                                                engineRef.current?.saveGame();
                                            } else { setShakeChar('curie_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                        } else if (isMendelejewLocked) {
                                            setShakeChar('mendelejew'); setTimeout(() => setShakeChar(''), 1000);
                                        } else {
                                           st.characterSelected = true;
                                           engineRef.current?.selectCharacter(st.selectedCharacter);
                                           engineRef.current?.saveGame();
                                       }
                                       setTriggerRender(r => r + 1);
                                   }
                                   charTouchStartX.current = null;
                                }}
                                onPointerLeave={() => { charTouchStartX.current = null; }}
                             >
                                 {items.map((char, idx) => {
                                     const angle = (idx * (360 / items.length)) * (Math.PI / 180);
                                     const radius = window.innerWidth < 768 ? 90 : 130;
                                     const x = Math.sin(angle) * radius;
                                     const y = -Math.cos(angle) * radius;
                                     const selected = st.selectedCharacter === char;
                                     
                                     const isMulti = localStorage.getItem("lanActive") === "true";
                                     const isBlackLocked = !isMulti && char === 'black_cat' && !st.unlockedCharacters.includes('black_cat');
                                     const isBohrLocked = !isMulti && char === 'bohr_cat' && !st.unlockedCharacters.includes('bohr_cat');
                                     const isCurieLocked = !isMulti && char === 'curie_cat' && !st.unlockedCharacters.includes('curie_cat');
                                     const isMendelejewLocked = !isMulti && char === 'mendelejew' && !st.unlockedCharacters.includes('mendelejew');
                                     const isLocked = isBlackLocked || isBohrLocked || isCurieLocked || isMendelejewLocked;
                                     
                                     const isBlack = char === 'black_cat';
                                     const isBohr = char === 'bohr_cat';
                                     
                                     let name = '';
                                     if (char === 'ginger_cat') name = tx('Kinus Miauling (C)');
                                     else if (char === 'black_cat') {
                                         name = isBlackLocked ? tx('Czarny Kot (Odblokuj: 1 Proton)') : tx('Czarny Kot Mrocznik (H)');
                                     } else if (char === 'bohr_cat') {
                                         name = isBohrLocked ? tx('Bohr-kot (Odblokuj: 3 Protony)') : tx('Niels Bohr-kot (N)');
                                     } else if (char === 'curie_cat') {
                                         name = isCurieLocked ? tx('Miauria Purrie (Odblokuj: 10 Protonów)') : tx('Miauria Purrie Miałkowska (O)');
                                     } else if (char === 'mendelejew') {
                                         name = isMendelejewLocked ? tx('Mendelejew (Ukończ 5 pięter)') : tx('Dmitrij Mendelejew');
                                     }

                                     const shakeClass = shakeChar === char ? 'translate-x-1 rotate-3' : '';
                                     
                                     return (
                                         <div 
                                             key={char} 
                                             onClick={() => {
                                                 const st = engineRef.current!.state;
                                                 if (char === st.selectedCharacter) {
                                                     engineRef.current?.selectCharacter(st.selectedCharacter);
                                                     engineRef.current?.saveGame();
                                                 } else {
                                                    if (isBlackLocked) {
                                                        if (st.protons >= 1) {
                                                            st.protons -= 1;
                                                            st.unlockedCharacters.push('black_cat');
                                                            st.characterSelected = true;
                                                            engineRef.current?.selectCharacter(st.selectedCharacter);
                                                            engineRef.current?.saveGame();
                                                        } else { setShakeChar('black_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                                    } else if (isBohrLocked) {
                                                        if (st.protons >= 3) {
                                                            st.protons -= 3;
                                                            st.unlockedCharacters.push('bohr_cat');
                                                            st.characterSelected = true;
                                                            engineRef.current?.selectCharacter(st.selectedCharacter);
                                                            engineRef.current?.saveGame();
                                                        } else { setShakeChar('bohr_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                                    } else if (isCurieLocked) {
                                                        if (st.protons >= 10) {
                                                            st.protons -= 10;
                                                            st.unlockedCharacters.push('curie_cat');
                                                            st.characterSelected = true;
                                                            engineRef.current?.selectCharacter(st.selectedCharacter);
                                                            engineRef.current?.saveGame();
                                                        } else { setShakeChar('curie_cat'); setTimeout(() => setShakeChar(''), 1000); }
                                                    } else if (isMendelejewLocked) {
                                                        setShakeChar('mendelejew'); setTimeout(() => setShakeChar(''), 1000);
                                                    } else {
                                                        st.selectedCharacter = char as any;
                                                    }
                                                 }
                                                 setTriggerRender(r=>r+1);
                                             }}`;

const startIdx = code.indexOf('                                   } else {\n                                      const isMultiplayer = localStorage.getItem("lanActive") === "true";');
const endIdx = code.indexOf('className="absolute transition-all duration-75 cursor-pointer"');
console.log(startIdx, endIdx);
if (startIdx > -1 && endIdx > -1) {
    code = code.substring(0, startIdx) + replacement + '\n                                             ' + code.substring(endIdx);
    fs.writeFileSync('src/components/GameCanvas.tsx', code);
    console.log("FIXED");
} else {
    console.log("NOT FOUND");
}

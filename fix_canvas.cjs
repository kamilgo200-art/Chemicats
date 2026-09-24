const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const replacement = `                                   } else {
                                      const isMultiplayer = localStorage.getItem('lanActive') === 'true';
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
                                           } else {
                                               setShakeChar('black_cat');
                                               setTimeout(() => setShakeChar(''), 1000);
                                           }
                                       } else if (isBohrLocked) {
                                           if (st.protons >= 3) {
                                               st.protons -= 3;
                                               st.unlockedCharacters.push('bohr_cat');
                                               st.characterSelected = true;
                                               engineRef.current?.selectCharacter(st.selectedCharacter);
                                               engineRef.current?.saveGame();
                                           } else {
                                               setShakeChar('bohr_cat');
                                               setTimeout(() => setShakeChar(''), 1000);
                                           }
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
                                onPointerLeave={() => { charTouchStartX.current = null; }}`;

const regex = /} else \{\s*const isMultiplayer[\s\S]*?className="absolute transition-all/g;

// I will write this more precisely. Let's look for onPointerUp to <div className="absolute transition-all". No, wait.

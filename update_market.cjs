const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

let regex1 = /if \(st\.showingLobby\) setTriggerRender\(r => r \+ 1\);\s*\}\s*\}\s*if \(data\.type === 'broadcast'\) \{/;

let replaceWith1 = `                           if (st.showingLobby) setTriggerRender(r => r + 1);
                       }

                       if (data.state.stockPrice !== undefined) {
                           if (!st.stockPrice || st.stockPrice === 10 || data.state.investmentRoomCounter !== st.investmentRoomCounter) {
                               st.stockPrice = data.state.stockPrice;
                               st.bondsRoomsLeft = data.state.bondsRoomsLeft;
                               st.investmentRoomCounter = data.state.investmentRoomCounter;
                           }
                       }

                       if (data.state.unpaidTax !== undefined && Math.max(0, data.state.unpaidTax) < Math.max(0, st.unpaidTax)) {
                           st.unpaidTax = data.state.unpaidTax;
                           st.roomsSinceTaxOwed = data.state.roomsSinceTaxOwed;
                           st.policeSpawning = false;
                           // Clean police from state
                           st.enemies = st.enemies.filter(e => e.type !== 'PoliceCat');
                       }
                    }
                    if (data.type === 'broadcast') {`;

if (!regex1.test(code)) {
    console.error("Regex 1 failed");
    process.exit(1);
}
code = code.replace(regex1, replaceWith1);
fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log("Success");

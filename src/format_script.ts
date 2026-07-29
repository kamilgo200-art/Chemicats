import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf-8');

// Replace standard Math.floor(electrons) calls
content = content.replace(/\{Math\.floor\(engineRef\.current\.state\.electrons\)\}/g, '{formatMoney(engineRef.current.state.electrons)}');
content = content.replace(/\{engineRef\.current \? Math\.floor\(engineRef\.current\.state\.electrons\) : 0\}/g, '{engineRef.current ? formatMoney(engineRef.current.state.electrons) : 0}');

// Replace savings and bonds
content = content.replace(/\{Math\.floor\(engineRef\.current\.state\.savingsBalance\)\}/g, '{formatMoney(engineRef.current.state.savingsBalance)}');
content = content.replace(/\{Math\.floor\(engineRef\.current\.state\.bondsBalance\)\}/g, '{formatMoney(engineRef.current.state.bondsBalance)}');

// Replace unpaidTax in UI
content = content.replace(/\{Math\.ceil\(engineRef\.current\.state\.unpaidTax \|\| 0\)\}/g, '{formatMoney(Math.ceil(engineRef.current.state.unpaidTax || 0))}');
content = content.replace(/\{Math\.ceil\(engineRef\.current\.state\.unpaidTax\)\}/g, '{formatMoney(Math.ceil(engineRef.current.state.unpaidTax))}');
content = content.replace(/\{Math\.ceil\(e\.taxAmount\)\} e⁻/g, '{formatMoney(Math.ceil(e.taxAmount))} e⁻');
content = content.replace(/\{Math\.floor\(e\.incomeAmount\)\} e⁻/g, '{formatMoney(Math.floor(e.incomeAmount))} e⁻');

// Replace item cost
content = content.replace(/\{item\.cost\} e⁻/g, '{formatMoney(item.cost)} e⁻');
content = content.replace(/\{merc\.cost\} e⁻/g, '{formatMoney(merc.cost)} e⁻');

// Replace asset price
content = content.replace(/\{Math\.round\(asset\.currentPrice\)\}/g, '{formatMoney(asset.currentPrice)}');
content = content.replace(/\{Math\.round\(currentValue\)\}/g, '{formatMoney(currentValue)}');

fs.writeFileSync('src/components/GameCanvas.tsx', content);

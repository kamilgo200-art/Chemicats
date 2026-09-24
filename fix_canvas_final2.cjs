const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const badChunk = `                return (
                    <>
                        <button 
                            disabled={!canAfford}
                                return (
                    <>
                        <button 
                            disabled={!canAfford}`;

code = code.replace(badChunk, `                return (
                    <>
                        <button 
                            disabled={!canAfford}`);

fs.writeFileSync('src/components/GameCanvas.tsx', code);

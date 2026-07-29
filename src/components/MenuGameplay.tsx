import React, { useEffect, useRef, useState } from 'react';
import { PERIODIC_TABLE } from './PeriodicTable';

export const MenuGameplay = ({ selectedZ, customParticles, isAlchemyMode, alchemySynthesizing }: { selectedZ?: number, customParticles?: {p: number, n: number, e: number}, isAlchemyMode?: boolean, alchemySynthesizing?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [particleCount, setParticleCount] = useState({ p: 1, n: 0, e: 1 });
    const lastSelectTime = useRef<number>(0);
    const [autoMode, setAutoMode] = useState(true);
    const synthStartTime = useRef<number>(0);

    useEffect(() => {
        if (alchemySynthesizing) {
            synthStartTime.current = Date.now();
        } else {
            synthStartTime.current = 0;
        }
    }, [alchemySynthesizing]);

    useEffect(() => {
        if (customParticles) {
            setParticleCount(customParticles);
            setAutoMode(false);
        } else if (selectedZ) {
            const el = PERIODIC_TABLE.find(e => e.z === selectedZ);
            let p = selectedZ;
            let currentN = Math.round(p * 1.2); // przybliżona liczba neutronów
            if (p === 1) currentN = 0;
            if (p === 2) currentN = 2;
            setParticleCount({ p, n: currentN, e: p });
            setAutoMode(false);
            lastSelectTime.current = Date.now();
        }
    }, [selectedZ, customParticles]);

    useEffect(() => {
        if (customParticles) return; // Do not use interval if controlled
        const interval = setInterval(() => {
            if (!autoMode) {
                if (Date.now() - lastSelectTime.current > 20000) {
                    setAutoMode(true);
                } else {
                    return;
                }
            }
            
            setParticleCount(prev => {
                let p = prev.p;
                let n = prev.n;
                let e = prev.e;
                
                if (p < 8) {
                    if (Math.random() < 0.5) p++;
                    else if (n < p + 2) n++;
                    else e++;
                } else {
                    p = 1;
                    n = 0;
                    e = 1;
                }
                
                if (e < p) e++;
                
                return { p, n, e };
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [autoMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        
        const loop = (time: number) => {
            animationId = requestAnimationFrame(loop);
            
            const width = canvas.width;
            const height = canvas.height;
            const cx = width / 2;
            const cy = height / 2;
            
            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for(let i=0; i<width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,height); }
            for(let i=0; i<height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(width,i); }
            ctx.stroke();

            // Calculate electron config up to 137
            // Golden Vortex Background
            let synthProgress = 0;
            if (alchemySynthesizing && synthStartTime.current) {
                synthProgress = Math.min(1.0, (Date.now() - synthStartTime.current) / 2500); // 2.5 second anim
            }

            const vortexStrength = Math.min(1, Math.max(0.2, particleCount.p / 80)) * (1 + synthProgress * 15);
            const baseAngle = time * (0.0005 + synthProgress * 0.05); // Spin super fast
            
            ctx.save();
            ctx.translate(cx, cy);
            
            for(let i=0; i<30; i++) {
                ctx.beginPath();
                for(let r=0; r<Math.max(width,height); r+=10) {
                    const spiralA = baseAngle + (i * Math.PI*2/30) - (r*0.01 * vortexStrength) * (1 + synthProgress * 2);
                    const x = Math.cos(spiralA) * r;
                    const y = Math.sin(spiralA) * r;
                    if(r===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                }
                ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - i/30) * 0.15 * vortexStrength * (1 + synthProgress * 2)})`; // Amber/Gold colors
                ctx.lineWidth = 1 + (i%3)*0.5;
                ctx.stroke();
            }
            
            ctx.restore();

            // Calculate electron config
            // Madelung rule implementation for accurate electron shells
            const getElectronShells = (atomicNumber: number): number[] => {
                const shells = [0, 0, 0, 0, 0, 0, 0];
                const subshells = [
                    { shell: 0, capacity: 2 }, // 1s
                    { shell: 1, capacity: 2 }, // 2s
                    { shell: 1, capacity: 6 }, // 2p
                    { shell: 2, capacity: 2 }, // 3s
                    { shell: 2, capacity: 6 }, // 3p
                    { shell: 3, capacity: 2 }, // 4s
                    { shell: 2, capacity: 10 },// 3d
                    { shell: 3, capacity: 6 }, // 4p
                    { shell: 4, capacity: 2 }, // 5s
                    { shell: 3, capacity: 10 },// 4d
                    { shell: 4, capacity: 6 }, // 5p
                    { shell: 5, capacity: 2 }, // 6s
                    { shell: 3, capacity: 14 },// 4f
                    { shell: 4, capacity: 10 },// 5d
                    { shell: 5, capacity: 6 }, // 6p
                    { shell: 6, capacity: 2 }, // 7s
                    { shell: 4, capacity: 14 },// 5f
                    { shell: 5, capacity: 10 },// 6d
                    { shell: 6, capacity: 6 }  // 7p
                ];
                let electrons = atomicNumber;
                for (const sub of subshells) {
                    if (electrons <= 0) break;
                    const amount = Math.min(electrons, sub.capacity);
                    shells[sub.shell] += amount;
                    electrons -= amount;
                }
                return shells.filter(count => count > 0);
            };

            const electronShells = getElectronShells(particleCount.e);
            let electronOrbits = [35, 60, 95, 135, 185, 240, 305, 380];
            
            // SYNTHESIS COMPRESSION
            if (synthProgress > 0) {
                // Compress orbits aggressively towards the center
                electronOrbits = electronOrbits.map(r => r * Math.max(0.1, 1 - synthProgress * 1.5));
            }

            const usedShells = Math.max(1, electronShells.length);
            
            // Dynamic Zoom
            let nucRadius = 15 + Math.sqrt(particleCount.p + particleCount.n) * 2;
            if (synthProgress > 0) {
                nucRadius *= 1 + (synthProgress * 0.5); // expand nucleus slightly as it absorbs
            }
            
            const neededRadius = electronOrbits[usedShells - 1] + 20 + nucRadius * 0.5;
            const availableRadius = Math.min(cx, cy);
            let zoom = availableRadius / neededRadius;
            if (zoom > 1.2) zoom = 1.2;
            if (zoom < 0.2) zoom = 0.2;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(zoom, zoom);
            
            if (synthProgress >= 1.0) {
                // Final orb
                ctx.beginPath();
                ctx.arc(0, 0, 80, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#00ffcc';
                ctx.shadowBlur = 100;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Draw symbol
                const el = PERIODIC_TABLE.find(e => e.z === particleCount.p);
                if (el) {
                    ctx.font = 'bold 40px Inter';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000';
                    ctx.fillText(el.symbol, 0, 0);
                }
            } else {
                // Draw orbits
                ctx.lineWidth = 1/zoom;
                electronOrbits.forEach((radius, orbitIdx) => {
                    if (orbitIdx < electronShells.length) {
                        ctx.beginPath();
                        ctx.arc(0, 0, radius + nucRadius * 0.5, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - synthProgress)})`;
                        ctx.stroke();
                    }
                });

                // Draw Nucleus
                for (let i = 0; i < particleCount.p; i++) {
                    const r = ((i * 3.7) % (nucRadius * 0.8)) + 1;
                    const speed = (0.0015 + (nucRadius - r) * 0.00005) * (1 + synthProgress * 20);
                    const angle = (time * speed) + (i * Math.PI * 2 / Math.max(1, particleCount.p)) + (r * 0.3) + Math.sin(time/1000 + i)*0.1;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 1.78, 0, Math.PI * 2);
                    ctx.fillStyle = '#a855f7'; 
                    ctx.shadowColor = '#d8b4fe';
                    ctx.shadowBlur = 5;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                for (let i = 0; i < particleCount.n; i++) {
                    const r = ((i * 4.3) % (nucRadius * 0.9)) + 2;
                    const speed = (0.0015 + (nucRadius - r) * 0.00005) * (1 + synthProgress * 20);
                    const angle = (time * speed) + (i * Math.PI * 2 / Math.max(1, particleCount.n)) + (r * 0.3) + Math.cos(time/1000 + i)*0.1;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 1.77, 0, Math.PI * 2);
                    ctx.fillStyle = '#64748b'; 
                    ctx.shadowColor = '#cbd5e1';
                    ctx.shadowBlur = 5;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Draw Electrons
                for (let orbitIdx = 0; orbitIdx < electronShells.length; orbitIdx++) {
                    const numInThisOrbit = electronShells[orbitIdx];
                    if(numInThisOrbit <= 0) continue;
                    
                    const orbitR = electronOrbits[orbitIdx] + nucRadius * 0.5;
                    const orbitSpeed = (0.0015 - orbitIdx * 0.0001) * (1 + synthProgress * 25);
                    const orbitBaseAngle = time * orbitSpeed;

                    for (let i = 0; i < numInThisOrbit; i++) {
                        const angle = orbitBaseAngle + (i * Math.PI * 2 / numInThisOrbit);
                        const hoverR = orbitR + Math.sin(time/150 + i)*2;
                        const x = Math.cos(angle) * hoverR;
                        const y = Math.sin(angle) * hoverR;
                        
                        // Draw trail
                        ctx.beginPath();
                        for(let t=1; t<=5; t++) {
                            const pastAngle = angle - (t * 0.05 * Math.sign(orbitSpeed));
                            const pastX = Math.cos(pastAngle) * hoverR;
                            const pastY = Math.sin(pastAngle) * hoverR;
                            if(t===1) ctx.moveTo(pastX, pastY);
                            else ctx.lineTo(pastX, pastY);
                        }
                        ctx.strokeStyle = `rgba(253, 224, 71, ${0.4 * (1 - synthProgress)})`;
                        ctx.lineWidth = 2 + (1/zoom);
                        ctx.stroke();

                        // Draw actual electron
                        ctx.beginPath();
                        ctx.arc(x, y, 6, 0, Math.PI*2);
                        ctx.shadowColor = '#fde047';
                        ctx.shadowBlur = 10;
                        ctx.fillStyle = `rgba(253, 224, 71, ${1 - synthProgress})`;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            }
            
            ctx.restore();

            // Text Labels
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Protony: ${particleCount.p}`, 10, height - 40);
            ctx.fillText(`Neutrony: ${particleCount.n}`, 10, height - 25);
            ctx.fillText(`Elektrony: ${particleCount.e}`, 10, height - 10);
            
            const elData = PERIODIC_TABLE.find(e => e.z === particleCount.p);
            const elName = elData ? `${elData.symbol} (${elData.name})` : 'Zostań Architektem Atomów!';
            
            ctx.fillStyle = '#a78bfa';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(elName, width - 10, height - 10);
        };

        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [particleCount]);

    return (
        <div className="relative w-full aspect-video bg-[#0B0F19] rounded-xl overflow-hidden border border-white/5 flex flex-col shadow-[0_0_20px_rgba(167,139,250,0.15)] mt-1">
            <div className="absolute top-2 left-2 z-10 flex gap-2 items-center bg-black/80 px-2 py-1 rounded border border-white/10">
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Budowa Atomu</span>
            </div>
            <canvas ref={canvasRef} width={400} height={225} className="w-full h-full object-cover" />
        </div>
    );
}

import React, { useRef, useState, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';

interface TouchControlsProps {
    engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [leftStick, setLeftStick] = useState<{ active: boolean, id: number | null, start: {x: number, y: number}, current: {x: number, y: number} }>({ active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} });
    const [rightStick, setRightStick] = useState<{ active: boolean, id: number | null, start: {x: number, y: number}, current: {x: number, y: number} }>({ active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} });
    const [canRevive, setCanRevive] = useState(false);

    useEffect(() => {
        let frame: number;
        const checkRevive = () => {
            if (engine.state.state === 'playing' && engine.state.networkPlayers && engine.state.networkPlayers.length > 0) {
                const nearDead = engine.state.networkPlayers.some((np: any) => 
                    np.isDead && Math.hypot(np.pos.x - engine.state.player.pos.x, np.pos.y - engine.state.player.pos.y) < 150
                );
                if (nearDead !== canRevive) {
                    setCanRevive(nearDead);
                }
            } else if (canRevive) {
                setCanRevive(false);
            }
            frame = requestAnimationFrame(checkRevive);
        };
        frame = requestAnimationFrame(checkRevive);
        return () => cancelAnimationFrame(frame);
    }, [engine, canRevive]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const halfWidth = window.innerWidth / 2;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Safety check for the drum or menu clicks
            const isNearDrum = touch.clientX > window.innerWidth - 130 && touch.clientY > window.innerHeight * 0.15 && touch.clientY < window.innerHeight * 0.60;
            if (isNearDrum) continue;

            setLeftStick(prev => {
                if (touch.clientX < halfWidth && !prev.active) {
                    return { active: true, id: touch.identifier, start: {x: touch.clientX, y: touch.clientY}, current: {x: touch.clientX, y: touch.clientY} };
                }
                return prev;
            });
            setRightStick(prev => {
                if (touch.clientX >= halfWidth && !prev.active) {
                    engine.state.isJoystickShooting = true;
                    return { active: true, id: touch.identifier, start: {x: touch.clientX, y: touch.clientY}, current: {x: touch.clientX, y: touch.clientY} };
                }
                return prev;
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            setLeftStick(prev => {
                if (prev.active && touch.identifier === prev.id) {
                    return { ...prev, current: {x: touch.clientX, y: touch.clientY} };
                }
                return prev;
            });
            setRightStick(prev => {
                if (prev.active && touch.identifier === prev.id) {
                    return { ...prev, current: {x: touch.clientX, y: touch.clientY} };
                }
                return prev;
            });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            setLeftStick(prev => {
                if (prev.active && touch.identifier === prev.id) {
                    engine.state.joystickMove = {x: 0, y: 0};
                    return { active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} };
                }
                return prev;
            });
            setRightStick(prev => {
                if (prev.active && touch.identifier === prev.id) {
                    engine.state.joystickAim = {x: 0, y: 0};
                    engine.state.isJoystickShooting = false;
                    return { active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} };
                }
                return prev;
            });
        }
    };

    useEffect(() => {
        const resetInputs = () => {
            setLeftStick({ active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} });
            setRightStick({ active: false, id: null, start: {x:0,y:0}, current: {x:0,y:0} });
            engine.state.joystickMove = {x: 0, y: 0};
            engine.state.joystickAim = {x: 0, y: 0};
            engine.state.isJoystickShooting = false;
            Object.keys(engine.state.keys).forEach(k => {
                engine.state.keys[k] = false;
            });
        };
        window.addEventListener('blur', resetInputs);
        window.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'mouse') {
                if (e.target === document || e.target === document.documentElement) {
                    resetInputs();
                }
            }
        });
        return () => {
            window.removeEventListener('blur', resetInputs);
        };
    }, [engine]);

    useEffect(() => {
        const maxR = 60; // Increased visual maximum radius for smoother travel
        const deadzone = 12; // Deadzone threshold in pixels

        if (leftStick.active) {
            let dx = leftStick.current.x - leftStick.start.x;
            let dy = leftStick.current.y - leftStick.start.y;
            const dist = Math.hypot(dx, dy);

            if (dist < deadzone) {
                engine.state.joystickMove = { x: 0, y: 0 };
            } else {
                // Apply a quadratic curve for finer movement controls and smooth transitions
                const clampedDist = Math.min(dist, maxR);
                const scale = (clampedDist - deadzone) / (maxR - deadzone);
                const speedMult = Math.pow(scale, 1.25); // smoother curve
                
                // Get angle
                const angle = Math.atan2(dy, dx);
                engine.state.joystickMove = {
                    x: Math.cos(angle) * speedMult,
                    y: Math.sin(angle) * speedMult
                };
            }
        }
        if (rightStick.active) {
            let dx = rightStick.current.x - rightStick.start.x;
            let dy = rightStick.current.y - rightStick.start.y;
            const dist = Math.hypot(dx, dy);

            if (dist < deadzone) {
                engine.state.joystickAim = { x: 0, y: 0 };
            } else {
                const clampedDist = Math.min(dist, maxR);
                const scale = (clampedDist - deadzone) / (maxR - deadzone);
                const speedMult = Math.pow(scale, 1.1); // slightly tighter curve for aiming
                
                const angle = Math.atan2(dy, dx);
                engine.state.joystickAim = {
                    x: Math.cos(angle) * speedMult,
                    y: Math.sin(angle) * speedMult
                };
            }
        }
    }, [leftStick, rightStick, engine]);

    const renderStick = (stick: any) => {
        if (!stick.active) return null;
        let dx = stick.current.x - stick.start.x;
        let dy = stick.current.y - stick.start.y;
        const maxR = 60;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
        }

        return (
            <div style={{ position: 'absolute', left: stick.start.x, top: stick.start.y, pointerEvents: 'none', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
                <div className="w-[120px] h-[120px] rounded-full bg-slate-900/60 relative border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-sm flex items-center justify-center">
                    <div className="w-[45px] h-[45px] rounded-full bg-white/30 absolute shadow-inner border border-white/50" style={{ transform: `translate(${dx}px, ${dy}px)` }} />
                </div>
            </div>
        );
    };

    return (
        <div 
            ref={containerRef}
            className={`absolute inset-0 z-40 touch-none flex lg:hidden pointer-events-none`}
        >
            {/* Split touchscreen input zones so they do not block drum or menu at the upper top half of viewport */}
            {engine.state.characterSelected && (
                <>
                    {/* Left Touchpad Zone for Movement (Bottom 80% left half) */}
                    <div 
                        className="absolute left-0 bottom-0 w-[45vw] h-[80vh] pointer-events-auto touch-none bg-transparent"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                    />

                    {/* Right Touchpad Zone for Shooting (Bottom 80% right half) */}
                    <div 
                        className="absolute right-0 bottom-0 w-[45vw] h-[80vh] pointer-events-auto touch-none bg-transparent"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                    />
                </>
            )}

            {/* Left Joystick Persistent Visual Guide in Bottom Left Corner */}
            {engine.state.characterSelected && !leftStick.active && (
                <div 
                    style={{ position: 'absolute', left: 110, bottom: 110, pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}
                    className="opacity-30 flex flex-col items-center gap-1.5"
                >
                    <div className="w-[110px] h-[110px] rounded-full bg-slate-950/40 border-2 border-dashed border-white/20 flex items-center justify-center shadow-md">
                        <div className="w-[45px] h-[45px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-white text-xs opacity-20">🕹️</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">KCIUK IDŹ</span>
                </div>
            )}

            {engine.state.characterSelected && renderStick(leftStick)}
            {engine.state.characterSelected && renderStick(rightStick)}
            
            {/* Auto-Aim Toggle */}
            {engine.state.characterSelected && (
            <div className="absolute top-[65vh] left-4 z-50 pointer-events-auto flex flex-col gap-1 items-center bg-black/20 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">Auto Aim</span>
                <div 
                    className={`relative w-[50px] h-[28px] rounded-full border-2 ${engine.state.autoAim ? 'bg-green-900/80 border-green-500/80' : 'bg-slate-900/80 border-slate-600/80'} shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] cursor-pointer transition-colors duration-300`}
                    onTouchStart={(e) => { e.stopPropagation(); engine.state.autoAim = !engine.state.autoAim; }}
                    onMouseDown={(e) => { e.stopPropagation(); engine.state.autoAim = !engine.state.autoAim; }}
                >
                    <div className={`absolute top-0.5 left-0.5 w-[20px] h-[20px] rounded-full shadow-md transition-transform duration-300 ${engine.state.autoAim ? 'translate-x-[22px] bg-gradient-to-b from-green-300 to-green-500' : 'translate-x-0 bg-gradient-to-b from-slate-400 to-slate-600'}`} />
                </div>
            </div>
            )}

            {/* Dash Button */}
            {engine.state.characterSelected && (
            <div 
                className="absolute right-6 bottom-[40vh] md:bottom-[20vh] flex flex-col gap-2 items-center z-50"
            >
                {canRevive && (
                    <div 
                        className="w-14 h-14 bg-green-500/80 backdrop-blur-md rounded-full flex items-center justify-center active:bg-green-400 border border-green-300 pointer-events-auto scale-110 mb-2 animate-pulse"
                        onTouchStart={(e) => { e.stopPropagation(); engine.state.keys['e'] = true; }}
                        onTouchEnd={(e) => { e.stopPropagation(); engine.state.keys['e'] = false; }}
                        onMouseDown={(e) => { e.stopPropagation(); engine.state.keys['e'] = true; }}
                        onMouseUp={(e) => { e.stopPropagation(); engine.state.keys['e'] = false; }}
                    >
                        <div className="text-white font-bold text-[9px] text-center leading-tight uppercase">Odradz<br/>(4s)</div>
                    </div>
                )}
                <div 
                    className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center active:bg-white/30 border border-white/20 pointer-events-auto scale-110"
                    onTouchStart={(e) => { e.stopPropagation(); engine.state.keys[' '] = true; }}
                    onTouchEnd={(e) => { e.stopPropagation(); engine.state.keys[' '] = false; }}
                >
                    <div className="text-white font-bold text-[10px] uppercase opacity-70">Dash</div>
                </div>
            </div>
            )}
        </div>
    );
};

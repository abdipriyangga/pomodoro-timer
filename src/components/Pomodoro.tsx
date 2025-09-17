"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Orbitron } from 'next/font/google';
const orbitron = Orbitron({ subsets: ["latin"], weight: ["700"] });
const Pomodoro = () => {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'work' | 'break'>('work');

    const workSoundRef = useRef<HTMLAudioElement | null>(null);
    const breakSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setMounted(true);

        // preload audio
        workSoundRef.current = new Audio("/audios/cartoon-hammer.mp3");
        breakSoundRef.current = new Audio("/audios/rainy-riveri.mp3");

        // looping break music
        if (breakSoundRef.current) {
            breakSoundRef.current.loop = true;
            breakSoundRef.current.volume = 1;
        }
    }, []);

    // fungsi fade out
    const fadeOut = (audio: HTMLAudioElement) => {
        const fadeInterval = setInterval(() => {
            if (audio.volume > 0.05) {
                audio.volume = +(audio.volume - 0.05).toFixed(2);
            } else {
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fadeInterval);
            }
        }, 100); // setiap 100ms turunin volume
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if(isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000)
            if(mode === 'break' && breakSoundRef.current) {
                if(breakSoundRef.current.paused) {
                    breakSoundRef.current.volume = 1;
                    breakSoundRef.current?.play();
                }
            }
        } else if(timeLeft === 0) {
            if(mode === 'work') {
                workSoundRef.current?.play();
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                if(breakSoundRef.current) {
                    fadeOut(breakSoundRef.current);
                }
                setMode('work');
                setTimeLeft(25 * 60);
            }
            setIsRunning(false);
        } else {
            if(mode === 'break' && breakSoundRef.current) {
                fadeOut(breakSoundRef.current);
            }
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft, mode])

    if (!mounted) return null

    const formatTime = (seconds: number) => {
        const minute = Math.floor(seconds / 60).toString().padStart(2, '0');
        const second = (seconds % 60).toString().padStart(2, '0');
        return `${minute}:${second}`
    }

    const handleStartPause = () => {
        setIsRunning((prev) => {
            const newState = !prev;
            // kalau baru mulai di break mode → play musik break
            if (newState && mode === "break" && breakSoundRef.current) {
                breakSoundRef.current.volume = 1;
                breakSoundRef.current?.play();
            } else if(!newState && mode === 'break' && breakSoundRef.current) {
                fadeOut(breakSoundRef.current)
            }
            return newState;
        });
    };
    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
        // reset musik break
        if (breakSoundRef.current) {
            fadeOut(breakSoundRef.current)
        }
    };
    return (
        <div className='flex flex-col bg-slate-900 justify-center min-h-screen items-center text-white'>
            <h1 className={`${orbitron.className} text-4xl mb-6 font-bold`}>Pomodoro Timer</h1>
            <div className={`${orbitron.className} text-6xl mb-6 font-bold tracking-widest text-indigo-500 shadow-[0_0_20px_#7300ff] p-2`}>{formatTime(timeLeft)}</div>
            <p className={`${orbitron.className} text-lg capitalize mb-6`}>{mode} Mode</p>
            <div className='space-x-4'>
                <button onClick={handleStartPause} className={`${orbitron.className} bg-indigo-500 rounded-lg px-4 py-2 hover:bg-indigo-900 transition`}>{
                        isRunning ? 'Pause' : 'Start'
                    }</button>
                <button onClick={handleReset} className={`${orbitron.className} bg-red-500 rounded-lg px-4 py-2 hover:bg-red-900 transition`}>Reset</button>
            </div>
        </div>
    )
}

export default Pomodoro
"use client";

import React, { useState, useEffect, useRef } from "react";
import { uploadImage } from "@/lib/api";

const MonitorScreen = () => {
    const [bootStep, setBootStep] = useState(0);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Boot Sequence
    useEffect(() => {
        const sequence = [
            { text: "Acorn OS 32K", delay: 1000 },
            { text: "", delay: 500 },
            { text: "BASIC", delay: 500 },
            { text: ">", delay: 200 },
        ];

        let currentDelay = 0;
        sequence.forEach((step, index) => {
            currentDelay += step.delay;
            setTimeout(() => {
                setBootStep(index + 1);
                if (step.text === ">") {
                    // Ready for input
                }
            }, currentDelay);
        });
    }, []);

    const handleCommand = async (cmd: string) => {
        const cleanCmd = cmd.trim().toUpperCase();
        setHistory((prev) => [...prev, `>${cmd}`]);

        if (cleanCmd === "LOAD" || cleanCmd === "UPLOAD") {
            fileInputRef.current?.click();
        } else if (cleanCmd === "HELP") {
            setHistory((prev) => [...prev, "COMMANDS: LOAD, HELP, CLS"]);
        } else if (cleanCmd === "CLS") {
            setHistory([]);
        } else if (cleanCmd === "") {
            // Do nothing
        } else {
            setHistory((prev) => [...prev, "Bad command"]);
        }
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCommand(input);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setHistory((prev) => [...prev, `LOADING "${file.name}"...`]);
        setIsProcessing(true);

        try {
            const { enhanced_url } = await uploadImage(file);

            setHistory((prev) => [...prev, "PROCESSING COMPLETE."]);
            setHistory((prev) => [...prev, "SAVING..."]);

            // Auto download
            const link = document.createElement("a");
            link.href = enhanced_url;
            link.download = `enhanced_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setHistory((prev) => [...prev, "READY."]);
        } catch (error) {
            setHistory((prev) => [...prev, "ERROR: LOAD FAILED"]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div
            className="w-full h-full bg-black text-green-500 font-mono p-4 overflow-hidden select-none"
            style={{
                fontFamily: "'Press Start 2P', monospace", // We'll need to load this font
                textShadow: "0 0 5px #00ff00",
            }}
            onClick={() => document.getElementById("cmd-input")?.focus()}
        >
            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />

            <div className="relative z-0">
                {bootStep >= 1 && <div>Acorn OS 32K</div>}
                {bootStep >= 2 && <br />}
                {bootStep >= 3 && <div>BASIC</div>}
                {bootStep >= 4 && <br />}

                {history.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}

                {bootStep >= 4 && !isProcessing && (
                    <div className="flex">
                        <span>&gt;</span>
                        <input
                            id="cmd-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none outline-none text-green-500 ml-2 w-full font-inherit uppercase caret-green-500"
                            autoFocus
                        />
                    </div>
                )}

                {isProcessing && <div className="animate-pulse">WORKING...</div>}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};

export default MonitorScreen;

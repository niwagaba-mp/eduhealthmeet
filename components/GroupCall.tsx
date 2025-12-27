
import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, MessageSquare, LayoutGrid } from 'lucide-react';

interface GroupCallProps {
    title: string;
    participants: string[]; // Names or avatars
    type: 'patient' | 'doctor';
    onEndCall: () => void;
}

const GroupCall: React.FC<GroupCallProps> = ({ title, participants, type, onEndCall }) => {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="h-16 bg-slate-950 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type === 'doctor' ? 'bg-purple-600' : 'bg-teal-600'}`}>
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">{title}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {formatTime(duration)} • {participants.length + 1} Participants
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><LayoutGrid size={20} /></button>
                    <button className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><MessageSquare size={20} /></button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                {/* Self */}
                <div className="bg-slate-800 rounded-xl overflow-hidden relative border-2 border-blue-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {cameraOn ? (
                            <span className="text-slate-500 text-sm">You (Camera On)</span>
                        ) : (
                            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                                <VideoOff className="text-slate-500" />
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">You</div>
                    <div className="absolute bottom-3 right-3">
                        {!micOn && <div className="bg-red-500 p-1.5 rounded-full"><MicOff size={12} className="text-white" /></div>}
                    </div>
                </div>

                {/* Others */}
                {participants.map((p, i) => (
                    <div key={i} className="bg-slate-800 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${p}&background=random`} 
                                alt={p} 
                                className="w-20 h-20 rounded-full opacity-50"
                            />
                        </div>
                        <div className="absolute bottom-3 left-3 text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">{p}</div>
                        {/* Simulate talking */}
                        {i % 2 === 0 && (
                            <div className="absolute inset-0 border-4 border-green-500/50 rounded-xl animate-pulse"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="h-24 bg-slate-950 flex items-center justify-center gap-6">
                <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full transition-all ${micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}>
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                
                <button onClick={onEndCall} className="px-8 py-4 bg-red-600 rounded-full text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/20">
                    <PhoneOff size={24} />
                    <span className="hidden md:inline">Leave Call</span>
                </button>

                <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'}`}>
                    {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
        </div>
    );
};

export default GroupCall;

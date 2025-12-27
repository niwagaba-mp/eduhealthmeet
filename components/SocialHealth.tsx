
import React, { useState } from 'react';
import { WellnessStatus, User } from '../types';
import { Heart, MessageCircle, Share2, CheckCircle2, Activity, Users, Dumbbell, Pill, MessageSquare, Phone, UserCheck } from 'lucide-react';

interface SocialHealthProps {
    user: User;
    onChat: (target: { id: string; name: string; avatar: string; role: string }) => void;
}

const MOCK_STATUSES: WellnessStatus[] = [
    { id: '1', userId: 'u2', userName: 'Mama Sarah', userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg', type: 'VITAL_UPDATE', content: 'Blood pressure is 120/80 today! Thanks to the diet plan.', cheers: 45, timestamp: '2h ago', verified: true },
    { id: '2', userId: 'u3', userName: 'John K.', userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', type: 'WORKOUT', content: 'Walked 10,000 steps around the village market.', cheers: 120, timestamp: '4h ago', verified: false },
    { id: '3', userId: 'u4', userName: 'Baby Joy', userAvatar: 'https://randomuser.me/api/portraits/women/12.jpg', type: 'MILESTONE', content: 'Completed all Polio vaccines today! 💪', cheers: 200, timestamp: '1h ago', verified: true },
];

const SocialHealth: React.FC<SocialHealthProps> = ({ user, onChat }) => {
    const [statuses, setStatuses] = useState<WellnessStatus[]>(MOCK_STATUSES);
    const [newStatus, setNewStatus] = useState('');
    const [statusType, setStatusType] = useState<'VITAL_UPDATE' | 'WORKOUT' | 'MEDICATION'>('VITAL_UPDATE');

    const handlePost = () => {
        if (!newStatus.trim()) return;
        const post: WellnessStatus = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            type: statusType,
            content: newStatus,
            cheers: 0,
            timestamp: 'Just now',
            verified: false
        };
        setStatuses([post, ...statuses]);
        setNewStatus('');
    };

    const handleCheers = (id: string) => {
        setStatuses(statuses.map(s => s.id === id ? { ...s, cheers: s.cheers + 1 } : s));
    };

    const MOCK_VHT = {
        id: 'vht1',
        name: 'Grace (VHT)',
        avatar: 'https://randomuser.me/api/portraits/women/60.jpg',
        role: 'Community Health Worker'
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header - Village Square */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">The Village Square</h2>
                    <p className="text-emerald-100">Celebrating health wins, every single day. Join the conversation.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Users size={150} />
                </div>
            </div>

            {/* My VHT Widget */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={MOCK_VHT.avatar} className="w-12 h-12 rounded-full border-2 border-emerald-100" alt="VHT" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">My Assigned Health Worker</p>
                        <h4 className="font-bold text-slate-800">{MOCK_VHT.name}</h4>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onChat(MOCK_VHT)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Message VHT">
                        <MessageCircle size={20} />
                    </button>
                    <button onClick={() => alert("Calling VHT...")} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Call VHT">
                        <Phone size={20} />
                    </button>
                </div>
            </div>

            {/* Status Input */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                    <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-emerald-100" alt="Me" />
                    <input 
                        type="text" 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="What's your health win today?" 
                        className="flex-1 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button onClick={() => setStatusType('VITAL_UPDATE')} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${statusType === 'VITAL_UPDATE' ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Activity size={14}/> Vitals</button>
                        <button onClick={() => setStatusType('WORKOUT')} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${statusType === 'WORKOUT' ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Dumbbell size={14}/> Activity</button>
                        <button onClick={() => setStatusType('MEDICATION')} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${statusType === 'MEDICATION' ? 'bg-purple-100 text-purple-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Pill size={14}/> Meds</button>
                    </div>
                    <button onClick={handlePost} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm">
                        Share Status
                    </button>
                </div>
            </div>

            {/* Status Feed */}
            <div className="space-y-4">
                {statuses.map((status) => (
                    <div key={status.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-0.5 rounded-full ${status.cheers > 50 ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-slate-200'}`}>
                                    <img src={status.userAvatar} className="w-10 h-10 rounded-full border-2 border-white" alt={status.userName} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                        {status.userName}
                                        {status.verified && <CheckCircle2 size={12} className="text-blue-500" />}
                                    </h4>
                                    <p className="text-xs text-slate-500">{status.timestamp}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                status.type === 'VITAL_UPDATE' ? 'bg-blue-50 text-blue-600' :
                                status.type === 'WORKOUT' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                                {status.type.replace('_', ' ')}
                            </span>
                        </div>
                        
                        <p className="text-slate-700 mb-4 ml-14 text-sm leading-relaxed">{status.content}</p>

                        <div className="flex items-center gap-6 ml-14">
                            <button onClick={() => handleCheers(status.id)} className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold group">
                                <div className="p-1.5 rounded-full bg-slate-50 group-hover:bg-rose-50 transition-colors">
                                    <Heart size={16} className="group-hover:fill-rose-500 transition-colors" />
                                </div>
                                {status.cheers} Cheers
                            </button>
                            <button onClick={() => alert("Comment feature coming soon!")} className="flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors text-xs font-bold">
                                <MessageSquare size={16} /> Comment
                            </button>
                            <button onClick={() => alert("Shared to timeline!")} className="flex items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors text-xs font-bold ml-auto">
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialHealth;

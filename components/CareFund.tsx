

import React, { useState } from 'react';
import { CareCase } from '../types';
import { Heart, Users, CheckCircle2, AlertCircle, Share2, Wallet, MapPin, Activity, ChevronRight, Copy, Link as LinkIcon, Lock } from 'lucide-react';

interface CareFundProps {
    onDonate: (amount: number, caseId: string) => boolean;
}

const MOCK_CASES: CareCase[] = [
    {
        id: '1',
        patientName: 'Baby Joseph',
        patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        age: 4,
        location: 'Gulu District',
        title: 'Urgent Heart Surgery Needed for Joseph',
        summary: 'Diagnosed with a congenital heart defect, Joseph needs corrective surgery to survive.',
        fullStory: 'Joseph was born with a hole in his heart. His parents are subsistence farmers in Gulu and cannot afford the specialized surgery required at the Uganda Heart Institute. The funds will cover the surgery, ICU stay, and post-op medication.',
        familyBackground: 'Father is a farmer, Mother sells produce. Total monthly income approx 150,000 UGX. 3 other siblings.',
        condition: 'Ventricular Septal Defect (VSD)',
        hospital: 'Uganda Heart Institute, Mulago',
        treatingDoctor: {
            name: 'Dr. Peter Lwanga',
            avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
            specialization: 'Pediatric Cardiologist',
            verified: true
        },
        caseImages: [
            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1516574187841-693083f69802?auto=format&fit=crop&q=80&w=800'
        ],
        amountNeeded: 15000000,
        amountRaised: 8500000,
        donorsCount: 142,
        endDate: '2024-06-30',
        verified: true
    },
    {
        id: '2',
        patientName: 'Grace N.',
        patientAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200',
        age: 32,
        location: 'Kampala',
        title: 'Support Grace\'s Kidney Transplant Recovery',
        summary: 'Post-transplant medication is critical for Grace to prevent organ rejection.',
        fullStory: 'Grace successfully underwent a kidney transplant last month thanks to a donor. However, the anti-rejection medication cost is overwhelming for her family. She needs support for the next 6 months of medication.',
        familyBackground: 'Single mother of two. Used to work as a teacher but had to stop due to illness.',
        condition: 'End-Stage Renal Disease (Recovery)',
        hospital: 'Cynosure Medical Center',
        treatingDoctor: {
            name: 'Dr. Sarah K.',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            specialization: 'Nephrologist',
            verified: true
        },
        caseImages: [
            'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800'
        ],
        amountNeeded: 5000000,
        amountRaised: 1200000,
        donorsCount: 45,
        endDate: '2024-07-15',
        verified: true
    }
];

const CareFund: React.FC<CareFundProps> = ({ onDonate }) => {
    const [selectedCase, setSelectedCase] = useState<CareCase | null>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [shareUrlCopied, setShareUrlCopied] = useState(false);

    const handleDonate = () => {
        if (!donationAmount || !selectedCase) return;
        const amount = parseInt(donationAmount);
        if (amount <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }
        
        if (confirm(`Confirm donation of ${amount.toLocaleString()} UGX to ${selectedCase.patientName}'s fund?`)) {
            const success = onDonate(amount, selectedCase.id);
            if (success) {
                setDonationAmount('');
                // Success feedback is handled by App Toast, but we can clear specific UI state here
            }
        }
    };

    const handleShare = () => {
        if (!selectedCase) return;
        const fakeUrl = `https://eduwellness.app/carefund/case/${selectedCase.id}`;
        navigator.clipboard.writeText(fakeUrl).then(() => {
            setShareUrlCopied(true);
            setTimeout(() => setShareUrlCopied(false), 2000);
        });
    };

    if (selectedCase) {
        return (
            <div className="animate-fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row h-full">
                {/* Left: Images & Story */}
                <div className="lg:w-2/3 p-6 lg:p-8 overflow-y-auto">
                    <button onClick={() => setSelectedCase(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1">
                        ← Back to all cases
                    </button>
                    
                    <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden mb-6 group">
                        <img src={selectedCase.caseImages[0]} alt="Case" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedCase.title}</h2>
                                <div className="flex items-center gap-4 text-white/90 text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {selectedCase.location}</span>
                                    <span className="flex items-center gap-1"><Activity size={16} /> {selectedCase.condition}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">About the Patient</h3>
                            <div className="flex items-start gap-4 mb-4">
                                <img src={selectedCase.patientAvatar} alt={selectedCase.patientName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{selectedCase.patientName}, {selectedCase.age} yrs</p>
                                    <p className="text-slate-600 mt-1 leading-relaxed">{selectedCase.fullStory}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Family Background</h3>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedCase.familyBackground}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Medical Verification</h3>
                            <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-xl border border-teal-100">
                                <img src={selectedCase.treatingDoctor.avatar} className="w-12 h-12 rounded-full border border-teal-200" alt="Doctor" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-teal-900">{selectedCase.treatingDoctor.name}</p>
                                        {selectedCase.treatingDoctor.verified && <CheckCircle2 size={16} className="text-teal-600" />}
                                    </div>
                                    <p className="text-sm text-teal-700">{selectedCase.treatingDoctor.specialization}</p>
                                    <p className="text-xs text-teal-600 mt-0.5">{selectedCase.hospital}</p>
                                </div>
                                <div className="bg-white px-3 py-1 rounded text-xs font-bold text-teal-800 shadow-sm">
                                    VERIFIED CASE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Donation Panel */}
                <div className="lg:w-1/3 bg-slate-50 p-6 lg:p-8 border-l border-slate-100 flex flex-col">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold text-slate-800">{selectedCase.amountRaised.toLocaleString()}</span>
                            <span className="text-sm font-medium text-slate-500 mb-1">of {selectedCase.amountNeeded.toLocaleString()} UGX</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-rose-500 rounded-full" 
                                style={{ width: `${Math.min((selectedCase.amountRaised / selectedCase.amountNeeded) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>{selectedCase.donorsCount} Donors</span>
                            <span>Ends {selectedCase.endDate}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Wallet className="text-rose-500" /> Donate Now
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                                <input 
                                    type="number" 
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-lg"
                                />
                            </div>
                            <div className="flex gap-2">
                                {[10000, 50000, 100000].map(amt => (
                                    <button 
                                        key={amt}
                                        onClick={() => setDonationAmount(amt.toString())}
                                        className="flex-1 py-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors"
                                    >
                                        {amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleDonate}
                            disabled={!donationAmount || parseInt(donationAmount) <= 0}
                            className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
                        >
                            <Heart className="fill-current" size={18} /> Complete Donation
                        </button>
                        
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1">
                                    <LinkIcon size={14} /> Public Share Link
                                </h4>
                                <button onClick={handleShare} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                                    <Share2 size={16}/>
                                </button>
                            </div>
                            <p className="text-xs text-indigo-700 mb-3 opacity-90 leading-tight">
                                Guests can donate via this link without an account.
                            </p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={`https://eduwellness.app/case/${selectedCase.id}`} 
                                    className="flex-1 text-[10px] bg-white border border-indigo-200 rounded px-2 py-1.5 text-slate-500 font-mono" 
                                />
                                <button 
                                    onClick={handleShare} 
                                    className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1 ${shareUrlCopied ? 'bg-green-600 text-white' : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'}`}
                                >
                                    {shareUrlCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {shareUrlCopied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                                <Lock size={10} /> Secure transfer to verified medical account
                            </p>
                            <p className="text-[10px] text-slate-400 italic">
                                * Log in to track fund usage and get progress updates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">CareFund</h2>
                    <p className="text-rose-100 max-w-xl text-lg">
                        Community-driven support for those who cannot afford critical medical care. Every shilling goes directly to the treatment.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <Users size={20} className="text-rose-200" />
                            <span className="font-bold">1,240 Donors</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <CheckCircle2 size={20} className="text-rose-200" />
                            <span className="font-bold">Verified by Doctors</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Heart className="text-rose-500 fill-rose-500" /> Urgent Cases
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_CASES.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer" onClick={() => setSelectedCase(c)}>
                        <div className="h-48 relative overflow-hidden">
                            <img src={c.caseImages[0]} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 bg-white/90 text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                {c.hospital}
                            </div>
                            {c.verified && (
                                <div className="absolute top-3 left-3 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Verified
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-slate-800 leading-tight flex-1 mr-2">{c.title}</h4>
                            </div>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.summary}</p>
                            
                            <div className="mt-auto">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>{Math.round((c.amountRaised / c.amountNeeded) * 100)}% Funded</span>
                                    <span>{c.amountNeeded.toLocaleString()} Goal</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min((c.amountRaised / c.amountNeeded) * 100, 100)}%` }}></div>
                                </div>
                                <button className="w-full py-2 bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                    View Details & Donate <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CareFund;
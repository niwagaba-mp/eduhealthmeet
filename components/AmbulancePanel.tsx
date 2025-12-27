
import React, { useState } from 'react';
import { Ambulance, Phone, MapPin, Navigation, Clock, ShieldAlert, X } from 'lucide-react';

interface AmbulancePanelProps {
    userLocation: string;
    onClose: () => void;
}

const PROVIDERS = [
    { id: '1', name: 'City Ambulance', region: 'Kampala', phone: '0800 111 222', eta: '15 mins', tier: 'Advanced Life Support' },
    { id: '2', name: 'St. John Ambulance', region: 'Kampala', phone: '0414 230 671', eta: '20 mins', tier: 'Basic Life Support' },
    { id: '3', name: 'Gulu Regional Referral Ambulance', region: 'Gulu', phone: '0772 000 000', eta: '30 mins', tier: 'Basic Life Support' },
    { id: '4', name: 'Mbarara Emergency', region: 'Mbarara', phone: '0700 112 233', eta: '25 mins', tier: 'Advanced Life Support' }
];

const AmbulancePanel: React.FC<AmbulancePanelProps> = ({ userLocation, onClose }) => {
    const [requestStatus, setRequestStatus] = useState<'idle' | 'locating' | 'contacting' | 'dispatched'>('idle');
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    // Filter providers based on rough location match, fallback to Kampala if not found or empty
    const nearbyProviders = PROVIDERS.filter(p => userLocation.includes(p.region) || p.region === 'Kampala');

    const handleCall = (provider: typeof PROVIDERS[0]) => {
        setSelectedProvider(provider.id);
        setRequestStatus('locating');
        
        // Trigger actual phone call
        window.location.href = `tel:${provider.phone.replace(/\s/g, '')}`;
        
        setTimeout(() => setRequestStatus('contacting'), 1500);
        setTimeout(() => setRequestStatus('dispatched'), 3500);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-red-600 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10"><X size={20}/></button>
                
                {/* Header */}
                <div className="bg-red-600 p-6 text-white text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Ambulance size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-wider">Emergency Response</h2>
                    <p className="text-red-100 text-sm mt-1">Dispatching to: <span className="font-bold">{userLocation}</span></p>
                </div>

                <div className="p-6">
                    {requestStatus === 'idle' && (
                        <>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Navigation size={18} className="text-blue-600"/> Nearby Providers
                            </h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {nearbyProviders.map(provider => (
                                    <div key={provider.id} className="border-2 border-slate-200 rounded-xl p-4 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer group" onClick={() => handleCall(provider)}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{provider.name}</h4>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase">{provider.tier}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-red-600">{provider.eta}</span>
                                                <span className="text-xs text-slate-400">ETA</span>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 bg-red-600 text-white font-bold rounded-lg mt-2 group-hover:bg-red-700 flex items-center justify-center gap-2">
                                            <Phone size={18} /> Call Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {requestStatus !== 'idle' && (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                {requestStatus === 'locating' && <MapPin size={60} className="mx-auto text-blue-500 animate-bounce" />}
                                {requestStatus === 'contacting' && <Phone size={60} className="mx-auto text-yellow-500 animate-pulse" />}
                                {requestStatus === 'dispatched' && <ShieldAlert size={60} className="mx-auto text-green-500" />}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                {requestStatus === 'locating' && 'Pinpointing Location...'}
                                {requestStatus === 'contacting' && 'Connecting to Dispatch...'}
                                {requestStatus === 'dispatched' && 'AMBULANCE EN ROUTE'}
                            </h3>
                            
                            <p className="text-slate-500 mb-8">
                                {requestStatus === 'dispatched' 
                                    ? `Unit from ${PROVIDERS.find(p => p.id === selectedProvider)?.name} is on the way. Keep your line open.`
                                    : 'Please remain calm. Help is being coordinated.'}
                            </p>

                            {requestStatus === 'dispatched' && (
                                <button onClick={onClose} className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300">
                                    Minimize Window
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase">EduWellness Rapid Response Network</p>
                </div>
            </div>
        </div>
    );
};

export default AmbulancePanel;

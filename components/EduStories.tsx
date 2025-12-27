
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FileText, Clock, Mic, Filter, Volume2, Share2, Heart, X, CheckCircle2, Wallet, Lock, Copy, Link as LinkIcon, Upload, Globe, Plus } from 'lucide-react';
import { HealthStory, HealthCategory, StoryType } from '../types';

const MOCK_STORIES: HealthStory[] = [
    { 
        id: '1', 
        title: 'My Battle with Diabetes: Sarah\'s Journey', 
        author: 'Patient Interview', 
        type: 'Patient Interview', 
        category: HealthCategory.METABOLIC, 
        thumbnail: 'bg-rose-100', 
        duration: '12 min',
        language: 'Luganda'
    },
    { 
        id: '2', 
        title: 'Malaria: Early Signs You Ignore', 
        author: 'Dr. Kaggwa (Infectious Disease)', 
        type: 'Expert Webinar', 
        category: HealthCategory.GENERAL, 
        thumbnail: 'bg-yellow-100', 
        duration: '45 min',
        language: 'English'
    },
    { 
        id: '3', 
        title: 'Cervical Cancer Screening Explained', 
        author: 'Oncology Dept - Cynosure', 
        type: 'Article', 
        category: HealthCategory.CANCER_RISK, 
        thumbnail: 'bg-pink-100', 
        duration: '5 min read',
        language: 'English'
    },
    { 
        id: '4', 
        title: 'Protecting Your Liver from Alcohol', 
        author: 'Dr. Mwebaze', 
        type: 'Podcast', 
        category: HealthCategory.LIVER, 
        thumbnail: 'bg-orange-100', 
        duration: '25 min',
        language: 'Swahili'
    },
    { 
        id: '5', 
        title: 'Managing Hypertension in Kampala', 
        author: 'Heart Foundation Uganda', 
        type: 'Expert Webinar', 
        category: HealthCategory.RESPIRATORY, 
        thumbnail: 'bg-blue-100', 
        duration: '30 min',
        language: 'Luganda'
    },
    { 
        id: '6', 
        title: 'Kidney Health: The Silent Threat', 
        author: 'Patient Story: John', 
        type: 'Patient Interview', 
        category: HealthCategory.KIDNEY, 
        thumbnail: 'bg-teal-100', 
        duration: '15 min',
        language: 'Luo'
    },
];

const STORY_TYPES: StoryType[] = ['Patient Interview', 'Expert Webinar', 'Article', 'Podcast'];
const LANGUAGES = ['All', 'English', 'Luganda', 'Swahili', 'Luo', 'Runyankole'];
const MOCK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

const EduStories: React.FC = () => {
    const [stories, setStories] = useState<HealthStory[]>(MOCK_STORIES);
    const [filterType, setFilterType] = useState<string>('All');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
    
    // Audio Player State
    const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Guest Donation State
    const [showDonateModal, setShowDonateModal] = useState<HealthStory | null>(null);
    const [guestAmount, setGuestAmount] = useState('');
    const [shareLinkCopied, setShareLinkCopied] = useState(false);

    // Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryType, setNewStoryType] = useState<StoryType>('Patient Interview');
    const [newStoryCategory, setNewStoryCategory] = useState<string>(HealthCategory.GENERAL);
    const [newStoryLanguage, setNewStoryLanguage] = useState('English');

    const filteredStories = stories.filter(s => {
        const matchesType = filterType === 'All' || s.type === filterType || s.category === filterType;
        const matchesLang = selectedLanguage === 'All' || s.language === selectedLanguage;
        return matchesType && matchesLang;
    });

    const filters = ['All', ...Object.values(HealthCategory), ...STORY_TYPES];

    // Handle Play/Pause
    const togglePlay = (id: string) => {
        if (activeStoryId === id) {
            if (isPlaying) {
                audioRef.current?.pause();
            } else {
                audioRef.current?.play();
            }
            setIsPlaying(!isPlaying);
        } else {
            setActiveStoryId(id);
            setIsPlaying(true);
            setProgress(0);
            // In a real app, you'd set the specific audio source here
            setTimeout(() => audioRef.current?.play(), 100);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 100;
            setProgress((current / duration) * 100);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
            audioRef.current.currentTime = seekTime;
            setProgress(parseFloat(e.target.value));
        }
    };

    // Reset when audio ends
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const onEnded = () => {
                setIsPlaying(false);
                setProgress(0);
            };
            audio.addEventListener('ended', onEnded);
            return () => audio.removeEventListener('ended', onEnded);
        }
    }, [activeStoryId]);

    const handleGuestDonate = () => {
        if (!guestAmount) return;
        alert("Thank you! You will be redirected to the Mobile Money gateway to complete this donation of " + parseInt(guestAmount).toLocaleString() + " UGX.");
        setShowDonateModal(null);
        setGuestAmount('');
    };

    const handleShare = (storyId: string) => {
        const url = `https://eduwellness.app/stories/${storyId}`;
        navigator.clipboard.writeText(url);
        setShareLinkCopied(true);
        setTimeout(() => setShareLinkCopied(false), 2000);
        if(!showDonateModal) alert("Link copied to clipboard! Share it with friends to support this story.");
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newStoryTitle) return;

        const newStory: HealthStory = {
            id: Date.now().toString(),
            title: newStoryTitle,
            author: 'You (Community Member)',
            type: newStoryType,
            category: newStoryCategory,
            thumbnail: 'bg-indigo-100',
            duration: 'New',
            language: newStoryLanguage as any
        };

        setStories([newStory, ...stories]);
        setShowUploadModal(false);
        // Reset form
        setNewStoryTitle('');
        setNewStoryType('Patient Interview');
        setNewStoryCategory(HealthCategory.GENERAL);
        setNewStoryLanguage('English');
        alert("Your story has been uploaded and is pending moderation approval!");
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20 relative">
            <audio 
                ref={audioRef} 
                src={MOCK_AUDIO_URL} 
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 bg-teal-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-teal-900">Share Your Story</h3>
                                <p className="text-xs text-teal-700">Inspire the community with your journey.</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-teal-100 rounded-full text-teal-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Story Title</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newStoryTitle} 
                                    onChange={(e) => setNewStoryTitle(e.target.value)} 
                                    placeholder="e.g. How I managed my diet..." 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                    <select 
                                        value={newStoryType} 
                                        onChange={(e) => setNewStoryType(e.target.value as StoryType)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    >
                                        {STORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language</label>
                                    <select 
                                        value={newStoryLanguage} 
                                        onChange={(e) => setNewStoryLanguage(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    >
                                        {LANGUAGES.filter(l => l !== 'All').map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Health Category</label>
                                <select 
                                    value={newStoryCategory} 
                                    onChange={(e) => setNewStoryCategory(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    {Object.values(HealthCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                                <Upload size={24} className="mb-2" />
                                <span className="text-xs font-bold">Upload Audio, Video or Text (PDF)</span>
                                <span className="text-[10px]">Max 50MB</span>
                            </div>

                            <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition-colors">
                                Submit for Review
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Guest Donation Modal */}
            {showDonateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-6 bg-gradient-to-r from-rose-500 to-orange-500 text-white relative">
                             <button onClick={() => setShowDonateModal(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-1 bg-white/10 rounded-full"><X size={20}/></button>
                             <h3 className="text-xl font-bold flex items-center gap-2"><Heart className="fill-current" /> Support this Story</h3>
                             <p className="text-sm text-rose-100 mt-1">Donations go directly to the patient's CareFund.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-slate-600 font-medium">You are donating to: <strong className="text-slate-800">{showDonateModal.title}</strong></p>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Enter Amount (UGX)</label>
                                <input 
                                    type="number" 
                                    value={guestAmount} 
                                    onChange={(e) => setGuestAmount(e.target.value)} 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-rose-500 outline-none" 
                                    placeholder="e.g. 10,000"
                                />
                                <div className="flex gap-2 mt-2">
                                    {[5000, 20000, 50000].map(amt => (
                                        <button key={amt} onClick={() => setGuestAmount(amt.toString())} className="flex-1 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded border border-slate-200 transition-colors">
                                            {amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleGuestDonate} 
                                disabled={!guestAmount}
                                className={`w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${!guestAmount ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                            >
                                <Wallet size={18} /> Pay with Mobile Money
                            </button>

                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-indigo-800">Share Public Link</span>
                                    <button onClick={() => handleShare(showDonateModal.id)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-bold">
                                        {shareLinkCopied ? <CheckCircle2 size={12} /> : <Share2 size={12} />}
                                        {shareLinkCopied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-indigo-200 text-xs text-slate-500 font-mono truncate">
                                    <LinkIcon size={10} /> https://eduwellness.app/stories/{showDonateModal.id}
                                </div>
                                <p className="text-[10px] text-indigo-600 mt-2 text-center">Unregistered users can view and donate via this link.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">EduWellness Library</h2>
                    <p className="text-teal-100 max-w-lg text-lg">
                        Real stories. Expert Advice. Prevention. <br/>
                        <span className="text-sm opacity-80">Listen, read, and learn from the community.</span>
                    </p>
                </div>
                <div className="relative z-10">
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-white text-teal-700 rounded-xl font-bold shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Share Your Story
                    </button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <div className="flex items-center text-slate-400 mr-2 flex-shrink-0">
                        <Filter size={18} />
                    </div>
                    {filters.map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                filterType === f 
                                ? 'bg-teal-600 text-white shadow-md' 
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <div className="px-2 text-slate-400"><Globe size={16} /></div>
                    <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-700 outline-none p-1 cursor-pointer"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No stories found for these filters.</p>
                    </div>
                ) : filteredStories.map((story) => {
                    const isAudioType = story.type === 'Podcast' || story.type === 'Patient Interview';
                    const isActive = activeStoryId === story.id;
                    const canDonate = ['Patient Interview', 'Podcast'].includes(story.type);
                    
                    return (
                    <div key={story.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all group ${isActive ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-100'}`}>
                        <div className={`h-48 w-full ${story.thumbnail} flex items-center justify-center relative`}>
                            {isAudioType ? (
                                <button 
                                    onClick={() => togglePlay(story.id)}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isActive && isPlaying ? 'bg-teal-600 text-white' : 'bg-white/90 text-teal-600'}`}
                                >
                                    {isActive && isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="ml-1 fill-current" />}
                                </button>
                            ) : (
                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <FileText size={24} className="text-slate-400" />
                                </div>
                            )}
                            
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-medium">
                                <Clock size={10} /> {story.duration}
                            </div>
                            <div className="absolute top-3 left-3 bg-white/90 text-slate-800 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <Globe size={10} className="text-slate-500"/> {story.language}
                            </div>
                            
                            {/* Visualizer for Active Audio */}
                            {isActive && isPlaying && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-200">
                                    <div className="h-full bg-teal-600 animate-pulse" style={{width: `${progress}%`}}></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide bg-teal-50 px-2 py-1 rounded-md truncate max-w-[70%]">
                                    {story.category}
                                </span>
                                {canDonate && (
                                    <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-1 rounded font-bold flex items-center gap-1">
                                        <Heart size={10} className="fill-current" /> Fundraiser
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                {story.title}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {story.author}
                            </p>

                            {/* Embedded Player Controls */}
                            {isActive && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in">
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                                        <span>{isPlaying ? 'Playing' : 'Paused'}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={progress}
                                        onChange={handleSeek}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                    />
                                    <div className="mt-2 flex justify-center">
                                         <span className="text-[10px] text-teal-600 font-bold uppercase flex items-center gap-1">
                                             <Volume2 size={12} /> Audio Content Active
                                         </span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                                <button 
                                    onClick={() => isAudioType ? togglePlay(story.id) : alert('Opening Article...')}
                                    className="flex-1 py-2 text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                >
                                    {isActive && isPlaying ? 'Pause' : isAudioType ? 'Listen Now' : 'Read Article'}
                                </button>
                                
                                {canDonate && (
                                    <>
                                        <button 
                                            onClick={() => setShowDonateModal(story)}
                                            className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-700 transition-colors flex items-center gap-1"
                                            title="Donate to this Patient"
                                        >
                                            <Heart size={14} className="fill-current" /> Donate
                                        </button>
                                        <button 
                                            onClick={() => handleShare(story.id)}
                                            className="px-2 py-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                            title="Share Link"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
};

export default EduStories;

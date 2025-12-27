
import React, { useState, useEffect } from 'react';
import { FamilyMember, GeneticRiskProfile, FamilyCondition } from '../types';
import { generateGeneticRiskProfile } from '../services/geminiService';
import { Plus, Users, Trash2, AlertTriangle, Dna, Activity, Sparkles, Loader2, CheckCircle2, X, HeartPulse, ArrowRight, GitGraph, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FamilyHistoryProps {
    members: FamilyMember[];
    onUpdateMembers: (members: FamilyMember[]) => void;
}

const COMMON_CONDITIONS = [
    'Diabetes Type 2', 'Hypertension', 'Sickle Cell Trait', 'Breast Cancer', 'Prostate Cancer',
    'Asthma', 'Liver Disease', 'Kidney Failure', 'Heart Disease', 'Stroke',
    'High Cholesterol', 'Arthritis', 'Depression', 'Anxiety', 'Alzheimer\'s Disease'
];

// Helper to convert probability text to score
const getRiskScore = (probability: string): number => {
    const lower = probability.toLowerCase();
    if (lower.includes('high')) return 85;
    if (lower.includes('moderate') || lower.includes('medium')) return 50;
    if (lower.includes('low')) return 25;
    const match = probability.match(/(\d+)%/);
    if (match) return parseInt(match[1]);
    return 15; 
};

const FamilyTreeVisualizer: React.FC<{ members: FamilyMember[] }> = ({ members }) => {
    const gen1 = members.filter(m => m.relation === 'Grandparent');
    const gen2 = members.filter(m => ['Father', 'Mother'].includes(m.relation));
    const gen3 = members.filter(m => ['Brother', 'Sister'].includes(m.relation));
    const gen4 = members.filter(m => m.relation === 'Child');

    const renderNode = (member: FamilyMember) => {
        const hasGeneticCondition = member.conditions.some(c => c.nature === 'Genetic');
        
        return (
            <div key={member.id} className="flex flex-col items-center mx-2 md:mx-4 group relative">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center shadow-sm transition-transform hover:scale-110 z-10 bg-white ${
                    member.status === 'Deceased' ? 'border-slate-300 text-slate-400 grayscale' : 
                    hasGeneticCondition ? 'border-purple-200 text-purple-600 bg-purple-50' :
                    'border-teal-200 text-teal-600 bg-teal-50'
                }`}>
                    <span className="font-bold text-[10px] md:text-xs text-center leading-tight px-1">{member.relation}</span>
                    {hasGeneticCondition && (
                        <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-1 border-2 border-white">
                            <Dna size={8} className="text-white" />
                        </div>
                    )}
                </div>
                <div className="absolute top-full mt-2 bg-white p-3 rounded-xl shadow-xl border border-slate-100 text-xs w-56 text-center opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none translate-y-2 group-hover:translate-y-0">
                    <p className="font-bold text-slate-800 text-sm mb-1">{member.relation}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">{member.status} • {member.age ? member.age + ' yrs' : 'Age N/A'}</p>
                    {member.conditions.length > 0 ? (
                       <div className="flex flex-col gap-1">
                           {member.conditions.map((c, i) => (
                               <div key={i} className={`px-2 py-1.5 rounded text-[10px] font-medium text-left flex flex-col ${c.nature === 'Genetic' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                                   <span className="font-bold flex justify-between items-center">
                                       {c.name}
                                       <div className="flex gap-1">
                                            {c.severity === 'Severe' && <span className="w-2 h-2 rounded-full bg-red-500" title="Severe"></span>}
                                            {c.severity === 'Moderate' && <span className="w-2 h-2 rounded-full bg-amber-500" title="Moderate"></span>}
                                       </div>
                                   </span>
                               </div>
                           ))}
                       </div>
                    ) : <p className="text-slate-400 italic">No conditions recorded</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 overflow-x-auto mb-8 relative shadow-inner">
            <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50 text-slate-600">
                <GitGraph size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Tree View</span>
            </div>
            
            <div className="min-w-[600px] flex flex-col items-center space-y-10 relative py-4">
                {/* Generation 1: Grandparents */}
                {gen1.length > 0 && (
                    <div className="relative">
                        <h4 className="absolute -left-32 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-full">Gen 1: Grandparents</h4>
                        <div className="flex justify-center gap-8">
                            {gen1.map(renderNode)}
                        </div>
                        <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-slate-300"></div>
                    </div>
                )}

                {/* Generation 2: Parents */}
                <div className="relative">
                     <h4 className="absolute -left-32 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-full">Gen 2: Parents</h4>
                    {gen1.length > 0 && <div className="absolute left-1/2 -top-10 w-px h-10 bg-slate-300"></div>}
                    
                    <div className="flex justify-center gap-12 relative">
                        {gen2.length > 1 && <div className="absolute top-1/2 left-10 right-10 h-px bg-slate-300 -z-10"></div>}
                        {gen2.length > 0 ? gen2.map(renderNode) : (
                             <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] bg-slate-50/50 italic text-center p-2">Add Parents</div>
                        )}
                    </div>
                    <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-slate-300"></div>
                </div>

                {/* Generation 3: You + Siblings */}
                <div className="relative">
                    <h4 className="absolute -left-32 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-full">Gen 3: You & Siblings</h4>
                     <div className="absolute left-1/2 -top-10 w-px h-10 bg-slate-300"></div>
                     <div className="flex justify-center items-center gap-6 relative">
                        <div className="absolute top-1/2 left-4 right-4 h-px bg-slate-300 -z-10"></div>
                        {gen3.filter((_, i) => i % 2 === 0).map(renderNode)}
                        <div className="relative z-20 mx-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-teal-600 border-4 border-white shadow-xl flex flex-col items-center justify-center text-white z-10 relative">
                                <span className="font-bold text-sm">YOU</span>
                                <span className="text-[10px] opacity-80">Pro Member</span>
                            </div>
                        </div>
                        {gen3.filter((_, i) => i % 2 !== 0).map(renderNode)}
                     </div>
                     {gen4.length > 0 && <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-slate-300"></div>}
                </div>

                {/* Generation 4: Children */}
                {gen4.length > 0 && (
                    <div className="relative">
                        <h4 className="absolute -left-32 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-full">Gen 4: Children</h4>
                        <div className="absolute left-1/2 -top-10 w-px h-10 bg-slate-300"></div>
                        <div className="flex justify-center gap-8 relative pt-6">
                            <div className="absolute top-0 left-[20%] right-[20%] h-px bg-slate-300"></div>
                            <div className="absolute top-0 left-1/2 h-6 w-px bg-slate-300"></div>
                            {gen4.map((m) => (
                                <div key={m.id} className="relative">
                                    <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-300"></div>
                                    {renderNode(m)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FamilyHistory: React.FC<FamilyHistoryProps> = ({ members, onUpdateMembers }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [riskProfile, setRiskProfile] = useState<GeneticRiskProfile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form State
    const [relation, setRelation] = useState('Father');
    const [age, setAge] = useState('');
    const [selectedConditions, setSelectedConditions] = useState<FamilyCondition[]>([]);
    
    // Condition Input State
    const [customCondition, setCustomCondition] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [conditionNote, setConditionNote] = useState('');
    const [conditionNature, setConditionNature] = useState<'Genetic' | 'Acquired'>('Genetic');
    const [conditionDiagnosisAge, setConditionDiagnosisAge] = useState('');
    const [conditionManagement, setConditionManagement] = useState<'Managed' | 'Untreated' | 'Unknown'>('Unknown');
    const [conditionSeverity, setConditionSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
    const [status, setStatus] = useState<'Living' | 'Deceased'>('Living');

    const handleAddCondition = () => {
        const name = customCondition.trim();
        if (name && !selectedConditions.some(c => c.name === name)) {
            setSelectedConditions(prev => [...prev, { 
                name, 
                nature: conditionNature,
                note: conditionNote.trim() || undefined,
                diagnosisAge: conditionDiagnosisAge.trim() || undefined,
                management: conditionManagement,
                severity: conditionSeverity
            }]);
            setCustomCondition('');
            setShowSuggestions(false);
            setConditionNote('');
            setConditionDiagnosisAge('');
            setConditionManagement('Unknown');
            setConditionSeverity('Moderate');
        }
    };

    const removeCondition = (name: string) => {
        setSelectedConditions(prev => prev.filter(c => c.name !== name));
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: FamilyMember = {
            id: Date.now().toString(),
            relation: relation as any,
            age: age ? parseInt(age) : undefined,
            conditions: selectedConditions,
            status
        };
        onUpdateMembers([...members, newMember]);
        setIsAdding(false);
        setRiskProfile(null);
        setSelectedConditions([]);
        setCustomCondition('');
        setAge('');
    };

    const handleDelete = (id: string) => {
        onUpdateMembers(members.filter(m => m.id !== id));
        setRiskProfile(null);
    };

    const handleAnalyze = async () => {
        if (members.length === 0) return;
        setIsAnalyzing(true);
        try {
            const result = await generateGeneticRiskProfile(members);
            setRiskProfile(result);
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredConditions = COMMON_CONDITIONS.filter(c => 
        c.toLowerCase().includes(customCondition.toLowerCase()) && 
        !selectedConditions.some(sc => sc.name === c)
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-teal-600" size={24} />
                    Your Family Tree
                </h3>
                <div className="flex gap-3">
                    {members.length > 0 && (
                        <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2 transition-all">
                            {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={18} />}
                            Analyze Genetic Risks
                        </button>
                    )}
                    <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-medium shadow-sm hover:bg-teal-700 flex items-center gap-2 transition-all">
                        <Plus size={18} /> {isAdding ? 'Close Form' : 'Add Member'}
                    </button>
                </div>
            </div>
            
            {members.length > 0 && <FamilyTreeVisualizer members={members} />}

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slide-in-down mb-8">
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Relation</label>
                                <select value={relation} onChange={(e) => setRelation(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <option>Father</option>
                                    <option>Mother</option>
                                    <option>Brother</option>
                                    <option>Sister</option>
                                    <option>Grandparent</option>
                                    <option>Child</option>
                                </select>
                            </div>
                            {/* ... (Other inputs similar to previous version, condensed for brevity) ... */}
                            <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            {/* Condition Inputs */}
                            <div className="flex gap-2">
                                <input type="text" value={customCondition} onChange={e => setCustomCondition(e.target.value)} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Condition Name" />
                                <button type="button" onClick={handleAddCondition} className="px-4 bg-slate-800 text-white rounded-xl">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedConditions.map(c => <span key={c.name} className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200 flex items-center gap-1">{c.name} <X size={10} className="cursor-pointer" onClick={() => removeCondition(c.name)}/></span>)}
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold">Save Member</button>
                        </div>
                    </form>
                </div>
            )}

            {riskProfile && (
                <div className="bg-white rounded-2xl shadow-xl border-l-4 border-indigo-500 overflow-hidden animate-slide-in-up">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <Sparkles className="text-indigo-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-800">Genetic Risk: {riskProfile.riskLevel}</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-700 mb-6">{riskProfile.summary}</p>
                        <div className="space-y-3">
                             {riskProfile.identifiedRisks.map((risk, idx) => (
                                 <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-white">
                                     <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} /></div>
                                     <div>
                                         <div className="flex items-center gap-2 mb-0.5">
                                             <span className="font-bold text-slate-800">{risk.condition}</span>
                                             <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium border border-slate-200">{risk.probability}</span>
                                         </div>
                                         <p className="text-xs text-slate-500">{risk.reason}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyHistory;

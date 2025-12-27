
import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Search, Filter, Star, Plus, Check, ShieldCheck, Tag } from 'lucide-react';

interface MarketplaceProps {
    products?: Product[];
    onPurchase: (amount: number, item: string) => void;
}

const MOCK_PRODUCTS: Product[] = [
    { 
        id: '1', name: 'Digital Blood Pressure Monitor', category: 'Devices', price: 85000, originalPrice: 120000, 
        vendor: 'Cynosure Equipment', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300', 
        prescriptionRequired: false, rating: 4.8, description: 'Clinically validated, easy to use home BP monitor with large display.'
    },
    { 
        id: '2', name: 'Glucometer Kit + 50 Strips', category: 'Devices', price: 45000, 
        vendor: 'Kampala Pharma', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=300', 
        prescriptionRequired: false, rating: 4.6, description: 'Complete diabetes monitoring kit for daily use.'
    },
    { 
        id: '3', name: 'Multivitamin Complex (30 Days)', category: 'Supplements', price: 25000, originalPrice: 35000, 
        vendor: 'HealthFirst Pharmacy', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300', 
        prescriptionRequired: false, rating: 4.5, description: 'Daily immune support with Zinc and Vitamin C.'
    },
    { 
        id: '4', name: 'Amoxicillin 500mg (Course)', category: 'Pharmacy', price: 12000, 
        vendor: 'City Chemist', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=300', 
        prescriptionRequired: true, rating: 4.9, description: 'Antibiotic treatment. Prescription upload required.'
    },
    { 
        id: '5', name: 'Compression Socks (Pair)', category: 'Equipment', price: 30000, 
        vendor: 'Physio Supplies', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300', 
        prescriptionRequired: false, rating: 4.2, description: 'Improves circulation and reduces leg swelling.'
    },
];

const Marketplace: React.FC<MarketplaceProps> = ({ onPurchase, products }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [cart, setCart] = useState<string[]>([]);

    const displayProducts = products || MOCK_PRODUCTS;

    const filteredProducts = displayProducts.filter(p => 
        (activeCategory === 'All' || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBuy = (product: Product) => {
        if (product.prescriptionRequired) {
            alert("This item requires a valid doctor's prescription. Please upload via Dr. Wise AI first.");
            return;
        }
        if (confirm(`Purchase ${product.name} for ${product.price.toLocaleString()} UGX?`)) {
            onPurchase(product.price, product.name);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Health Marketplace</h2>
                    <p className="text-emerald-50 max-w-xl text-lg">
                        Verified pharmacy products, medical devices, and wellness supplements delivered to your doorstep.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                            <ShieldCheck size={20} className="text-emerald-300" />
                            <span className="font-medium text-sm">Verified Vendors</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                            <Tag size={20} className="text-emerald-300" />
                            <span className="font-medium text-sm">Member Discounts</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <ShoppingCart size={200} />
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 bg-slate-50/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200 z-20 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search medicines, devices..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    {['All', 'Pharmacy', 'Devices', 'Supplements', 'Equipment'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                activeCategory === cat 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-full">
                        <div className="h-48 relative overflow-hidden bg-slate-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {product.originalPrice && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </div>
                            )}
                            {product.prescriptionRequired && (
                                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                    <ShieldCheck size={10} /> Rx Required
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.category}</span>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <Star size={12} className="fill-current" /> {product.rating}
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 leading-tight mb-1">{product.name}</h3>
                            <p className="text-xs text-slate-500 mb-3">{product.vendor}</p>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">{product.description}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-emerald-600">{product.price.toLocaleString()} <span className="text-xs font-normal">UGX</span></p>
                                    {product.originalPrice && (
                                        <p className="text-xs text-slate-400 line-through">{product.originalPrice.toLocaleString()} UGX</p>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleBuy(product)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
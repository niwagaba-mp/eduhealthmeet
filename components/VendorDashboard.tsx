import React, { useState } from 'react';
import { User, Product } from '../types';
import { Package, Plus, Trash2, ShoppingBag, BarChart3, Settings, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';

interface VendorDashboardProps {
    user: User;
    products: Product[];
    onAddProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, products, onAddProduct, onDeleteProduct }) => {
    const [view, setView] = useState<'inventory' | 'orders' | 'analytics'>('inventory');
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newCategory, setNewCategory] = useState<'Pharmacy' | 'Equipment' | 'Supplements' | 'Devices'>('Pharmacy');
    const [newStock, setNewStock] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newImage, setNewImage] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: Date.now().toString(),
            name: newName,
            price: parseInt(newPrice),
            category: newCategory,
            vendor: user.name,
            image: newImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300',
            prescriptionRequired: false,
            rating: 5.0,
            description: newDesc,
            stock: parseInt(newStock) || 0
        };
        onAddProduct(product);
        setIsAdding(false);
        // Reset
        setNewName('');
        setNewPrice('');
        setNewStock('');
        setNewDesc('');
        setNewImage('');
    };

    const myProducts = products;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
                        <ShoppingBag size={32} className="text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/30">Verified Vendor</span>
                            <span className="text-slate-400 text-xs flex items-center gap-1"><Settings size={10} /> Settings</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 text-right">
                    <div>
                        <div className="text-2xl font-bold text-teal-400">{myProducts.length}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Listings</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Orders</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
                <button onClick={() => setView('inventory')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${view === 'inventory' ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Inventory Management</button>
                <button onClick={() => setView('orders')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${view === 'orders' ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Orders</button>
                <button onClick={() => setView('analytics')} className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-b-2 ${view === 'analytics' ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sales Analytics</button>
            </div>

            {/* Inventory View */}
            {view === 'inventory' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div>
                            <h3 className="font-bold text-slate-800">Product Catalog</h3>
                            <p className="text-xs text-slate-500">Manage your pharmacy or equipment listings</p>
                        </div>
                        <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-lg">
                            <Plus size={16} /> Add Product
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slide-in-down relative">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag size={18} /> New Product Details</h4>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Product Name</label>
                                        <input required placeholder="e.g. Vitamin C 1000mg" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                                        <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500">
                                            <option>Pharmacy</option>
                                            <option>Devices</option>
                                            <option>Supplements</option>
                                            <option>Equipment</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price (UGX)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">UGX</span>
                                            <input required type="number" placeholder="5000" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Stock Quantity</label>
                                        <input required type="number" placeholder="100" value={newStock} onChange={e => setNewStock(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Image URL</label>
                                        <input placeholder="https://..." value={newImage} onChange={e => setNewImage(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                                    <textarea placeholder="Product details..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none" />
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors">Save Product</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myProducts.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 group hover:shadow-md transition-all relative">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{p.name}</h4>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide font-bold">{p.category}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="font-bold text-teal-600 text-lg">{p.price.toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400 ml-1">UGX</span>
                                        </div>
                                        <div className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-bold">
                                            Qty: {p.stock || 0}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onDeleteProduct(p.id)} 
                                    className="absolute top-2 right-2 p-2 bg-white/90 text-slate-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="Delete Product"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <div className="p-6 bg-slate-50 rounded-full mb-4">
                        <Package size={48} className="text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-600 text-lg">No Active Orders</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">New orders from patients will appear here for processing and dispatch.</p>
                </div>
            )}

            {view === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                         <div className="p-3 bg-emerald-50 w-fit rounded-xl mb-3"><DollarSign className="text-emerald-600" /></div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Total Sales</h4>
                         <p className="text-3xl font-bold text-slate-800">0 <span className="text-xs text-slate-400">UGX</span></p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                         <div className="p-3 bg-blue-50 w-fit rounded-xl mb-3"><Package className="text-blue-600" /></div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Products Sold</h4>
                         <p className="text-3xl font-bold text-blue-600">0</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                         <div className="p-3 bg-purple-50 w-fit rounded-xl mb-3"><BarChart3 className="text-purple-600" /></div>
                         <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Store Views</h4>
                         <p className="text-3xl font-bold text-purple-600">24</p>
                     </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;

import React, { useState } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { Plus, Edit2, Phone, Mail, Building2, FileText } from 'lucide-react';
import type { Supplier } from '../../types';

export const SuppliersPage: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier } = useFinancial();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [tradeName, setTradeName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [document, setDocument] = useState('');
    const [category, setCategory] = useState<Supplier['category']>('GENERAL');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateSupplier(editingId, {
                    tradeName, legalName, document, category, phone, email, address
                });
            } else {
                await addSupplier({
                    tradeName, legalName, document, category, phone, email, address
                });
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar fornecedor');
        }
    };

    const handleEdit = (s: Supplier) => {
        setEditingId(s.id);
        setTradeName(s.tradeName);
        setLegalName(s.legalName || '');
        setDocument(s.document || '');
        setCategory(s.category);
        setPhone(s.phone || '');
        setEmail(s.email || '');
        setAddress(s.address || '');
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setTradeName(''); setLegalName(''); setDocument(''); setCategory('GENERAL');
        setPhone(''); setEmail(''); setAddress('');
    };

    const categoryLabels: Record<string, string> = {
        'FUEL': 'Combustível ⛽',
        'MAINTENANCE': 'Manutenção 🔧',
        'PARTS': 'Peças ⚙️',
        'SERVICE': 'Serviços 🛠️',
        'INSURANCE': 'Seguros 🛡️',
        'GENERAL': 'Geral 🏢'
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Fornecedores</h2>
                    <p className="text-gray-400 text-lg">Cadastro de parceiros e prestadores</p>
                </div>
                <button
                    onClick={() => isAdding ? handleCancel() : setIsAdding(true)}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                >
                    <Plus size={20} />
                    {isAdding ? 'Cancelar' : 'Novo Fornecedor'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl mb-12 border border-slate-700/50 shadow-2xl animate-fade-in max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nome Fantasia *</label>
                                <input required value={tradeName} onChange={e => setTradeName(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Razão Social</label>
                                <input value={legalName} onChange={e => setLegalName(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">CNPJ / CPF</label>
                                <input value={document} onChange={e => setDocument(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Categoria *</label>
                                <select value={category} onChange={e => setCategory(e.target.value as any)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                    {Object.entries(categoryLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Telefone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Endereço</label>
                            <input value={address} onChange={e => setAddress(e.target.value)}
                                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                            {editingId ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(supplier)} className="text-slate-600 hover:text-industrial-accent"><Edit2 size={18} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-700/50 rounded-full text-industrial-accent">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-white">{supplier.tradeName}</h4>
                                <span className="inline-block px-2 py-1 bg-slate-700 rounded text-xs font-bold text-gray-300 mt-1">
                                    {categoryLabels[supplier.category]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-400">
                            {supplier.document && <p className="flex items-center gap-2"><FileText size={14} /> {supplier.document}</p>}
                            {supplier.phone && <p className="flex items-center gap-2"><Phone size={14} /> {supplier.phone}</p>}
                            {supplier.email && <p className="flex items-center gap-2"><Mail size={14} /> {supplier.email}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

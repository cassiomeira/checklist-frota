import React, { useState } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { Users, Plus, Trash2, Edit2, Phone, Mail, FileText } from 'lucide-react';
import type { Customer } from '../../types';

export const CustomersPage: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useFinancial();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [tradeName, setTradeName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [document, setDocument] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCustomer(editingId, {
                    tradeName, legalName, document, phone, email, address
                });
            } else {
                await addCustomer({
                    tradeName, legalName, document, phone, email, address
                });
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar cliente');
        }
    };

    const handleEdit = (c: Customer) => {
        setEditingId(c.id);
        setTradeName(c.tradeName);
        setLegalName(c.legalName || '');
        setDocument(c.document || '');
        setPhone(c.phone || '');
        setEmail(c.email || '');
        setAddress(c.address || '');
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setTradeName(''); setLegalName(''); setDocument('');
        setPhone(''); setEmail(''); setAddress('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await deleteCustomer(id);
            } catch (error) {
                console.error(error);
                alert('Erro ao excluir cliente');
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Clientes</h2>
                    <p className="text-gray-400 text-lg">Cadastro de tomadores de serviço</p>
                </div>
                <button
                    onClick={() => isAdding ? handleCancel() : setIsAdding(true)}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                >
                    <Plus size={20} />
                    {isAdding ? 'Cancelar' : 'Novo Cliente'}
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
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Telefone</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Endereço</label>
                            <input value={address} onChange={e => setAddress(e.target.value)}
                                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                            {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map(customer => (
                    <div key={customer.id} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(customer)} className="text-slate-600 hover:text-industrial-accent"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(customer.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-700/50 rounded-full text-industrial-accent">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-white">{customer.tradeName}</h4>
                                <span className="inline-block px-2 py-1 bg-slate-700 rounded text-xs font-bold text-gray-300 mt-1">
                                    Cliente
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-400">
                            {customer.document && <p className="flex items-center gap-2"><FileText size={14} /> {customer.document}</p>}
                            {customer.phone && <p className="flex items-center gap-2"><Phone size={14} /> {customer.phone}</p>}
                            {customer.email && <p className="flex items-center gap-2"><Mail size={14} /> {customer.email}</p>}
                        </div>
                    </div>
                ))}

                {customers.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
                    </div>
                )}
            </div>
        </div>
    );
};

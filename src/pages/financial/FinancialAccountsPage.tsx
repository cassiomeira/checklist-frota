import React, { useState } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { Wallet, Plus, Edit2, Building, CreditCard, Banknote } from 'lucide-react';
import type { FinancialAccount } from '../../types';

export const FinancialAccountsPage: React.FC = () => {
    const { accounts, transactions, addAccount, updateAccount } = useFinancial();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [type, setType] = useState<FinancialAccount['type']>('BANK');
    const [initialBalance, setInitialBalance] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [agency, setAgency] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const balanceValue = parseFloat(initialBalance.replace(',', '.')) || 0;

            if (editingId) {
                await updateAccount(editingId, {
                    name, type, initialBalance: balanceValue, bankName, accountNumber, agency
                });
            } else {
                await addAccount({
                    name, type, initialBalance: balanceValue, bankName, accountNumber, agency
                });
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar conta');
        }
    };

    const handleEdit = (acc: FinancialAccount) => {
        setEditingId(acc.id);
        setName(acc.name);
        setType(acc.type);
        setInitialBalance(acc.initialBalance.toString());
        setBankName(acc.bankName || '');
        setAccountNumber(acc.accountNumber || '');
        setAgency(acc.agency || '');
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setName(''); setType('BANK'); setInitialBalance('');
        setBankName(''); setAccountNumber(''); setAgency('');
    };

    const typeConfig: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
        'BANK': { label: 'Conta Bancária', icon: <Building size={20} />, color: 'bg-blue-500/20 text-blue-400' },
        'CASH': { label: 'Caixa Físico', icon: <Banknote size={20} />, color: 'bg-emerald-500/20 text-emerald-400' },
        'WALLET': { label: 'Carteira Digital', icon: <Wallet size={20} />, color: 'bg-purple-500/20 text-purple-400' },
        'CREDIT_CARD': { label: 'Cartão de Crédito', icon: <CreditCard size={20} />, color: 'bg-orange-500/20 text-orange-400' }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Carteiras & Bancos</h2>
                    <p className="text-gray-400 text-lg">Gerencie onde o dinheiro está guardado</p>
                </div>
                <button
                    onClick={() => isAdding ? handleCancel() : setIsAdding(true)}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                >
                    <Plus size={20} />
                    {isAdding ? 'Cancelar' : 'Nova Conta'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl mb-12 border border-slate-700/50 shadow-2xl animate-fade-in max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nome da Conta *</label>
                                <input required value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Banco Itaú Principal"
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Tipo *</label>
                                <select value={type} onChange={e => setType(e.target.value as any)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                    {Object.entries(typeConfig).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Saldo Inicial (R$)</label>
                                <input type="number" step="0.01" value={initialBalance} onChange={e => setInitialBalance(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                            </div>
                        </div>

                        {type === 'BANK' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nome do Banco</label>
                                    <input value={bankName} onChange={e => setBankName(e.target.value)}
                                        placeholder="Ex: Itaú"
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Agência</label>
                                    <input value={agency} onChange={e => setAgency(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Conta</label>
                                    <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                            {editingId ? 'Atualizar Conta' : 'Salvar Conta'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(acc)} className="text-slate-600 hover:text-industrial-accent"><Edit2 size={18} /></button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-xl ${typeConfig[acc.type].color}`}>
                                {typeConfig[acc.type].icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-white">{acc.name}</h4>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {typeConfig[acc.type].label}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Saldo Atual</p>
                                <p className={`text-2xl font-mono font-bold ${(() => {
                                    const balance = acc.initialBalance + transactions
                                        .filter(t => t.accountId === acc.id && t.status === 'PAID')
                                        .reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0);
                                    return balance >= 0 ? 'text-emerald-400' : 'text-red-400';
                                })()}`}>
                                    R$ {(() => {
                                        const balance = acc.initialBalance + transactions
                                            .filter(t => t.accountId === acc.id && t.status === 'PAID')
                                            .reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0);
                                        return balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                    })()}
                                </p>
                            </div>

                            {acc.type === 'BANK' && (
                                <div className="pt-4 border-t border-slate-700/50 flex gap-4 text-sm text-gray-400 font-mono">
                                    <span>AG: {acc.agency || '---'}</span>
                                    <span>CC: {acc.accountNumber || '---'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

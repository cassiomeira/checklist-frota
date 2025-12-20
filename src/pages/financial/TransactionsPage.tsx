import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { Plus, Filter, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Transaction } from '../../types';

export const TransactionsPage: React.FC = () => {
    const { transactions, accounts, suppliers, customers, addTransaction, updateTransaction, deleteTransaction } = useFinancial();

    // Filters
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [statusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

    // Form / Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // Form Fields
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [status, setStatus] = useState<'PENDING' | 'PAID'>('PENDING');
    const [dueDate, setDueDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [accountId, setAccountId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [customerId, setCustomerId] = useState('');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (!t.dueDate.startsWith(monthFilter)) return false;
            if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
            if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
            return true;
        });
    }, [transactions, monthFilter, typeFilter, statusFilter]);

    const totals = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            if (t.status === 'CANCELLED') return acc;
            if (t.type === 'INCOME') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredTransactions]);

    const handleOpenModal = (tx?: Transaction) => {
        if (tx) {
            setEditingTx(tx);
            setDescription(tx.description);
            setAmount(tx.amount.toString());
            setType(tx.type);
            setStatus(tx.status as any);
            setDueDate(tx.dueDate);
            setPaymentDate(tx.paymentDate || '');
            setCategory(tx.category);
            setAccountId(tx.accountId || '');
            setSupplierId(tx.supplierId || '');
            setCustomerId(tx.customerId || '');
        } else {
            setEditingTx(null);
            setDescription('');
            setAmount('');
            setType('EXPENSE');
            setStatus('PENDING');
            setDueDate(new Date().toISOString().split('T')[0]);
            setPaymentDate('');
            setCategory('GENERAL');
            setAccountId('');
            setSupplierId('');
            setCustomerId('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const valAmount = parseFloat(amount.replace(',', '.'));

            const payload = {
                description,
                amount: valAmount,
                type,
                status,
                dueDate,
                paymentDate: paymentDate ? paymentDate : (status === 'PAID' ? dueDate : undefined),
                category,
                accountId: accountId || undefined,
                supplierId: supplierId || undefined,
                customerId: customerId || undefined
            };

            if (editingTx) {
                await updateTransaction(editingTx.id, payload);
            } else {
                await addTransaction(payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar lançamento');
        }
    };

    const handlePay = async (tx: Transaction) => {
        if (confirm('Marcar como pago hoje?')) {
            await updateTransaction(tx.id, {
                status: 'PAID',
                paymentDate: new Date().toISOString().split('T')[0]
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Lançamentos</h2>
                    <p className="text-gray-400 text-lg">Contas a pagar e receber</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="month"
                        value={monthFilter}
                        onChange={e => setMonthFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-industrial-accent"
                    />
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                    >
                        <Plus size={20} />
                        Novo Lançamento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Receitas</p>
                    <p className="text-2xl font-mono font-bold text-emerald-400">R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Despesas</p>
                    <p className="text-2xl font-mono font-bold text-red-400">R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-sm font-bold uppercase mb-1">Resultado (Mês)</p>
                    <p className={clsx("text-2xl font-mono font-bold", (totals.income - totals.expense) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        R$ {(totals.income - totals.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'INCOME', 'EXPENSE'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTypeFilter(t as any)}
                        className={clsx(
                            "px-4 py-2 rounded-lg font-bold text-sm transition-colors",
                            typeFilter === t ? "bg-slate-700 text-white" : "text-gray-500 hover:bg-slate-800"
                        )}
                    >
                        {t === 'ALL' ? 'Todos' : t === 'INCOME' ? 'Receitas' : 'Despesas'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Vencimento</th>
                                <th className="p-4">Pagamento</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 font-mono text-sm text-gray-300">
                                        {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-400">
                                        {tx.paymentDate ? new Date(tx.paymentDate).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{tx.description}</div>
                                        <div className="text-xs text-gray-500">
                                            {tx.supplierId ? suppliers.find(s => s.id === tx.supplierId)?.tradeName :
                                                tx.customerId ? customers.find(c => c.id === tx.customerId)?.tradeName : '-'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-block px-2 py-1 rounded bg-slate-700 text-xs text-gray-300">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-bold">
                                        <span className={tx.type === 'INCOME' ? "text-emerald-400" : "text-red-400"}>
                                            {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {tx.status === 'PAID' ? (
                                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                <CheckCircle2 size={14} /> PAGO
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                                <AlertCircle size={14} /> PENDENTE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {tx.status === 'PENDING' && (
                                                <button onClick={() => handlePay(tx)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="Baixar (Pagar)">
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleOpenModal(tx)} className="p-2 hover:bg-slate-700 text-blue-400 rounded-lg" title="Editar">
                                                <Filter size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
                                                        deleteTransaction(tx.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-500">
                                        Nenhum lançamento encontrado neste período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                            <h3 className="text-xl font-bold text-white">
                                {editingTx ? 'Editar Lançamento' : 'Novo Lançamento'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">X</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            <div className="flex gap-4 p-1 bg-slate-800 rounded-lg">
                                <button type="button" onClick={() => setType('EXPENSE')} className={clsx("flex-1 py-2 rounded-md font-bold text-sm transition-all", type === 'EXPENSE' ? "bg-red-500 text-white shadow" : "text-gray-400 hover:text-white")}>
                                    DESPESA (Pagar)
                                </button>
                                <button type="button" onClick={() => setType('INCOME')} className={clsx("flex-1 py-2 rounded-md font-bold text-sm transition-all", type === 'INCOME' ? "bg-emerald-500 text-white shadow" : "text-gray-400 hover:text-white")}>
                                    RECEITA (Receber)
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Descrição *</label>
                                    <input required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Valor (R$) *</label>
                                    <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Data de Vencimento *</label>
                                    <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                                        {status === 'PAID' ? (type === 'INCOME' ? 'Data do Recebimento' : 'Data do Pagamento') : 'Data Prevista (Opcional)'}
                                    </label>
                                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                        <option value="PENDING">Pendente</option>
                                        <option value="PAID">Pago / Recebido</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    {/* Spacer or additional logic could go here */}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                                        {type === 'EXPENSE' ? 'Fornecedor' : 'Cliente'}
                                    </label>
                                    <select
                                        value={type === 'EXPENSE' ? supplierId : customerId}
                                        onChange={e => type === 'EXPENSE' ? setSupplierId(e.target.value) : setCustomerId(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {type === 'EXPENSE'
                                            ? suppliers.map(s => <option key={s.id} value={s.id}>{s.tradeName}</option>)
                                            : customers.map(c => <option key={c.id} value={c.id}>{c.tradeName}</option>)
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Conta / Carteira</label>
                                    <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                        <option value="">Selecione...</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                    <option value="GENERAL">Geral</option>
                                    <option value="FUEL">Combustível</option>
                                    <option value="MAINTENANCE">Manutenção</option>
                                    <option value="PARTS">Peças</option>
                                    <option value="SALARY">Salários</option>
                                    <option value="TAXES">Impostos</option>
                                    <option value="SERVICES">Serviços</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                                {editingTx ? 'Salvar Alterações' : 'Criar Lançamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

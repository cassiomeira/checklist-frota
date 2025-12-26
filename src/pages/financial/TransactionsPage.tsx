
import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { useFleet } from '../../store/FleetContext';
import { Plus, Filter, CheckCircle2, AlertCircle, Trash2, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';
import type { Transaction, TransactionAttachment } from '../../types';
import { Paperclip } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
    const { transactions, accounts, suppliers, customers, drivers, addTransaction, addTransactions, updateTransaction, deleteTransaction, deleteTransactions } = useFinancial();
    const { vehicles } = useFleet();

    // Force deploy validation (2025-12-23 11:10)

    // Filters
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    const [driverId, setDriverId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [payeeType, setPayeeType] = useState<'SUPPLIER' | 'DRIVER'>('SUPPLIER');

    // Recurrence State
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [installments, setInstallments] = useState('2');

    // Commission State
    const [generateCommission, setGenerateCommission] = useState(false);

    // Attachment State
    const [attachments, setAttachments] = useState<TransactionAttachment[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const promises = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(promises).then(base64Files => {
                const newAttachments = base64Files.map((base64, idx) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    transactionId: '',
                    fileUrl: base64,
                    fileName: files[idx].name,
                    fileType: files[idx].type,
                    createdAt: new Date().toISOString()
                }));
                setAttachments(prev => [...prev, ...newAttachments]);
                e.target.value = '';
            });
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Handlers
    const handleSort = (key: keyof Transaction) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTransactions.map(t => t.id));
        }
    };

    const filteredTransactions = useMemo(() => {
        let filtered = transactions.filter(t => {
            // Global Search Override
            if (searchTerm) {
                return t.description.toLowerCase().includes(searchTerm.toLowerCase());
            }

            if (!t.dueDate.startsWith(monthFilter)) return false;
            if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
            if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
            return true;
        });

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];

                if (aVal === undefined || bVal === undefined) return 0;

                let comparison = 0;
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    comparison = aVal.localeCompare(bVal);
                } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    comparison = String(aVal).localeCompare(String(bVal));
                }

                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return filtered;
    }, [transactions, monthFilter, typeFilter, statusFilter, searchTerm, sortConfig]);

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
            setDriverId(tx.driverId || '');
            setVehicleId(tx.vehicleId || '');
            setPayeeType(tx.driverId ? 'DRIVER' : 'SUPPLIER');
            setAttachments(tx.attachments || (tx.attachmentUrl ? [{ id: 'legacy', fileUrl: tx.attachmentUrl, fileName: 'legacy.png', fileType: 'image/png', transactionId: tx.id, createdAt: '' }] : []));
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
            setDriverId('');
            setVehicleId('');
            setPayeeType('SUPPLIER');
            setAttachments([]);
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
                supplierId: (type === 'EXPENSE' && payeeType === 'SUPPLIER') ? (supplierId || undefined) : undefined,
                customerId: type === 'INCOME' ? (customerId || undefined) : undefined,
                driverId: type === 'EXPENSE' && payeeType === 'DRIVER' ? driverId : undefined,
                tripId: undefined, // Explicitly ignored in form unless passed
                attachments: attachments
            };


            if (editingTx) {
                await updateTransaction(editingTx.id, payload);
            } else {
                if (type === 'INCOME' && generateCommission) {
                    // Create TWO transactions: Income + Commission Expense
                    const incomeTx = {
                        ...payload,
                        commissionValue: 0 // Don't double track on the income itself effectively
                    };

                    /* 
                       Explanation: We don't need to assign to a variable 'commissionTx' if we are just using the object in the array below.
                       The previous code had: const commissionTx = { ... } but it was never read.
                       We construct the object directly in the addTransactions call now.
                    */
                    // We need to shape commissionTx correctly for addTransactions
                    // Our payload builder above handles some mappings, let's construct explicit objects

                    await addTransactions([
                        incomeTx,
                        {
                            description: `Comissão - ${description} `,
                            amount: parseFloat((valAmount * 0.10).toFixed(2)),
                            type: 'EXPENSE',
                            status: 'PENDING',
                            dueDate: dueDate,
                            category: 'SERVICES',
                            driverId: driverId,
                            paymentDate: undefined
                        }
                    ]);

                } else if (type === 'EXPENSE' && isRecurrent) {
                    const count = parseInt(installments);
                    const batch = [];
                    const baseDate = new Date(dueDate);

                    for (let i = 0; i < count; i++) {
                        const newDate = new Date(baseDate);
                        newDate.setMonth(baseDate.getMonth() + i);
                        // Handle generic month overflow logic if needed, but Date setMonth handles rollover

                        batch.push({
                            ...payload,
                            description: `${description} (${i + 1}/${count})`,
                            dueDate: newDate.toISOString().split('T')[0],
                            status: 'PENDING' as 'PENDING', // Force pending for future installments
                            paymentDate: undefined // Clear payment date for future
                        });
                    }
                    await addTransactions(batch);
                } else {
                    await addTransaction(payload);
                }
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

    const balanceStats = useMemo(() => {
        const startOfMonth = new Date(monthFilter + '-01');
        const nextMonth = new Date(startOfMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // 1. Total Initial Balance (from wallets/banks setup)
        const totalInitial = accounts.reduce((acc, a) => acc + a.initialBalance, 0);

        // 2. Accumulated Past Flow (PAID transactions before this month)
        // We use paymentDate for cash flow accuracy
        const pastFlow = transactions.reduce((acc, t) => {
            if (t.status === 'PAID' && t.paymentDate) {
                const pDate = new Date(t.paymentDate);
                if (pDate < startOfMonth) {
                    return acc + (t.type === 'INCOME' ? t.amount : -t.amount);
                }
            }
            return acc;
        }, 0);

        const openingBalance = totalInitial + pastFlow;

        // 3. Current Month Flow (Projected: Includes Pending + Paid based on Due Date filtering)
        // Note: totals.income and totals.expense already come from filteredTransactions (by Due Date)
        const currentMonthNet = totals.income - totals.expense;

        const closingBalance = openingBalance + currentMonthNet;

        return { openingBalance, closingBalance, currentMonthNet };
    }, [accounts, transactions, monthFilter, totals]);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Lançamentos</h2>
                    <p className="text-gray-400 text-lg">Contas a pagar e receber</p>
                </div>
                <div className="flex gap-4 items-center">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={async () => {
                                if (confirm(`Deseja excluir ${selectedIds.length} lançamentos selecionados?`)) {
                                    await deleteTransactions(selectedIds);
                                    setSelectedIds([]);
                                }
                            }}
                            className="bg-red-500/10 text-red-500 border border-red-500/50 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all animate-fade-in"
                        >
                            <Trash2 size={20} />
                            Excluir Selecionados ({selectedIds.length})
                        </button>
                    )}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-industrial-accent transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-industrial-accent w-40 focus:w-64 transition-all"
                        />
                    </div>
                    {!searchTerm && (
                        <input
                            type="month"
                            value={monthFilter}
                            onChange={e => setMonthFilter(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-industrial-accent"
                        />
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                    >
                        <Plus size={20} />
                        Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* 1. Opening Balance */}
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Saldo Anterior</p>
                    <p className={clsx("text-2xl font-mono font-bold", balanceStats.openingBalance >= 0 ? "text-blue-400" : "text-red-400")}>
                        R$ {balanceStats.openingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Acumulado até dia 01</p>
                </div>

                {/* 2. Month Income */}
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Entradas (Mês)</p>
                    <p className="text-2xl font-mono font-bold text-emerald-400">
                        + R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* 3. Month Expense */}
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Saídas (Mês)</p>
                    <p className="text-2xl font-mono font-bold text-red-400">
                        - R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* 4. Projected Closing Balance */}
                <div className={clsx("p-6 rounded-2xl border transition-all",
                    balanceStats.closingBalance >= 0
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-red-950/20 border-red-500/30"
                )}>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Saldo Final (Previsto)</p>
                    <p className={clsx("text-2xl font-mono font-bold", balanceStats.closingBalance >= 0 ? "text-emerald-400" : "text-red-400")}>
                        R$ {balanceStats.closingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3 mb-6">
                {/* Type Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['ALL', 'INCOME', 'EXPENSE'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t as any)}
                            className={clsx(
                                "px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap",
                                typeFilter === t ? "bg-slate-700 text-white" : "text-gray-500 hover:bg-slate-800"
                            )}
                        >
                            {t === 'ALL' ? 'Todos' : t === 'INCOME' ? 'Receitas' : 'Despesas'}
                        </button>
                    ))}
                </div>

                {/* Status Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[{ key: 'ALL', label: 'Todas' }, { key: 'PENDING', label: 'A Pagar' }, { key: 'PAID', label: 'Pagas' }].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key as any)}
                            className={clsx(
                                "px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap",
                                statusFilter === key ? "bg-industrial-accent text-white" : "text-gray-500 hover:bg-slate-800"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-gray-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded accent-industrial-accent"
                                        checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th
                                    className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('dueDate')}
                                >
                                    <div className="flex items-center gap-2">
                                        Vencimento
                                        {sortConfig.key === 'dueDate' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-40" />
                                        )}
                                    </div>
                                </th>
                                <th className="p-4">Pagamento</th>
                                <th className="p-4">Descrição</th>
                                <th
                                    className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('category')}
                                >
                                    <div className="flex items-center gap-2">
                                        Categoria
                                        {sortConfig.key === 'category' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-40" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center gap-2">
                                        Valor
                                        {sortConfig.key === 'amount' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-40" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status
                                        {sortConfig.key === 'status' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-40" />
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} className={clsx("hover:bg-slate-800/50 transition-colors group", selectedIds.includes(tx.id) && "bg-slate-800/80")}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded accent-industrial-accent"
                                            checked={selectedIds.includes(tx.id)}
                                            onChange={() => toggleSelection(tx.id)}
                                        />
                                    </td>
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
                                                tx.driverId ? `Motorista: ${drivers.find(d => d.id === tx.driverId)?.name} ` :
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
                                        <div className="flex justify-end items-center gap-2">
                                            {tx.status === 'PENDING' && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handlePay(tx)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="Baixar (Pagar)">
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            {tx.attachments && tx.attachments.length > 0 && (
                                                <div className="relative group/attach ml-2">
                                                    <button className="p-2 bg-purple-500/10 text-purple-400 rounded-lg flex items-center gap-1 hover:bg-purple-500/20" title="Anexos (Passe o mouse)">
                                                        <Paperclip size={18} />
                                                        <span className="text-xs font-bold">{tx.attachments.length}</span>
                                                    </button>

                                                    {/* Dropdown for attachments */}
                                                    <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 min-w-[200px] z-50 hidden group-hover/attach:block">
                                                        <div className="text-xs text-slate-400 px-2 py-1 mb-1 border-b border-slate-700 font-bold uppercase">Anexos</div>
                                                        {tx.attachments.map((attach, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const link = document.createElement('a');
                                                                    link.href = attach.fileUrl;
                                                                    link.download = attach.fileName || `anexo-${idx}`;
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                                className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2 truncate"
                                                            >
                                                                <Download size={14} />
                                                                <span className="truncate">{attach.fileName || `Anexo ${idx + 1}`}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            {
                isModalOpen && (
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

                                {/* Commission Toggle for Income */}
                                {!editingTx && type === 'INCOME' && (
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                                            <input
                                                type="checkbox"
                                                checked={generateCommission}
                                                onChange={e => setGenerateCommission(e.target.checked)}
                                                className="w-4 h-4 accent-industrial-accent rounded"
                                            />
                                            <span className="text-white font-bold text-sm">Gerar Comissão (10%)?</span>
                                        </label>
                                        {generateCommission && (
                                            <div className="animate-fade-in">
                                                <p className="text-xs text-emerald-400 ml-6 mb-2">
                                                    Será creditado R$ {(parseFloat(amount || '0') * 0.10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para o motorista selecionado.
                                                </p>
                                                {/* Driver Selection for Income Commission */}
                                                <div className="ml-6">
                                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Selecione o Motorista *</label>
                                                    <select required value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                                        <option value="">Selecione...</option>
                                                        {drivers.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!editingTx && type === 'EXPENSE' && (
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                                            <input
                                                type="checkbox"
                                                checked={isRecurrent}
                                                onChange={e => setIsRecurrent(e.target.checked)}
                                                className="w-4 h-4 accent-industrial-accent rounded"
                                            />
                                            <span className="text-white font-bold text-sm">Parcelar / Recorrência?</span>
                                        </label>

                                        {isRecurrent && (
                                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nº Parcelas</label>
                                                    <input
                                                        type="number"
                                                        min="2"
                                                        max="60"
                                                        value={installments}
                                                        onChange={e => setInstallments(e.target.value)}
                                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Intervalo</label>
                                                    <select className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" disabled>
                                                        <option>Mensal</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                            {type === 'EXPENSE' ? (
                                                <div className="flex gap-4">
                                                    <label className="cursor-pointer flex items-center gap-1">
                                                        <input type="radio" checked={payeeType === 'SUPPLIER'} onChange={() => setPayeeType('SUPPLIER')} className="accent-industrial-accent" />
                                                        Fornecedor
                                                    </label>
                                                    <label className="cursor-pointer flex items-center gap-1">
                                                        <input type="radio" checked={payeeType === 'DRIVER'} onChange={() => setPayeeType('DRIVER')} className="accent-industrial-accent" />
                                                        Motorista
                                                    </label>
                                                </div>
                                            ) : 'Cliente'}
                                        </label>
                                        {type === 'EXPENSE' ? (
                                            payeeType === 'SUPPLIER' ? (
                                                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                                    <option value="">Selecione o Fornecedor...</option>
                                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.tradeName}</option>)}
                                                </select>
                                            ) : (
                                                <select value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                                    <option value="">Selecione o Motorista...</option>
                                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            )
                                        ) : (
                                            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                                <option value="">Selecione o Cliente...</option>
                                                {customers.map(c => <option key={c.id} value={c.id}>{c.tradeName}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Veículo (Opcional)</label>
                                        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                            <option value="">Sem veículo vinculado</option>
                                            {vehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.plate} - {v.type === 'CAVALO' ? (v as any).model : 'Carreta'}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                            <option value="">Selecione...</option>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Comprovantes / Anexos (PDF, Imagens)</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        multiple
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                                    />
                                    <div className="mt-3 space-y-2">
                                        {attachments.map((file, idx) => (
                                            <div key={file.id || idx} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {file.fileType.includes('image') ? (
                                                        <img src={file.fileUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-red-500/20 text-red-400 flex items-center justify-center rounded">
                                                            <span className="text-[10px] font-bold">PDF</span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-slate-300 truncate max-w-[200px]">{file.fileName}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(file.id)}
                                                    className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Trash2 size={14} />
                                                        Remover
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
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
                )
            }

            {/* Selection Summary Panel */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-industrial-accent/90 to-blue-600/90 backdrop-blur-md border-t border-white/20 shadow-2xl p-4 animate-fade-in z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <CheckCircle2 size={20} />
                                <span className="font-bold">{selectedIds.length} {selectedIds.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
                            </div>
                            <div className="text-white font-mono text-xl font-bold">
                                Total: R$ {filteredTransactions
                                    .filter(t => selectedIds.includes(t.id))
                                    .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0)
                                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-colors"
                        >
                            Limpar Seleção
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

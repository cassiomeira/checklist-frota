import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { User, DollarSign, Printer } from 'lucide-react';
import clsx from 'clsx';

export const DriverStatementPage: React.FC = () => {
    const { drivers, transactions } = useFinancial();

    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const selectedDriver = drivers.find(d => d.id === selectedDriverId);

    const handlePrint = () => {
        window.print();
    };

    const statementData = useMemo(() => {
        if (!selectedDriverId) return { history: [], pending: 0, paid: 0, balance: 0 };

        const startOfMonth = new Date(monthFilter + '-01');
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        // Filter transactions for this driver
        // We want ALL PENDING (debt) regardless of date? Or just filtering by month view?
        // Usually, a Statement shows the *Movement* of the month and the *Balance* carried over.
        // For "Pending" (To Pay), it's a snapshot of current debt.
        // For "Paid" (History), it's what happened in the month.

        const rawTxs = transactions.filter(t => t.driverId === selectedDriverId);

        // 1. Calculate Total Debt (All Time Pending Expenses)
        const totalPendingDebt = rawTxs
            .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
            .reduce((acc, t) => acc + t.amount, 0);

        // 2. Filter History for the Selected Month (By Payment Date or Due Date)
        // Using Due Date for visibility of what fell in this month
        const history = rawTxs.filter(t => {
            const d = new Date(t.dueDate);
            return d >= startOfMonth && d < endOfMonth;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        // 3. Month Totals
        const monthPaid = history
            .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
            .reduce((acc, t) => acc + t.amount, 0);

        return {
            history,
            pending: totalPendingDebt,
            paid: monthPaid
        };
    }, [selectedDriverId, transactions, monthFilter]);

    return (
        <div className="max-w-7xl mx-auto pb-20 print:p-0 print:mx-0 print:max-w-none print:bg-white print:text-black">
            {/* Print Header Override */}
            <div className="hidden print:block mb-8 text-black border-b pb-4">
                <h1 className="text-2xl font-bold">Extrato do Motorista</h1>
                <p>Referência: {new Date(monthFilter + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                <p>Motorista: {selectedDriver?.name}</p>
            </div>

            {/* Header (Screen Only) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Extrato do Motorista</h2>
                    <p className="text-gray-400 text-lg">Acompanhamento de Comissões e Vales</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        disabled={!selectedDriverId}
                        className="bg-slate-800 border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Imprimir Extrato"
                    >
                        <Printer size={20} />
                    </button>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-2 flex items-center gap-2">
                        <User className="text-gray-400 ml-2" size={20} />
                        <select
                            value={selectedDriverId}
                            onChange={e => setSelectedDriverId(e.target.value)}
                            className="bg-transparent text-white font-bold outline-none w-48"
                        >
                            <option value="">Selecione o Motorista...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="month"
                        value={monthFilter}
                        onChange={e => setMonthFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-industrial-accent"
                    />
                </div>
            </div>

            {selectedDriverId ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
                        {/* 1. Saldo a Pagar (Dívida Total) */}
                        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group print:bg-white print:border-2 print:border-black print:text-black">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity print:hidden">
                                <DollarSign size={64} />
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase mb-1 print:text-black">Total a Pagar (Pendente)</p>
                            <p className="text-3xl font-mono font-bold text-yellow-400 print:text-black">
                                R$ {statementData.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 print:text-gray-600">Acumulado de todas as datas</p>
                        </div>

                        {/* 2. Pago no Mês */}
                        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 print:bg-white print:border-2 print:border-black">
                            <p className="text-gray-400 text-xs font-bold uppercase mb-1 print:text-black">Pago neste Mês</p>
                            <p className="text-3xl font-mono font-bold text-emerald-400 print:text-black">
                                R$ {statementData.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* 3. Empty Slot or Count */}
                        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-center print:hidden">
                            <p className="text-gray-500 text-sm">
                                Visualizando movimentação de <strong className="text-white">{new Date(monthFilter + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Statement List */}
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden print:bg-white print:border-black print:rounded-none">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-gray-400 text-xs uppercase font-bold print:bg-gray-100 print:text-black print:border-b print:border-black">
                                <tr>
                                    <th className="p-4 print:py-2">Data</th>
                                    <th className="p-4 print:py-2">Descrição</th>
                                    <th className="p-4 print:py-2">Status</th>
                                    <th className="p-4 text-right print:py-2">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 print:divide-gray-300">
                                {statementData.history.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500 print:text-black">
                                            Nenhuma movimentação neste mês.
                                        </td>
                                    </tr>
                                ) : (
                                    statementData.history.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors print:hover:bg-transparent">
                                            <td className="p-4 font-mono text-sm text-gray-300 print:text-black print:py-2">
                                                {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-4 font-bold text-white print:text-black print:py-2">
                                                {tx.description}
                                            </td>
                                            <td className="p-4 print:py-2">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-md text-xs font-bold print:border print:border-black print:text-black print:bg-transparent",
                                                    tx.status === 'PAID' ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                                                )}>
                                                    {tx.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-white print:text-black print:py-2">
                                                R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 opacity-50">
                    <User size={64} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-xl font-bold">Selecione um motorista acima</p>
                    <p>para visualizar o extrato.</p>
                </div>
            )}
        </div>
    );
};

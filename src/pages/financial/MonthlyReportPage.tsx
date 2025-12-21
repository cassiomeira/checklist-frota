import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { Printer, TrendingUp, TrendingDown, Minus, Calculator } from 'lucide-react';
import clsx from 'clsx';

export const MonthlyReportPage: React.FC = () => {
    const { transactions } = useFinancial();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const report = useMemo(() => {
        const startOfMonth = new Date(selectedMonth + '-01');
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        // Filter transactions by PAYMENT DATE (Cash Basis) or DUE DATE (Accrual Basis)?
        // DRE is usually Accrual (Competência), but for small business Cash (Caixa) is often preferred.
        // Let's use PREDICTED/DUE DATE for a "Competency" view, or switch to Paid.
        // Given the requirement for "Monthly Closure", usually checks what happened in that month.
        // Let's stick to Competence (Due Date) for now as it aligns with the Dashboard.

        const monthTxs = transactions.filter(t => {
            const d = new Date(t.dueDate);
            return d >= startOfMonth && d < endOfMonth;
        });

        // 1. Gross Revenue (Receita Operacional Bruta) - Fretes
        const revenue = monthTxs
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => acc + t.amount, 0);

        // 2. Variable Costs (Custos Variáveis) - Combustível, Comissões
        const variableCostsTxs = monthTxs.filter(t =>
            t.type === 'EXPENSE' &&
            (t.category === 'FUEL' || t.category === 'COMMISSION' || t.description.toLowerCase().includes('comissão'))
        );
        const variableCosts = variableCostsTxs.reduce((acc, t) => acc + t.amount, 0);

        // 3. Contribution Margin (Margem de Contribuição)
        const contributionMargin = revenue - variableCosts;

        // 4. Fixed/Maintenance Costs (Custos Fixos / Manutenção)
        const fixedCostsTxs = monthTxs.filter(t =>
            t.type === 'EXPENSE' &&
            !variableCostsTxs.includes(t) // Exclude what we already counted
        );
        const fixedCosts = fixedCostsTxs.reduce((acc, t) => acc + t.amount, 0);

        // 5. Operational Result (Resultado Operacional / EBITDA approx)
        const result = contributionMargin - fixedCosts;

        return {
            revenue,
            variableCosts,
            variableCostsDetail: variableCostsTxs,
            contributionMargin,
            fixedCosts,
            fixedCostsDetail: fixedCostsTxs,
            result
        };
    }, [transactions, selectedMonth]);

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatPercent = (val: number, total: number) => {
        if (total === 0) return '0%';
        return ((val / total) * 100).toFixed(1) + '%';
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 print:p-0 print:mx-0 print:max-w-none print:bg-white">
            {/* Header (Screen) */}
            <div className="flex justify-between items-center mb-8 gap-4 print:hidden">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Calculator className="text-industrial-accent" size={32} />
                        DRE Gerencial
                    </h2>
                    <p className="text-gray-400 text-lg">Demonstrativo de Resultado do Exercício</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-slate-800 border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 p-3 rounded-xl transition-colors"
                        title="Imprimir Relatório"
                    >
                        <Printer size={20} />
                    </button>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-industrial-accent font-bold"
                    />
                </div>
            </div>

            {/* Header (Print) */}
            <div className="hidden print:block mb-8 text-black border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-center mb-2">Relatório Financeiro Mensal</h1>
                <div className="flex justify-between text-sm font-bold mt-4">
                    <p>Empresa: CLC TRANSPORTES</p>
                    <p>Período: {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                </div>
            </div>

            {/* DRE Table */}
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl print:shadow-none print:border-none print:bg-white print:text-black">
                {/* 1. Receita */}
                <div className="p-6 border-b border-slate-700/50 print:border-black/20">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-xl font-black text-emerald-400 print:text-black uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={24} className="print:hidden" /> (+) Receita Operacional Bruta
                        </h3>
                        <span className="text-2xl font-mono font-bold text-white print:text-black">{formatCurrency(report.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden print:hidden">
                        <div className="bg-emerald-500 h-full w-full"></div>
                    </div>
                </div>

                {/* 2. Custos Variáveis */}
                <div className="p-6 border-b border-slate-700/50 bg-slate-800/20 print:bg-white print:border-black/20">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold text-red-400 print:text-black uppercase tracking-wider flex items-center gap-2">
                            <TrendingDown size={20} className="print:hidden" /> (-) Custos Variáveis
                        </h3>
                        <span className="text-xl font-mono font-bold text-red-200 print:text-black">{formatCurrency(report.variableCosts)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 print:text-black italic">Combustível, Comissões e Custos diretos de viagem.</p>

                    <div className="space-y-2 pl-6 border-l-2 border-red-500/20 print:border-black/20">
                        <div className="flex justify-between text-sm text-gray-400 print:text-black">
                            <span>Combustível</span>
                            <span>{formatCurrency(report.variableCostsDetail.filter(t => t.category === 'FUEL').reduce((a, b) => a + b.amount, 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400 print:text-black">
                            <span>Comissões</span>
                            <span>{formatCurrency(report.variableCostsDetail.filter(t => t.category === 'COMMISSION' || t.description.toLowerCase().includes('comissão')).reduce((a, b) => a + b.amount, 0))}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Margem de Contribuição */}
                <div className="p-6 border-b border-slate-700/50 bg-slate-700/30 print:bg-gray-100 print:border-black">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-bold text-blue-300 print:text-black uppercase tracking-wider flex items-center gap-2">
                            (=) Margem de Contribuição
                        </h3>
                        <div className="text-right">
                            <span className="text-2xl font-mono font-bold text-blue-100 print:text-black">{formatCurrency(report.contributionMargin)}</span>
                            <p className="text-xs text-blue-400 font-bold print:text-black">{formatPercent(report.contributionMargin, report.revenue)} da Receita</p>
                        </div>
                    </div>
                </div>

                {/* 4. Custos Fixos */}
                <div className="p-6 border-b border-slate-700/50 print:bg-white print:border-black/20">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-orange-400 print:text-black uppercase tracking-wider flex items-center gap-2">
                            <Minus size={20} className="print:hidden" /> (-) Despesas Fixas & Manutenção
                        </h3>
                        <span className="text-xl font-mono font-bold text-orange-200 print:text-black">{formatCurrency(report.fixedCosts)}</span>
                    </div>

                    {/* Top Fixed Costs Categories */}
                    <div className="grid grid-cols-2 gap-4 print:block print:space-y-1">
                        {Object.entries(report.fixedCostsDetail.reduce((acc, t) => {
                            acc[t.category] = (acc[t.category] || 0) + t.amount;
                            return acc;
                        }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between text-sm p-2 bg-slate-900/30 rounded border border-slate-800 print:bg-transparent print:border-none print:border-b print:border-dotted print:border-gray-400 print:p-0">
                                <span className="text-gray-400 print:text-black capitalize">{cat === 'MAINTENANCE' ? 'Manutenção' : cat}</span>
                                <span className="font-mono text-gray-200 print:text-black">{formatCurrency(val)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Result (EBITDA) */}
                <div className={clsx(
                    "p-8 border-t-2 print:border-black print:bg-white",
                    report.result >= 0 ? "bg-emerald-900/20 border-emerald-500/50" : "bg-red-900/20 border-red-500/50"
                )}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                                (=) Resultado Operacional
                            </h3>
                            <p className="text-gray-400 print:text-black text-sm mt-1">Lucro/Prejuízo antes de juros e impostos (EBITDA Simulado)</p>
                        </div>
                        <div className="text-right">
                            <span className={clsx(
                                "text-4xl font-mono font-black print:text-black",
                                report.result >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                                {formatCurrency(report.result)}
                            </span>
                            <p className={clsx(
                                "text-sm font-bold mt-1 print:text-black",
                                report.result >= 0 ? "text-emerald-600" : "text-red-600"
                            )}>
                                {formatPercent(report.result, report.revenue)} de Margem Líquida
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Area (Print Only) */}
            <div className="hidden print:flex mt-16 justify-between px-10">
                <div className="text-center">
                    <div className="w-64 border-t border-black mb-2"></div>
                    <p className="text-sm font-bold text-black">Responsável Financeiro</p>
                </div>
                <div className="text-center">
                    <div className="w-64 border-t border-black mb-2"></div>
                    <p className="text-sm font-bold text-black">Diretoria</p>
                </div>
            </div>
        </div>
    );
};

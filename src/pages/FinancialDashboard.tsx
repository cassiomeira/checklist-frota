import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Users, Building2, TrendingUp, TrendingDown, DollarSign, Droplet, Calculator, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinancial } from '../store/FinancialContext';
import { useFleet } from '../store/FleetContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import clsx from 'clsx';
import { PaymentAlertBanner } from '../components/PaymentAlertBanner';

export const FinancialDashboard: React.FC = () => {
    const { accounts, transactions, fuelEntries, trips } = useFinancial();
    const { vehicles } = useFleet();

    // Calculations
    const totalBalance = React.useMemo(() => {
        const initial = accounts.reduce((acc, curr) => acc + curr.initialBalance, 0);
        const movements = transactions
            .filter(t => t.status === 'PAID')
            .reduce((acc, curr) => {
                return curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount;
            }, 0);
        return initial + movements;
    }, [accounts, transactions]);

    const pendingPayables = transactions
        .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingReceivables = transactions
        .filter(t => t.type === 'INCOME' && t.status === 'PENDING')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const currentMonthFuel = React.useMemo(() => {
        const now = new Date();
        return fuelEntries
            .filter(f => {
                const d = new Date(f.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((acc, curr) => ({
                cost: acc.cost + curr.totalCost,
                liters: acc.liters + curr.liters
            }), { cost: 0, liters: 0 });
    }, [fuelEntries]);

    // Pie Chart Data (Expenses by Category)
    const expenseData = React.useMemo(() => {
        const categoryTotals = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, curr) => {
                const cat = curr.category || 'OUTROS';
                acc[cat] = (acc[cat] || 0) + curr.amount;
                return acc;
            }, {} as Record<string, number>);

        const categoryLabels: Record<string, string> = {
            'FUEL': 'Combustível',
            'MAINTENANCE': 'Manutenção',
            'PARTS': 'Peças',
            'SALARY': 'Salários',
            'TAXES': 'Impostos',
            'SERVICES': 'Serviços/Comissões', // Commissions fall here usually
            'GENERAL': 'Geral'
        };

        return Object.entries(categoryTotals)
            .map(([key, value]) => ({
                name: categoryLabels[key] || key,
                value
            }))
            .sort((a, b) => b.value - a.value); // Sort descending
    }, [transactions]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

    // Vehicle Profit Data
    const vehicleProfitData = React.useMemo(() => {
        return vehicles.map(vehicle => {
            const vehicleTransactions = transactions.filter(t => t.vehicleId === vehicle.id);
            const income = vehicleTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((acc, curr) => acc + curr.amount, 0);

            const expense = vehicleTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                name: vehicle.plate,
                Receita: income,
                Despesa: expense,
                Lucro: income - expense
            };
        }).filter(v => v.Receita > 0 || v.Despesa > 0); // Only show active vehicles
    }, [vehicles, transactions]);

    // Monthly Profit Trend (Last 6 Months)
    const trendData = React.useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();

        return last6Months.map(date => {
            const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
            const monthTxs = transactions.filter(t => t.dueDate.startsWith(monthStr));

            const income = monthTxs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
            const expense = monthTxs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

            return {
                name: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
                Receita: income,
                Despesa: expense,
                Lucro: income - expense
            };
        });
    }, [transactions]);

    // Filter transactions due today or overdue
    const dueTodayTransactions = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return transactions.filter(t =>
            t.status === 'PENDING' &&
            t.type === 'EXPENSE' &&
            t.dueDate <= today  // Include overdue transactions
        );
    }, [transactions]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight leading-none">Gestão Financeira</h1>
                <p className="text-gray-400 text-lg mt-2">Visão geral do fluxo de caixa e pendências</p>
            </header>

            {/* Payment Alert Banner */}
            <PaymentAlertBanner dueTodayTransactions={dueTodayTransactions} />

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Balance */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Wallet className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-gray-400 font-bold uppercase text-xs">Saldo Atual</span>
                    </div>
                    <div className={`text-3xl font-mono font-bold ${totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                        R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* To Pay */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <TrendingDown className="text-red-400" size={24} />
                        </div>
                        <span className="text-gray-400 font-bold uppercase text-xs">A Pagar</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                        R$ {pendingPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-red-400 mt-2 font-bold">
                        {transactions.filter(t => t.type === 'EXPENSE' && t.status === 'PENDING').length} contas pendentes
                    </div>
                </div>

                {/* To Receive */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <TrendingUp className="text-blue-400" size={24} />
                        </div>
                        <span className="text-gray-400 font-bold uppercase text-xs">A Receber</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                        R$ {pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-blue-400 mt-2 font-bold">
                        {transactions.filter(t => t.type === 'INCOME' && t.status === 'PENDING').length} recebimentos
                    </div>
                </div>

                {/* Fuel Month */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Droplet size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <Droplet className="text-orange-400" size={24} />
                        </div>
                        <span className="text-gray-400 font-bold uppercase text-xs">Combustível (Mês)</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">
                        R$ {currentMonthFuel.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-orange-400 mt-2 font-bold">
                        {currentMonthFuel.liters.toFixed(0)} Litros abastecidos
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg lg:col-span-1">
                    <h3 className="text-xl font-bold text-white mb-6">Despesas por Categoria</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit by Vehicle Chart */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-6">Resultado por Veículo</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vehicleProfitData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <RechartsLegend />
                                <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


            {/* --- TRIP ANALYSIS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Melhores Viagens */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" />
                        Melhores Viagens (Lucro)
                    </h3>
                    <div className="space-y-3">
                        {trips
                            .filter(t => t.status === 'COMPLETED')
                            .map(t => ({
                                ...t,
                                profit: t.freightAmount - (t.extraExpensesAmount + t.fuelAmount + t.commissionAmount)
                            }))
                            .sort((a, b) => b.profit - a.profit)
                            .slice(0, 5)
                            .map((t) => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">{t.startLocation} → {t.endLocation}</div>
                                        <div className="text-xs text-gray-500">{new Date(t.endDate!).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-blue-400">
                                            {t.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className="text-xs text-green-500 flex items-center justify-end gap-1">
                                            <DollarSign size={10} /> {t.freightAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                        {trips.filter(t => t.status === 'COMPLETED').length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">Nenhuma viagem finalizada.</p>
                        )}
                    </div>
                </div>

                {/* Viagens com Menor Margem */}
                <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-400" />
                        Menores Margens / Prejuízo
                    </h3>
                    <div className="space-y-3">
                        {trips
                            .filter(t => t.status === 'COMPLETED')
                            .map(t => ({
                                ...t,
                                profit: t.freightAmount - (t.extraExpensesAmount + t.fuelAmount + t.commissionAmount)
                            }))
                            .sort((a, b) => a.profit - b.profit)
                            .slice(0, 5)
                            .map((t) => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">{t.startLocation} → {t.endLocation}</div>
                                        <div className="text-xs text-gray-500">{new Date(t.endDate!).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={clsx("text-sm font-bold", t.profit >= 0 ? "text-slate-400" : "text-red-400")}>
                                            {t.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        <div className="text-xs text-red-400 flex items-center justify-end gap-1">
                                            Gastos: {((t.extraExpensesAmount + t.fuelAmount + t.commissionAmount)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                        {trips.filter(t => t.status === 'COMPLETED').length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">Nenhuma viagem finalizada.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Tendência de Lucro (Últimos 6 Meses)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            />
                            <RechartsLegend />
                            <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="text-xl font-bold text-white mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link to="/financial/transactions" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-purple-500/10 rounded-xl w-fit group-hover:bg-purple-500/20 transition-colors">
                        <DollarSign className="text-purple-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Lançamentos</h3>
                    <p className="text-gray-400 text-sm mt-1">Gerenciar fluxo</p>
                </Link>

                <Link to="/financial/driver-statement" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-yellow-500/10 rounded-xl w-fit group-hover:bg-yellow-500/20 transition-colors">
                        <Users className="text-yellow-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Extrato</h3>
                    <p className="text-gray-400 text-sm mt-1">Comissões Motorista</p>
                </Link>

                <Link to="/financial/fuel" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-orange-500/10 rounded-xl w-fit group-hover:bg-orange-500/20 transition-colors">
                        <Droplet className="text-orange-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Abastecimento</h3>
                    <p className="text-gray-400 text-sm mt-1">Lançar Água/Diesel</p>
                </Link>

                <Link to="/financial/suppliers" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-blue-500/10 rounded-xl w-fit group-hover:bg-blue-500/20 transition-colors">
                        <Building2 className="text-blue-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Fornecedores</h3>
                    <p className="text-gray-400 text-sm mt-1">Cadastro de parceiros</p>
                </Link>

                <Link to="/financial/accounts" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-emerald-500/10 rounded-xl w-fit group-hover:bg-emerald-500/20 transition-colors">
                        <Wallet className="text-emerald-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Carteiras</h3>
                    <p className="text-gray-400 text-sm mt-1">Bancos e Caixas</p>
                </Link>

                <Link to="/financial/customers" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-pink-500/10 rounded-xl w-fit group-hover:bg-pink-500/20 transition-colors">
                        <Users className="text-pink-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Clientes</h3>
                    <p className="text-gray-400 text-sm mt-1">Cadastro de tomadores</p>
                </Link>

                <Link to="/financial/reports" className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all group">
                    <div className="p-4 bg-teal-500/10 rounded-xl w-fit group-hover:bg-teal-500/20 transition-colors">
                        <Calculator className="text-teal-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Relatórios</h3>
                    <p className="text-gray-400 text-sm mt-1">DRE e Fechamento</p>
                </Link>
            </div>
        </div >
    );
};

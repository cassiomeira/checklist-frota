import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Users, Building2, TrendingUp, TrendingDown, DollarSign, Droplet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinancial } from '../store/FinancialContext';
import { useFleet } from '../store/FleetContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';

export const FinancialDashboard: React.FC = () => {
    const { accounts, transactions, fuelEntries } = useFinancial();
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

    // Pie Chart Data
    const expenseData = React.useMemo(() => {
        const paid = transactions
            .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const pending = transactions
            .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
            .reduce((acc, curr) => acc + curr.amount, 0);

        return [
            { name: 'Pagas', value: paid },
            { name: 'A Pagar', value: pending }
        ];
    }, [transactions]);

    const COLORS = ['#10b981', '#ef4444']; // Emerald-500, Red-500

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

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight leading-none">Gestão Financeira</h1>
                <p className="text-gray-400 text-lg mt-2">Visão geral do fluxo de caixa e pendências</p>
            </header>

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
                    <h3 className="text-xl font-bold text-white mb-6">Despesas: Pagas vs A Pagar</h3>
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
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
                                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <RechartsLegend />
                                <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
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
            </div>
        </div>
    );
};

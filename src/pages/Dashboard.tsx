import React, { useState } from 'react';
import { useFleet } from '../store/FleetContext';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, AlertOctagon, Wrench, Eye } from 'lucide-react';
import clsx from 'clsx';
import type { Truck, Checklist } from '../types';
import { ChecklistDetails } from '../components/ChecklistDetails';

const KPICard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl hover:bg-slate-800/60 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={clsx("p-3 rounded-xl transition-transform group-hover:scale-110", colorClass)}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const { vehicles, checklists, drivers } = useFleet();
    const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

    const trucks = vehicles.filter(v => v.type === 'CAVALO') as Truck[];

    // Logic
    const alerts = trucks.map(truck => {
        const diff = truck.nextOilChangeKm - truck.currentKm;
        let status: 'OK' | 'ATTENTION' | 'URGENT' = 'OK';
        if (diff <= 0) status = 'URGENT';
        else if (diff < 5000) status = 'ATTENTION';
        return { truck, diff, status };
    }).filter(a => a.status !== 'OK');

    const urgentCount = alerts.filter(a => a.status === 'URGENT').length;
    const attentionCount = alerts.filter(a => a.status === 'ATTENTION').length;
    const okCount = trucks.length - urgentCount - attentionCount;

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end border-b border-gray-700/50 pb-6">
                <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Painel de Controle</h2>
                    <p className="text-gray-400 text-lg">Visão geral da frota e status operacional</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Veículos"
                    value={vehicles.length}
                    icon={<TrendingUp size={24} />}
                    colorClass="bg-blue-500/10 text-blue-400"
                />
                <KPICard
                    title="Operação Normal"
                    value={okCount + vehicles.filter(v => v.type === 'CARRETA').length}
                    icon={<CheckCircle size={24} />}
                    colorClass="bg-emerald-500/10 text-emerald-400"
                />
                <KPICard
                    title="Próximos da Troca"
                    value={attentionCount}
                    icon={<Clock size={24} />}
                    colorClass="bg-amber-500/10 text-amber-400"
                />
                <KPICard
                    title="Manutenção Urgente"
                    value={urgentCount}
                    icon={<AlertOctagon size={24} />}
                    colorClass="bg-red-500/10 text-red-400"
                />
            </div>

            {/* Alerts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                <section>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <Wrench className="text-industrial-accent" size={20} />
                        </div>
                        Alertas de Manutenção
                    </h3>

                    {alerts.length === 0 ? (
                        <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-dashed border-slate-700 text-center text-gray-500 h-full flex flex-col justify-center items-center">
                            <CheckCircle className="mb-2 text-emerald-500/50" size={40} />
                            <p>Veículos ok</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.truck.id}
                                    className={clsx(
                                        "group p-4 rounded-xl border-l-4 flex justify-between items-center transition-all",
                                        alert.status === 'URGENT'
                                            ? "bg-red-950/20 border-red-500"
                                            : "bg-amber-950/20 border-amber-500"
                                    )}
                                >
                                    <div>
                                        <p className="font-bold text-white">{alert.truck.plate}</p>
                                        <p className="text-xs text-gray-400">
                                            {alert.diff < 0 ? `Excedido: ${Math.abs(alert.diff)} km` : `Resta: ${alert.diff} km`}
                                        </p>
                                    </div>
                                    <span className={clsx(
                                        "px-2 py-1 rounded text-[10px] font-black uppercase",
                                        alert.status === 'URGENT' ? "bg-red-500/20 text-red-400" : "bg-amber-400/20 text-amber-400"
                                    )}>
                                        {alert.status === 'URGENT' ? 'URGENTE' : 'ATENÇÃO'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <AlertTriangle className="text-orange-500" size={20} />
                        </div>
                        Alertas de Motoristas (CNH)
                    </h3>

                    {drivers.filter(d => {
                        const diff = Math.ceil((new Date(d.cnhExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return diff < 30;
                    }).length === 0 ? (
                        <div className="bg-slate-800/30 backdrop-blur-sm p-8 rounded-2xl border border-dashed border-slate-700 text-center text-gray-500 h-full flex flex-col justify-center items-center">
                            <CheckCircle className="mb-2 text-emerald-500/50" size={40} />
                            <p>CNHs em dia</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {drivers.map(d => {
                                const diff = Math.ceil((new Date(d.cnhExpiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                if (diff >= 30) return null;

                                const isExpired = diff < 0;
                                return (
                                    <div key={d.id} className={clsx(
                                        "p-4 rounded-xl border-l-4 flex justify-between items-center",
                                        isExpired ? "bg-red-950/20 border-red-500" : "bg-yellow-950/20 border-yellow-500"
                                    )}>
                                        <div>
                                            <p className="font-bold text-white">{d.name}</p>
                                            <p className="text-xs text-gray-400">CNH: {d.cnhNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={clsx("font-bold text-xs", isExpired ? "text-red-400" : "text-yellow-400")}>
                                                {isExpired ? 'VENCIDA' : `Vence em ${diff} dias`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Recent Activity */}
            <section>
                <h3 className="text-xl font-bold text-white mb-6">Últimos Checklists (Clique para ver detalhes)</h3>
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold">Veículo</th>
                                <th className="p-5 font-semibold">Data</th>
                                <th className="p-5 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {checklists.slice(-5).reverse().map((checklist, i) => {
                                const vehicle = vehicles.find(v => v.id === checklist.vehicleId);
                                const hasProblems = checklist.items.some(k => k.status === 'PROBLEM');

                                return (
                                    <tr
                                        key={checklist.id}
                                        onClick={() => setSelectedChecklist(checklist)}
                                        className={clsx(
                                            "hover:bg-white/5 transition-colors cursor-pointer group",
                                            i % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'
                                        )}
                                    >
                                        <td className="p-5 font-bold text-white flex items-center gap-3">
                                            <div className={`w-1.5 h-12 rounded-full transition-colors ${hasProblems ? 'bg-red-500 group-hover:bg-red-400' : 'bg-emerald-500 group-hover:bg-emerald-400'}`}></div>
                                            <div className="flex flex-col">
                                                <span>{vehicle?.plate || 'Removido'}</span>
                                                <span className="text-xs font-normal text-gray-400">{vehicle?.type === 'CAVALO' ? vehicle.model : 'Carreta'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-400 font-mono text-sm">
                                            {new Date(checklist.date).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-5 text-right flex justify-end items-center gap-4">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
                                                hasProblems
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {hasProblems ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                                {hasProblems ? 'PROBLEMA' : 'APROVADO'}
                                            </span>
                                            <Eye size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                                        </td>
                                    </tr>
                                );
                            })}
                            {checklists.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-12 text-center text-gray-500">
                                        Nenhum checklist realizado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Details Modal */}
            {selectedChecklist && vehicles.find(v => v.id === selectedChecklist.vehicleId) && (
                <ChecklistDetails
                    checklist={selectedChecklist}
                    vehicle={vehicles.find(v => v.id === selectedChecklist.vehicleId)!}
                    onClose={() => setSelectedChecklist(null)}
                />
            )}
        </div>
    );
};

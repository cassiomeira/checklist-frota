import React from 'react';
import { X, CheckCircle, AlertTriangle, Calendar, Truck, User } from 'lucide-react';
import type { Checklist, Vehicle } from '../types';
import clsx from 'clsx';

interface ChecklistDetailsProps {
    checklist: Checklist;
    vehicle: Vehicle;
    onClose: () => void;
}

export const ChecklistDetails: React.FC<ChecklistDetailsProps> = ({ checklist, vehicle, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-industrial-accent text-slate-900 rounded-lg">
                                <Truck size={24} />
                            </span>
                            Relatório de Inspeção
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(checklist.date).toLocaleString('pt-BR')}</span>
                            <span className="flex items-center gap-1"><User size={14} /> Motorista (Simulado)</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {/* Vehicle Info Card */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Veículo</p>
                            <p className="text-xl font-bold text-white">{vehicle.plate}</p>
                            <p className="text-sm text-gray-400">{vehicle.type === 'CAVALO' ? vehicle.model : `Carreta (${vehicle.axles} eixos)`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Geral</p>
                            {checklist.items.some(i => i.status === 'PROBLEM') ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/30">
                                    <AlertTriangle size={16} /> COM AVARIAS
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/30">
                                    <CheckCircle size={16} /> APROVADO
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Detailed Items List */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Itens Inspecionados</h3>
                        <div className="grid gap-2">
                            {checklist.items.map((item, idx) => (
                                <div key={idx} className={clsx(
                                    "p-3 rounded-lg border flex justify-between items-start",
                                    item.status === 'PROBLEM' ? "bg-red-950/20 border-red-500/30" : "bg-slate-800/50 border-slate-700"
                                )}>
                                    <div>
                                        <p className="font-medium text-gray-200">{item.label}</p>
                                        {item.status === 'PROBLEM' && item.comment && (
                                            <div className="mt-2 p-2 bg-black/30 rounded border border-red-500/20">
                                                <p className="text-sm text-red-200"><span className="font-bold text-red-400 text-xs uppercase mr-1">Obs:</span> {item.comment}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        {item.status === 'PROBLEM' ? (
                                            <span className="text-red-400 font-bold text-xs flex items-center gap-1 uppercase bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                                <AlertTriangle size={12} /> Problema
                                            </span>
                                        ) : (
                                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 uppercase">
                                                <CheckCircle size={14} /> OK
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800 text-center text-xs text-gray-500">
                    Relatório gerado automaticamente pelo Scania Fleet Manager
                </div>
            </div>
        </div>
    );
};

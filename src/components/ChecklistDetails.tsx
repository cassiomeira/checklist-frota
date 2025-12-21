import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Calendar, Truck, User, Wrench, Clock } from 'lucide-react';
import type { Checklist, Vehicle } from '../types';
import clsx from 'clsx';
import { useFleet } from '../store/FleetContext';
import { CorrectiveActionForm } from './CorrectiveActionForm';

interface ChecklistDetailsProps {
    checklist: Checklist;
    vehicle: Vehicle;
    onClose: () => void;
}

export const ChecklistDetails: React.FC<ChecklistDetailsProps> = ({ checklist, vehicle, onClose }) => {
    const { getCorrectiveActionsByChecklist, verifyCorrectiveAction } = useFleet();
    const [showCorrectiveForm, setShowCorrectiveForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: string; label: string } | null>(null);

    const correctiveActions = getCorrectiveActionsByChecklist(checklist.id);

    const handleRegisterCorrection = (itemId: string, itemLabel: string) => {
        setSelectedItem({ id: itemId, label: itemLabel });
        setShowCorrectiveForm(true);
    };

    const handleVerify = async (actionId: string) => {
        const verifier = prompt('Nome do verificador:');
        if (verifier) {
            await verifyCorrectiveAction(actionId, verifier);
            alert('Correção verificada com sucesso!');
        }
    };
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
                            {checklist.items.map((item, idx) => {
                                const itemActions = correctiveActions.filter(ca => ca.itemId === item.id);
                                return (
                                    <div key={idx} className={clsx(
                                        "p-3 rounded-lg border",
                                        item.status === 'PROBLEM' ? "bg-red-950/20 border-red-500/30" : "bg-slate-800/50 border-slate-700"
                                    )}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-200">
                                                    {(item as any).name || item.label}
                                                </p>
                                                {item.status === 'PROBLEM' && item.comment && (
                                                    <div className="mt-2 p-2 bg-black/30 rounded border border-red-500/20">
                                                        <p className="text-sm text-red-200"><span className="font-bold text-red-400 text-xs uppercase mr-1">Obs:</span> {item.comment}</p>
                                                    </div>
                                                )}

                                                {/* Exibir Foto se existir (Base64 ou URL) */}
                                                {((item as any).photo || item.photoUrl) && (
                                                    <div className="mt-3">
                                                        <details className="group">
                                                            <summary className="text-xs text-industrial-accent cursor-pointer hover:underline font-bold mb-2 list-none flex items-center gap-1">
                                                                📷 Ver Foto do Item
                                                            </summary>
                                                            <img
                                                                src={(item as any).photo || item.photoUrl}
                                                                className="w-full max-w-sm rounded-lg border border-slate-600 shadow-lg"
                                                                alt="Evidência"
                                                            />
                                                        </details>
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

                                        {/* Corrective Actions Timeline */}
                                        {item.status === 'PROBLEM' && (
                                            <div className="mt-4 pt-4 border-t border-red-500/20">
                                                {itemActions.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {itemActions.map(action => (
                                                            <div key={action.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-industrial-accent/10 rounded-lg text-industrial-accent">
                                                                        <Wrench size={16} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-white font-bold text-sm">Correção Registrada</p>
                                                                        <p className="text-gray-400 text-xs">Por: {action.correctedBy}</p>
                                                                        <p className="text-gray-300 text-sm mt-2">{action.actionTaken}</p>
                                                                        <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                                                            <Clock size={12} /> {new Date(action.createdAt).toLocaleString('pt-BR')}
                                                                        </p>
                                                                        {action.verified ? (
                                                                            <div className="mt-2 p-2 bg-emerald-500/10 rounded border border-emerald-500/30">
                                                                                <p className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                                                                    <CheckCircle size={12} /> Verificado por: {action.verifiedBy}
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleVerify(action.id)}
                                                                                className="mt-2 text-xs bg-industrial-accent/20 hover:bg-industrial-accent hover:text-black text-industrial-accent font-bold px-3 py-1.5 rounded transition-colors"
                                                                            >
                                                                                Marcar como Verificado
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegisterCorrection(item.id, item.label)}
                                                        className="w-full bg-industrial-accent/10 hover:bg-industrial-accent/20 border border-industrial-accent/30 text-industrial-accent font-bold text-sm py-2 rounded-lg transition-all"
                                                    >
                                                        + Registrar Correção
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800 text-center text-xs text-gray-500">
                    Relatório gerado automaticamente pelo Scania Fleet Manager
                </div>
            </div>

            {showCorrectiveForm && selectedItem && (
                <CorrectiveActionForm
                    checklistId={checklist.id}
                    itemId={selectedItem.id}
                    itemLabel={selectedItem.label}
                    vehicleId={vehicle.id}
                    onClose={() => {
                        setShowCorrectiveForm(false);
                        setSelectedItem(null);
                    }}
                />
            )}
        </div>
    );
};

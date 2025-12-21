import React, { useState } from 'react';
import { X, Save, Camera, DollarSign, Calendar, Building2 } from 'lucide-react';
import { useFleet } from '../store/FleetContext';
import { useFinancial } from '../store/FinancialContext';

interface CorrectiveActionFormProps {
    checklistId: string;
    itemId: string;
    itemLabel: string;
    vehicleId: string;
    onClose: () => void;
}

export const CorrectiveActionForm: React.FC<CorrectiveActionFormProps> = ({
    checklistId,
    itemId,
    itemLabel,
    vehicleId,
    onClose
}) => {
    const { addCorrectiveAction } = useFleet();
    const { suppliers, addTransaction } = useFinancial();

    // Correction State
    const [correctedBy, setCorrectedBy] = useState('');
    const [actionTaken, setActionTaken] = useState('');

    // Financial State
    const [createExpense, setCreateExpense] = useState(false);
    const [cost, setCost] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!correctedBy || !actionTaken) {
            alert('Preencha todos os campos obrigatórios da correção.');
            return;
        }

        if (createExpense) {
            if (!cost || !supplierId || !paymentDate) {
                alert('Preencha os dados financeiros (Valor, Fornecedor e Data).');
                return;
            }
        }

        // 1. Register Action
        await addCorrectiveAction({
            checklistId,
            itemId,
            correctedBy,
            actionTaken,
            verified: false
        });

        // 2. Register Expense (if selected)
        if (createExpense) {
            const amount = parseFloat(cost.replace(',', '.'));

            await addTransaction({
                type: 'EXPENSE',
                description: `Manutenção: ${itemLabel} (${actionTaken})`,
                amount: amount,
                category: 'MAINTENANCE',
                status: 'PENDING', // Default to Pending, user can pay later usually
                dueDate: paymentDate,
                supplierId: supplierId,
                vehicleId: vehicleId
            });
            alert('Ação Corretiva e Despesa Financeira registradas com sucesso!');
        } else {
            alert('Ação corretiva registrada com sucesso!');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-white mb-2">Registrar Correção</h2>
                <p className="text-gray-400 mb-6">Item: <span className="text-white font-bold">{itemLabel}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Correction Section */}
                    <div className="space-y-4 border-b border-slate-700 pb-6">
                        <h3 className="text-industrial-accent font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <Camera size={16} /> Dados Operacionais
                        </h3>
                        <div>
                            <label className="block text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">
                                Responsável pela Correção *
                            </label>
                            <input
                                type="text"
                                value={correctedBy}
                                onChange={(e) => setCorrectedBy(e.target.value)}
                                placeholder="Nome do mecânico/responsável"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-industrial-accent focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">
                                Descrição da Ação Tomada *
                            </label>
                            <textarea
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                                placeholder="Descreva o que foi feito para corrigir o problema..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-industrial-accent focus:outline-none transition-all resize-none h-24"
                                required
                            />
                        </div>
                    </div>

                    {/* Financial Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <input
                                type="checkbox"
                                id="createExpense"
                                checked={createExpense}
                                onChange={(e) => setCreateExpense(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-slate-900 text-industrial-accent focus:ring-industrial-accent"
                            />
                            <label htmlFor="createExpense" className="text-white font-bold cursor-pointer select-none">
                                Gerar Despesa Financeira (Contas a Pagar)
                            </label>
                        </div>

                        {createExpense && (
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-400 font-bold mb-1 text-xs uppercase">Valor (R$)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 text-white focus:border-industrial-accent focus:outline-none"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-gray-400 font-bold mb-1 text-xs uppercase">Vencimento</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 text-white focus:border-industrial-accent focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-gray-400 font-bold mb-1 text-xs uppercase">Fornecedor / Oficina</label>
                                    <div className="relative">
                                        <Building2 size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                        <select
                                            value={supplierId}
                                            onChange={(e) => setSupplierId(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 text-white focus:border-industrial-accent focus:outline-none appearance-none"
                                        >
                                            <option value="">Selecione o Fornecedor...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.tradeName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-industrial-accent to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all"
                        >
                            <Save size={20} />
                            Salvar Tudo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

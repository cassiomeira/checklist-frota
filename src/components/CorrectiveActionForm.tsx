import React, { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';
import { useFleet } from '../store/FleetContext';

interface CorrectiveActionFormProps {
    checklistId: string;
    itemId: string;
    itemLabel: string;
    onClose: () => void;
}

export const CorrectiveActionForm: React.FC<CorrectiveActionFormProps> = ({
    checklistId,
    itemId,
    itemLabel,
    onClose
}) => {
    const { addCorrectiveAction } = useFleet();
    const [correctedBy, setCorrectedBy] = useState('');
    const [actionTaken, setActionTaken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!correctedBy || !actionTaken) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        await addCorrectiveAction({
            checklistId,
            itemId,
            correctedBy,
            actionTaken,
            verified: false
        });

        alert('Ação corretiva registrada com sucesso!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-white mb-2">Registrar Correção</h2>
                <p className="text-gray-400 mb-6">Item: <span className="text-white font-bold">{itemLabel}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-industrial-accent focus:outline-none transition-all resize-none h-32"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <Camera className="text-gray-400" size={24} />
                        <div className="flex-1">
                            <p className="text-white font-bold">Adicionar Foto (Opcional)</p>
                            <p className="text-gray-400 text-sm">Upload será implementado em breve</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
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
                            Registrar Correção
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

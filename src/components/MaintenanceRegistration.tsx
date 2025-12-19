import React, { useState } from 'react';
import { X, Save, Wrench } from 'lucide-react';
import { useFleet } from '../store/FleetContext';
import type { Truck } from '../types';

interface MaintenanceRegistrationProps {
    vehicle: Truck;
    maintenanceType: 'oil' | 'lubrication';
    onClose: () => void;
}

export const MaintenanceRegistration: React.FC<MaintenanceRegistrationProps> = ({
    vehicle,
    maintenanceType,
    onClose
}) => {
    const { updateVehicle } = useFleet();
    const [newKm, setNewKm] = useState(vehicle.currentKm.toString());
    const [nextOilKm, setNextOilKm] = useState((vehicle.currentKm + 30000).toString());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateVehicle(vehicle.id, {
            currentKm: Number(newKm),
            nextOilChangeKm: Number(nextOilKm)
        });

        alert('Manutenção registrada com sucesso!');
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

                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <div className="p-3 bg-industrial-accent/10 rounded-xl">
                        <Wrench className="text-industrial-accent" size={28} />
                    </div>
                    Registrar Manutenção
                </h2>
                <p className="text-gray-400 mb-6">
                    Veículo: <span className="text-white font-bold">{vehicle.plate}</span> - {vehicle.model}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">KM Atual (antes da manutenção)</p>
                        <p className="text-white font-bold text-2xl">{vehicle.currentKm.toLocaleString('pt-BR')} km</p>
                    </div>

                    <div>
                        <label className="block text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">
                            Novo KM (após manutenção) *
                        </label>
                        <input
                            type="number"
                            value={newKm}
                            onChange={(e) => setNewKm(e.target.value)}
                            placeholder="Ex: 150000"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-industrial-accent focus:outline-none transition-all"
                            required
                        />
                    </div>

                    {maintenanceType === 'oil' && (
                        <div>
                            <label className="block text-gray-400 font-bold mb-2 uppercase tracking-wider text-sm">
                                Próxima Troca de Óleo (KM) *
                            </label>
                            <input
                                type="number"
                                value={nextOilKm}
                                onChange={(e) => setNextOilKm(e.target.value)}
                                placeholder="Ex: 180000"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-industrial-accent focus:outline-none transition-all"
                                required
                            />
                            <p className="text-gray-500 text-xs mt-2">
                                Sugestão: {(Number(newKm) + 30000).toLocaleString('pt-BR')} km (30.000 km de intervalo)
                            </p>
                        </div>
                    )}

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
                            Confirmar Manutenção
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

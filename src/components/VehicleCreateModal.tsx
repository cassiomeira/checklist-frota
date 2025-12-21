
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useFleet } from '../store/FleetContext';
import { Truck, Save, X } from 'lucide-react';
import type { Truck as TruckType, Trailer as TrailerType } from '../types';

interface VehicleCreateModalProps {
    onClose: () => void;
}

export const VehicleCreateModal: React.FC<VehicleCreateModalProps> = ({ onClose }) => {
    const { addVehicle, drivers } = useFleet();
    const [type, setType] = useState<'CAVALO' | 'CARRETA'>('CAVALO');

    // Form State
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [km, setKm] = useState('');
    const [nextOil, setNextOil] = useState('');
    const [axles, setAxles] = useState('4');
    const [lastLubrication, setLastLubrication] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = crypto.randomUUID();

        if (type === 'CAVALO') {
            const newTruck: TruckType = {
                id,
                type: 'CAVALO',
                plate: plate.toUpperCase(),
                model,
                currentKm: Number(km),
                nextOilChangeKm: Number(nextOil),
                defaultDriverId: selectedDriver || undefined
            };
            addVehicle(newTruck);
        } else {
            const newTrailer: TrailerType = {
                id,
                type: 'CARRETA',
                plate: plate.toUpperCase(),
                axles: Number(axles),
                lastLubricationDate: lastLubrication,
                defaultDriverId: selectedDriver || undefined
            };
            addVehicle(newTrailer);
        }
        onClose();
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl my-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-industrial-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Truck className="text-industrial-accent" />
                        Cadastrar Veículo
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Type Selector */}
                    <div className="flex gap-4 mb-8 bg-black/20 p-1.5 rounded-xl border border-slate-700/50 w-fit">
                        <button
                            onClick={() => setType('CAVALO')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'CAVALO' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Scania R450 (Cavalo)
                        </button>
                        <button
                            onClick={() => setType('CARRETA')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'CARRETA' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Carreta 4 Eixos
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Placa</label>
                            <input
                                required
                                value={plate}
                                onChange={e => setPlate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-600"
                                placeholder="ABC-1234"
                            />
                        </div>

                        {type === 'CAVALO' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Modelo</label>
                                    <input
                                        required
                                        value={model}
                                        onChange={e => setModel(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="Ex: R450 Highline"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">KM Atual</label>
                                        <input
                                            required type="number"
                                            value={km}
                                            onChange={e => setKm(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Próxima Troca de Óleo (KM)</label>
                                        <input
                                            required type="number"
                                            value={nextOil}
                                            onChange={e => setNextOil(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Quantidade de Eixos</label>
                                    <input
                                        type="number"
                                        value={axles}
                                        onChange={e => setAxles(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Última Lubrificação</label>
                                    <input
                                        required type="date"
                                        value={lastLubrication}
                                        onChange={e => setLastLubrication(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all text-gray-400"
                                    />
                                </div>
                            </>
                        )}

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Motorista Padrão (Opcional)</label>
                            <select
                                value={selectedDriver}
                                onChange={e => setSelectedDriver(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                            >
                                <option value="">-- Sem motorista fixo --</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-1">
                            <Save size={20} />
                            Salvar Veículo
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

import React, { useState } from 'react';
import { Plus, Truck, Warehouse, Save, X, Eye } from 'lucide-react';
import { useFleet } from '../store/FleetContext';
import type { Truck as TruckType, Trailer as TrailerType, Vehicle } from '../types';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
import { VehicleEditForm } from '../components/VehicleEditForm';

export const VehiclesPage: React.FC = () => {
    const { vehicles, addVehicle, drivers } = useFleet();
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState<'CAVALO' | 'CARRETA'>('CAVALO');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

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

        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setPlate(''); setModel(''); setKm(''); setNextOil(''); setAxles('4'); setLastLubrication(''); setSelectedDriver('');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Frota</h2>
                    <p className="text-gray-400 text-lg">Gerenciamento de recursos</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    {isAdding ? 'Cancelar' : 'Novo Veículo'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl mb-12 border border-slate-700/50 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-industrial-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h3 className="text-2xl font-bold mb-6 text-white relative z-10">Cadastrar Veículo</h3>

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

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10 max-w-2xl">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Placa</label>
                            <input
                                required
                                value={plate}
                                onChange={e => setPlate(e.target.value)}
                                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-700"
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
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-700"
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
                                            className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Próxima Troca de Óleo (KM)</label>
                                        <input
                                            required type="number"
                                            value={nextOil}
                                            onChange={e => setNextOil(e.target.value)}
                                            className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
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
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Última Lubrificação</label>
                                    <input
                                        required type="date"
                                        value={lastLubrication}
                                        onChange={e => setLastLubrication(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all text-gray-400"
                                    />
                                </div>
                            </>
                        )}

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Motorista Padrão (Opcional)</label>
                            <select
                                value={selectedDriver}
                                onChange={e => setSelectedDriver(e.target.value)}
                                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all placeholder:text-gray-700"
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(v => (
                    <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="group bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-industrial-accent/30 transition-all shadow-lg cursor-pointer"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${v.type === 'CAVALO' ? 'bg-industrial-accent/10' : 'bg-purple-500/10'}`}>
                                {v.type === 'CAVALO' ? (
                                    <Truck className="text-industrial-accent" size={28} />
                                ) : (
                                    <Warehouse className="text-purple-400" size={28} />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-2xl text-white tracking-tight">
                                    {v.plate}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium">
                                    {v.type === 'CAVALO' ? 'Scania' : 'Carreta'}
                                </p>
                            </div>
                            <Eye className="text-gray-600 group-hover:text-industrial-accent transition-colors" size={20} />
                        </div>

                        <div className="space-y-3">
                            {v.type === 'CAVALO' ? (
                                <>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-700/50">
                                        <span className="text-gray-500">Modelo</span>
                                        <span className="text-gray-200 font-medium">{v.model}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-700/50">
                                        <span className="text-gray-500">KM Atual</span>
                                        <span className="text-gray-200 font-medium">{v.currentKm} km</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-700/50">
                                        <span className="text-gray-500">Prós. Troca</span>
                                        <span className="text-gray-200 font-medium">{v.nextOilChangeKm} km</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-700/50">
                                        <span className="text-gray-500">Eixos</span>
                                        <span className="text-gray-200 font-medium">{v.axles}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-700/50">
                                        <span className="text-gray-500">Lubrificação</span>
                                        <span className="text-gray-200 font-medium">{v.lastLubricationDate}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {vehicles.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-white/5">
                        <Truck className="mx-auto mb-4 text-gray-600" size={48} />
                        <p className="text-gray-500 font-medium">Nenhum veículo cadastrado na frota.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-4 text-industrial-accent hover:underline font-bold">Cadastrar primeiro veículo</button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedVehicle && (
                <VehicleDetailsModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    onEdit={() => {
                        setEditingVehicle(selectedVehicle);
                        setSelectedVehicle(null);
                    }}
                />
            )}

            {editingVehicle && (
                <VehicleEditForm
                    vehicle={editingVehicle}
                    onClose={() => setEditingVehicle(null)}
                />
            )}
        </div>
    );
};

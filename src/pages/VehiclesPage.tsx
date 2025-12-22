import React, { useState } from 'react';
import { Plus, Truck, Warehouse, Eye } from 'lucide-react';
import { useFleet } from '../store/FleetContext';
import type { Vehicle } from '../types';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
import { VehicleFormModal } from '../components/VehicleFormModal';

export const VehiclesPage: React.FC = () => {
    const { vehicles } = useFleet();

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false); // Controls the modal visibility
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); // For Details Modal
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null); // For Form Modal (if null, it's create mode)

    const handleOpenCreate = () => {
        setVehicleToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (vehicle: Vehicle) => {
        setVehicleToEdit(vehicle);
        setIsFormOpen(true);
        setSelectedVehicle(null); // Close details modal if open
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setVehicleToEdit(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Frota</h2>
                    <p className="text-gray-400 text-lg">Gerenciamento de recursos</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                >
                    <Plus size={20} />
                    Novo Veículo
                </button>
            </div>

            {/* Main Form Modal (Create or Edit) */}
            {isFormOpen && (
                <VehicleFormModal
                    onClose={handleCloseForm}
                    vehicle={vehicleToEdit}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(v => (
                    <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className="group bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-industrial-accent/30 transition-all shadow-lg cursor-pointer"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`relative w-32 h-32 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${v.type === 'CAVALO' ? 'bg-industrial-accent/10' : 'bg-purple-500/10'}`}>
                                {v.photos && v.photos.length > 0 ? (
                                    <img
                                        src={v.photos[0]}
                                        alt={v.plate}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    v.type === 'CAVALO' ? (
                                        <Truck className="text-industrial-accent" size={48} />
                                    ) : (
                                        <Warehouse className="text-purple-400" size={48} />
                                    )
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

                {vehicles.length === 0 && !isFormOpen && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-white/5">
                        <Truck className="mx-auto mb-4 text-gray-600" size={48} />
                        <p className="text-gray-500 font-medium">Nenhum veículo cadastrado na frota.</p>
                        <button onClick={handleOpenCreate} className="mt-4 text-industrial-accent hover:underline font-bold">Cadastrar primeiro veículo</button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedVehicle && (
                <VehicleDetailsModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    onEdit={() => handleOpenEdit(selectedVehicle)}
                />
            )}
        </div>
    );
};

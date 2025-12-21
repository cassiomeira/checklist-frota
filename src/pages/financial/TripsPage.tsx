import React, { useState, useMemo } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { useFleet } from '../../store/FleetContext';
import { TripForm } from '../../components/TripForm';

// ... (inside component)
{/* isModalOpen && (
                <TripForm onClose={handleCloseModal} trip={selectedTrip} />
            ) */}
import type { Trip } from '../../types';
import { Plus, Truck, Calendar, Search, Play, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export const TripsPage: React.FC = () => {
    const { trips } = useFinancial();
    const { vehicles } = useFleet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (trip?: Trip) => {
        setSelectedTrip(trip);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTrip(undefined);
    };

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => {
            if (!trip) return false;

            const matchesStatus = filterStatus === 'ALL' || trip.status === filterStatus;
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            const searchLower = (searchTerm || '').toLowerCase();

            const startLoc = trip.startLocation ? trip.startLocation.toLowerCase() : '';
            const endLoc = trip.endLocation ? trip.endLocation.toLowerCase() : '';
            const plate = vehicle?.plate ? vehicle.plate.toLowerCase() : '';

            const matchesSearch =
                startLoc.includes(searchLower) ||
                endLoc.includes(searchLower) ||
                plate.includes(searchLower);

            return matchesStatus && matchesSearch;
        });
    }, [trips, filterStatus, searchTerm, vehicles]);

    const getVehiclePlate = (id: string) => {
        return vehicles.find(v => v.id === id)?.plate || 'N/A';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Truck className="text-blue-500" />
                        Controle de Viagens
                    </h1>
                    <p className="text-gray-400">Gerencie as viagens, fretes e resultados da frota.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-500 hover:bg-blue-600 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Nova Viagem
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por origem, destino ou placa..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-white pl-10 p-2 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                            filterStatus === 'ALL' ? "bg-slate-700 text-white" : "text-gray-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilterStatus('IN_PROGRESS')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2",
                            filterStatus === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <Play size={14} /> Em Andamento
                    </button>
                    <button
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2",
                            filterStatus === 'COMPLETED' ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-gray-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <CheckCircle size={14} /> Finalizadas
                    </button>
                </div>
            </div>

            {/* Trip List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredTrips.map(trip => {
                    const profit = (trip.freightAmount || 0) - (trip.extraExpensesAmount || 0) - (trip.fuelAmount || 0) - (trip.commissionAmount || 0);
                    const isProfit = profit >= 0;

                    return (
                        <div key={trip.id} className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all group relative overflow-hidden">
                            {/* Status Stripe */}
                            <div className={clsx(
                                "absolute left-0 top-0 bottom-0 w-1",
                                trip.status === 'IN_PROGRESS' ? "bg-blue-500" : "bg-green-500"
                            )} />

                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pl-4">
                                {/* Route Info */}
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-1 rounded badge",
                                            trip.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                                        )}>
                                            {trip.status === 'IN_PROGRESS' ? 'EM ANDAMENTO' : 'FINALIZADA'}
                                        </span>
                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                            <Calendar size={12} />
                                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'data inválida'}
                                            {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-bold text-white max-w-xs truncate">{trip.startLocation || 'Origem não def.'}</div>
                                        <div className="h-px w-12 bg-slate-600 relative">
                                            <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-600 rotate-45"></div>
                                        </div>
                                        <div className="text-lg font-bold text-white max-w-xs truncate">{trip.endLocation || '...'}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                                            <Truck size={14} /> {getVehiclePlate(trip.vehicleId || '')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Km: {trip.startKm || '?'} → {trip.endKm || '?'}
                                        </span>
                                    </div>
                                </div>

                                {/* Financial Snapshot (Only if Completed or has data) */}
                                {(trip.status === 'COMPLETED' || (trip.freightAmount || 0) > 0) && (
                                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 min-w-[200px]">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2 border-b border-slate-700 pb-2">
                                            <span className="text-gray-400">Frete:</span>
                                            <span className="text-green-400 text-right font-mono">
                                                {(trip.freightAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <span className="text-gray-400">Despesas:</span>
                                            <span className="text-red-400 text-right font-mono">
                                                - {((trip.extraExpensesAmount || 0) + (trip.fuelAmount || 0) + (trip.commissionAmount || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Resultado</span>
                                            <span className={clsx("font-bold font-mono text-sm", isProfit ? "text-blue-400" : "text-red-400")}>
                                                {profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div>
                                    <button
                                        onClick={() => handleOpenModal(trip)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition-colors"
                                    >
                                        {trip.status === 'IN_PROGRESS' ? 'Finalizar' : 'Detalhes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredTrips.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Truck size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhuma viagem encontrada.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TripForm onClose={handleCloseModal} trip={selectedTrip} />
            )}
        </div>
    );
};

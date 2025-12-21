import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFinancial } from '../store/FinancialContext';
import { useFleet } from '../store/FleetContext';
import { X, Truck, MapPin, DollarSign, Gauge } from 'lucide-react';
import type { Trip } from '../types';
import clsx from 'clsx';

interface TripFormProps {
    onClose: () => void;
    trip?: Trip; // If provided, we are editing/finishing. If undefined, new trip.
}

export const TripForm: React.FC<TripFormProps> = ({ onClose, trip }) => {
    const { addTrip, updateTrip, addTransaction, customers, suppliers } = useFinancial();
    const { vehicles } = useFleet();

    const isFinishing = !!trip && trip.status === 'IN_PROGRESS';
    const isEditingCompleted = !!trip && trip.status === 'COMPLETED';

    // Form State
    const [vehicleId, setVehicleId] = useState(trip?.vehicleId || '');
    const [driverId, setDriverId] = useState(trip?.driverId || '');

    // Start Data
    const [startLocation, setStartLocation] = useState(trip?.startLocation || '');
    const [startDate, setStartDate] = useState(trip?.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [startKm, setStartKm] = useState(trip?.startKm?.toString() || '');

    // End Data
    const [endLocation, setEndLocation] = useState(trip?.endLocation || '');
    const [endDate, setEndDate] = useState(trip?.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [endKm, setEndKm] = useState(trip?.endKm?.toString() || '');

    // Financials
    const [freightAmount, setFreightAmount] = useState(trip?.freightAmount?.toString() || '');
    const [extraExpenses, setExtraExpenses] = useState(trip?.extraExpensesAmount?.toString() || '');
    const [fuelCost, setFuelCost] = useState(trip?.fuelAmount?.toString() || '');
    const [fuelLiters, setFuelLiters] = useState(trip?.fuelLitres?.toString() || '');
    const [fuelPrice, setFuelPrice] = useState(trip?.fuelPrice?.toString() || '');

    // Actions Toggles
    const [createIncome, setCreateIncome] = useState(false);
    const [createExpense, setCreateExpense] = useState(false);
    const [createCommission, setCreateCommission] = useState(false);

    // Financial Details
    const [customerId, setCustomerId] = useState(''); // For Freight Income
    const [supplierId, setSupplierId] = useState(''); // For Extra Expense

    // Pre-fill driver based on vehicle selection
    useEffect(() => {
        if (!trip && vehicleId) {
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle && vehicle.defaultDriverId) {
                setDriverId(vehicle.defaultDriverId);
            }
        }
    }, [vehicleId, vehicles, trip]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!startDate) {
            alert('Por favor, informe a data de início.');
            return;
        }

        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            alert('Data de início inválida.');
            return;
        }

        try {
            if (!trip) {
                // STARTING A NEW TRIP
                await addTrip({
                    vehicleId,
                    driverId: driverId || undefined,
                    startLocation,
                    startKm: Number(startKm),
                    startDate: start.toISOString(),
                    status: 'IN_PROGRESS',
                    freightAmount: 0,
                    extraExpensesAmount: 0,
                    fuelAmount: 0,
                    commissionAmount: 0
                });
            } else if (isFinishing || isEditingCompleted) {
                if (!endDate) {
                    alert('Por favor, informe a data de chegada.');
                    return;
                }
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    alert('Data de chegada inválida.');
                    return;
                }

                // FINISHING OR UPDATING TRIP
                const fAmount = Number(freightAmount) || 0;
                const eAmount = Number(extraExpenses) || 0;
                const costFuel = Number(fuelCost) || 0;
                const cAmount = createCommission ? (fAmount * 0.10) : 0; // 10% Commission hardcoded for now

                await updateTrip(trip.id, {
                    endLocation,
                    endDate: end.toISOString(),
                    endKm: Number(endKm),
                    freightAmount: fAmount,
                    extraExpensesAmount: eAmount,
                    fuelAmount: costFuel,
                    fuelLitres: Number(fuelLiters) || 0,
                    fuelPrice: Number(fuelPrice) || 0,
                    commissionAmount: cAmount,
                    status: 'COMPLETED'
                });

                // 1. Generate Income (Freight)
                if (createIncome) {
                    await addTransaction({
                        description: `Frete - ${startLocation} x ${endLocation}`,
                        amount: fAmount,
                        type: 'INCOME',
                        status: 'PENDING',
                        category: 'FREIGHT',
                        dueDate: endDate, // Due when trip ends?
                        vehicleId: trip.vehicleId,
                        driverId: trip.driverId,
                        customerId: customerId || undefined,
                        tripId: trip.id,
                        createdBy: 'TRIP_MODULE'
                    });
                }

                // 2. Generate Expense (Extras)
                if (createExpense && eAmount > 0) {
                    await addTransaction({
                        description: `Despesas Extras - Viagem ${startLocation}`,
                        amount: eAmount,
                        type: 'EXPENSE',
                        status: 'PENDING',
                        category: 'MAINTENANCE', // Or generic 'TRIP_EXPENSE'
                        dueDate: endDate,
                        vehicleId: trip.vehicleId,
                        driverId: trip.driverId,
                        supplierId: supplierId || undefined,
                        tripId: trip.id,
                        createdBy: 'TRIP_MODULE'
                    });
                }

                // 3. Generate Commission Expense
                if (createCommission && cAmount > 0) {
                    await addTransaction({
                        description: `Comissão Viagem - ${startLocation} x ${endLocation}`,
                        amount: cAmount,
                        type: 'EXPENSE', // It's an expense for the company
                        status: 'PENDING',
                        category: 'SALARY',
                        dueDate: endDate,
                        vehicleId: trip.vehicleId,
                        driverId: trip.driverId, // Pay to Driver
                        tripId: trip.id,
                        createdBy: 'TRIP_MODULE'
                    });
                }
            }
            onClose();
        } catch (error) {
            console.error('Error saving trip:', error);
            alert('Erro ao salvar viagem. Verifique se o banco de dados está atualizado.');
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl my-8">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Truck className="text-blue-500" />
                        {trip ? (isFinishing ? 'Finalizar Viagem' : 'Editar Viagem') : 'Nova Viagem'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* SECTION 1: START DATA (Always visible, but readonly if finishing) */}
                    <div className="space-y-4">
                        <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                            <MapPin size={16} /> Origem e Dados Iniciais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Veículo</label>
                                <select
                                    required
                                    disabled={!!trip}
                                    value={vehicleId}
                                    onChange={e => setVehicleId(e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg text-white p-2.5 disabled:opacity-50"
                                >
                                    <option value="">Selecione...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.plate} - {v.type === 'CAVALO' ? (v as any).model : 'Carreta'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Driver (Readonly if linked to vehicle, or selectable) */}
                            {/* Simplified for now, assuming linked or manual entry later */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Local de Origem</label>
                                <input
                                    required
                                    disabled={isFinishing}
                                    type="text"
                                    value={startLocation}
                                    onChange={e => setStartLocation(e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    placeholder="Ex: São Paulo, SP"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Data Início</label>
                                <input
                                    required
                                    disabled={isFinishing}
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg text-white p-2.5 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Km Inicial (Manual)</label>
                            <div className="relative">
                                <Gauge className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    required
                                    disabled={isFinishing}
                                    type="number"
                                    value={startKm}
                                    onChange={e => setStartKm(e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg text-white pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: END DATA (Visible only if Finishing or Editing Completed) */}
                    {(isFinishing || isEditingCompleted) && (
                        <>
                            <div className="h-px bg-slate-700/50 my-6" />

                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={16} /> Destino e Fechamento
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Local de Destino</label>
                                        <input
                                            required
                                            type="text"
                                            value={endLocation}
                                            onChange={e => setEndLocation(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-green-500"
                                            placeholder="Ex: Curitiba, PR"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Data Chegada</label>
                                        <input
                                            required
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-700 rounded-lg text-white p-2.5"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Km Final (Manual)</label>
                                    <div className="relative">
                                        <Gauge className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            required
                                            type="number"
                                            value={endKm}
                                            onChange={e => setEndKm(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-700 rounded-lg text-white pl-10 p-2.5 focus:ring-2 focus:ring-green-500"
                                            placeholder={startKm ? `Maior que ${startKm}` : '0'}
                                        />
                                    </div>
                                    {Number(endKm) > Number(startKm) && (
                                        <p className="text-xs text-blue-400 mt-1">
                                            Distância Percorrida: <span className="font-bold">{Number(endKm) - Number(startKm)} km</span>
                                        </p>
                                    )}
                                </div>

                                {/* FINANCIAL SECTION */}
                                <div className="bg-slate-800/50 p-4 rounded-xl space-y-4 border border-slate-700/50 mt-4">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <DollarSign size={16} className="text-yellow-400" />
                                        Financeiro da Viagem
                                    </h4>

                                    {/* Frete / Receita */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Valor do Frete (R$)</label>
                                            <input
                                                type="number"
                                                value={freightAmount}
                                                onChange={e => setFreightAmount(e.target.value)}
                                                className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-yellow-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pb-3">
                                            <input
                                                type="checkbox"
                                                id="createIncome"
                                                checked={createIncome}
                                                onChange={e => setCreateIncome(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <label htmlFor="createIncome" className="text-sm text-gray-300">
                                                Lançar conta a receber?
                                            </label>
                                        </div>
                                    </div>
                                    {createIncome && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Cliente (Pagador)</label>
                                            <select
                                                required={createIncome}
                                                value={customerId}
                                                onChange={e => setCustomerId(e.target.value)}
                                                className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5"
                                            >
                                                <option value="">Selecione o Cliente...</option>
                                                {customers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.tradeName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Expenses / Gastos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-2 border-t border-dashed border-slate-700">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Gastos Extras (R$)</label>
                                            <input
                                                type="number"
                                                value={extraExpenses}
                                                onChange={e => setExtraExpenses(e.target.value)}
                                                className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-red-500"
                                                placeholder="Pedágio, Chapa, etc"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pb-3">
                                            <input
                                                type="checkbox"
                                                id="createExpense"
                                                checked={createExpense}
                                                onChange={e => setCreateExpense(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                                            />
                                            <label htmlFor="createExpense" className="text-sm text-gray-300">
                                                Lançar conta a pagar?
                                            </label>
                                        </div>
                                    </div>
                                    {createExpense && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Fornecedor (Recebedor)</label>
                                            <select
                                                required={createExpense}
                                                value={supplierId}
                                                onChange={e => setSupplierId(e.target.value)}
                                                className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5"
                                            >
                                                <option value="">Selecione o Fornecedor...</option>
                                                {suppliers.map(s => (
                                                    <option key={s.id} value={s.id}>{s.tradeName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Cost Combustivel (Manual for now) */}
                                    {/* Cost Combustivel (Auto-Calc) */}
                                    <div className="pt-2 border-t border-dashed border-slate-700 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Litros Abastecidos</label>
                                                <input
                                                    type="number"
                                                    value={fuelLiters}
                                                    onChange={e => {
                                                        const l = e.target.value;
                                                        setFuelLiters(l);
                                                        // Auto Calc Total
                                                        if (l && fuelPrice) {
                                                            setFuelCost((Number(l) * Number(fuelPrice)).toFixed(2));
                                                        }
                                                    }}
                                                    className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-orange-500"
                                                    placeholder="0.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Preço / Litro (R$)</label>
                                                <input
                                                    type="number"
                                                    value={fuelPrice}
                                                    onChange={e => {
                                                        const p = e.target.value;
                                                        setFuelPrice(p);
                                                        // Auto Calc Total
                                                        if (fuelLiters && p) {
                                                            setFuelCost((Number(fuelLiters) * Number(p)).toFixed(2));
                                                        }
                                                    }}
                                                    className="w-full bg-slate-900 border-slate-700 rounded-lg text-white p-2.5 focus:ring-2 focus:ring-orange-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">Custo Total (Calc)</label>
                                                <input
                                                    type="number"
                                                    value={fuelCost}
                                                    onChange={e => setFuelCost(e.target.value)} // Allow manual override if needed
                                                    className="w-full bg-slate-800 border-slate-700 rounded-lg text-orange-400 font-bold p-2.5"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Consumption Display */}
                                        {Number(endKm) > Number(startKm) && (Number(fuelLiters) > 0) && (
                                            <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded text-center">
                                                <p className="text-sm text-orange-400">
                                                    Média de Consumo: <span className="font-bold text-lg">{((Number(endKm) - Number(startKm)) / Number(fuelLiters)).toFixed(2)} Km/L</span>
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pb-3">
                                            <input
                                                type="checkbox"
                                                id="createCommission"
                                                checked={createCommission}
                                                onChange={e => setCreateCommission(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            <label htmlFor="createCommission" className="text-sm text-gray-300">
                                                Gerar Comissão (10%)?
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={clsx(
                                "px-6 py-2 rounded-lg font-bold text-slate-900 transition-colors shadow-lg shadow-blue-500/20",
                                isFinishing ? "bg-green-500 hover:bg-green-400" : "bg-blue-500 hover:bg-blue-400"
                            )}
                        >
                            {trip ? (isFinishing ? 'Finalizar Viagem' : 'Salvar Alterações') : 'Iniciar Viagem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

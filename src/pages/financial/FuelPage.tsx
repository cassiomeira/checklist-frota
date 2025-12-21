import React, { useState, useEffect } from 'react';
import { useFinancial } from '../../store/FinancialContext';
import { useFleet } from '../../store/FleetContext';
import { Plus, DollarSign, Trash2, Edit2, Save, X } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export const FuelPage: React.FC = () => {
    const { fuelEntries, addFuelEntry, updateFuelEntry, deleteFuelEntry, accounts, suppliers } = useFinancial();
    const { vehicles } = useFleet();

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [vehicleId, setVehicleId] = useState('');
    const [driverId, setDriverId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [liters, setLiters] = useState('');
    const [pricePerLiter, setPricePerLiter] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [mileage, setMileage] = useState('');
    const [fullTank, setFullTank] = useState(true);
    const [accountId, setAccountId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    // Auto-calculate total cost
    useEffect(() => {
        const l = parseFloat(liters) || 0;
        const p = parseFloat(pricePerLiter) || 0;
        setTotalCost(l * p);
    }, [liters, pricePerLiter]);

    const handleEdit = (entry: any) => {
        setIsEditing(true);
        setIsAdding(false);
        setEditingId(entry.id);
        setVehicleId(entry.vehicleId);
        setDriverId(entry.driverId || '');
        setSupplierId(entry.supplierId || '');
        setDate(new Date(entry.date).toISOString().split('T')[0]);
        setLiters(entry.liters.toString());
        setPricePerLiter(entry.pricePerLiter.toString());
        setTotalCost(entry.totalCost);
        setMileage(entry.mileage.toString());
        setFullTank(entry.fullTank);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setIsEditing(false);
        setEditingId(null);
        setVehicleId('');
        setDriverId('');
        setSupplierId('');
        setDate(new Date().toISOString().split('T')[0]);
        setLiters('');
        setPricePerLiter('');
        setTotalCost(0);
        setMileage('');
        setFullTank(true);
        setAccountId('');
        setPaymentMethod('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este abastecimento?')) {
            await deleteFuelEntry(id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const entryData = {
                vehicleId,
                driverId: driverId || undefined,
                supplierId: supplierId || undefined,
                date,
                liters: parseFloat(liters),
                pricePerLiter: parseFloat(pricePerLiter),
                totalCost,
                mileage: parseInt(mileage),
                fullTank,
                accountId: accountId || undefined,
                paymentMethod: paymentMethod || undefined
            };

            if (isEditing && editingId) {
                await updateFuelEntry(editingId, entryData);
            } else {
                await addFuelEntry(entryData);
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar abastecimento');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none">Controle de Combustível</h1>
                    <p className="text-gray-400 text-lg mt-2">Lançamento de abastecimentos e Arla 32</p>
                </div>
                {!isEditing && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-industrial-accent text-industrial-dark font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2">
                        <Plus size={20} /> Novo Lançamento
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form (Conditional) */}
                {(isAdding || isEditing) && (
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg sticky top-8 animate-fade-in-right">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                {isEditing ? <Edit2 className="text-blue-400" /> : <Plus className="text-industrial-accent" />}
                                {isEditing ? 'Editar Lançamento' : 'Novo Abastecimento'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Vehicle */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Veículo</label>
                                    <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                        <option value="">Selecione...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.plate} {(v as any).model ? `- ${(v as any).model}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data</label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>

                                {/* Mileage */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Odômetro (KM)</label>
                                    <input type="number" required value={mileage} onChange={e => setMileage(e.target.value)} placeholder="Ex: 50400"
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                </div>

                                {/* Liters & Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Litros</label>
                                        <input type="number" step="0.01" required value={liters} onChange={e => setLiters(e.target.value)}
                                            className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Preço / Litro</label>
                                        <input type="number" step="0.01" required value={pricePerLiter} onChange={e => setPricePerLiter(e.target.value)}
                                            className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none" />
                                    </div>
                                </div>

                                {/* Total Cost Display */}
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                                    <span className="text-gray-400 text-sm font-bold uppercase">Total Estimado</span>
                                    <span className="text-2xl font-mono text-white font-bold">R$ {totalCost.toFixed(2)}</span>
                                </div>

                                {/* Supplier */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Posto / Fornecedor</label>
                                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                        <option value="">Selecione (Opcional)</option>
                                        {suppliers.filter(s => s.category === 'FUEL').map(s => <option key={s.id} value={s.id}>{s.tradeName}</option>)}
                                    </select>
                                </div>

                                <hr className="border-slate-700" />

                                {/* Payment (Create Transaction) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Conta de Saída (Pagamento)</label>
                                    <select value={accountId} onChange={e => setAccountId(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none">
                                        <option value="">A Pagar (Pendente)</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">* Se selecionar conta, baixa automático.</p>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={handleCancel}
                                        className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                                        <X size={20} /> Cancelar
                                    </button>

                                    <button type="submit"
                                        className={clsx(
                                            "flex-1 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2",
                                            isEditing ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-industrial-accent hover:bg-yellow-400 text-industrial-dark"
                                        )}>
                                        {isEditing ? <Save size={20} /> : <Plus size={20} />}
                                        {isEditing ? 'Salvar' : 'Lançar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className={clsx("space-y-4", (isAdding || isEditing) ? "lg:col-span-2" : "lg:col-span-3")}>
                    {fuelEntries.map(entry => {
                        const vehicle = vehicles.find(v => v.id === entry.vehicleId);
                        return (
                            <div key={entry.id} className="bg-slate-800/40 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-lg">
                                        <DollarSign className="text-orange-400" size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white text-lg">{vehicle?.plate || 'Veículo Desconhecido'}</h3>
                                            <span className="text-xs bg-slate-700 text-gray-300 px-2 py-0.5 rounded uppercase">{format(new Date(entry.date), 'dd/MM/yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                            <span>Running: <strong className="text-gray-300">{entry.mileage} km</strong></span>
                                            <span>•</span>
                                            <span>{entry.liters.toFixed(1)} L</span>
                                            <span>•</span>
                                            <span className="text-emerald-400 font-bold">R$ {entry.totalCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Editar">
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Excluir">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {fuelEntries.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            Nenhum abastecimento registrado. Clique em "Novo Lançamento" para começar.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

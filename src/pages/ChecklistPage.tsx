import React, { useState } from 'react';
import { useFleet } from '../store/FleetContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertTriangle, Save, Camera, ClipboardList, Info, Truck, User } from 'lucide-react';
import type { ChecklistItem } from '../types';



export const ChecklistPage: React.FC = () => {
    const { vehicles, addChecklist, drivers } = useFleet();
    const [checklistType, setChecklistType] = useState<'MAINTENANCE' | 'LOADING' | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [itemsStatus, setItemsStatus] = useState<Record<string, 'OK' | 'PROBLEM'>>({});
    const [comments, setComments] = useState<Record<string, string>>({});

    // Dynamic Items State
    const [checklistItems, setChecklistItems] = useState<any[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    // Fetch items when type or vehicle changes
    React.useEffect(() => {
        if (!checklistType) return;

        const fetchItems = async () => {
            setLoadingItems(true);
            try {
                // Determine scope based on vehicle type
                // MAINTENANCE + CAVALO -> scope = TRUCK or ALL
                // MAINTENANCE + CARRETA -> scope = TRAILER or ALL
                // LOADING -> scope = ALL (usually)

                let vehicleScopeFilter: string[] = ['ALL'];
                if (checklistType === 'MAINTENANCE' && selectedVehicle) {
                    if (selectedVehicle.type === 'CAVALO') vehicleScopeFilter.push('TRUCK');
                    else vehicleScopeFilter.push('TRAILER');
                } else if (checklistType === 'LOADING') {

                }

                const { data, error } = await supabase
                    .from('checklist_definitions')
                    .select('*')
                    .eq('type', checklistType)
                    .eq('is_active', true)
                    .order('category', { ascending: true })
                    .order('name', { ascending: true });

                if (error) throw error;

                let filteredData = data || [];

                // Filter locally by scope
                if (checklistType === 'MAINTENANCE' && selectedVehicle) {
                    const isTruck = selectedVehicle.type === 'CAVALO';
                    filteredData = filteredData.filter(item => {
                        if (!item.vehicle_scope || item.vehicle_scope === 'ALL') return true;
                        if (isTruck && item.vehicle_scope === 'TRUCK') return true;
                        if (!isTruck && item.vehicle_scope === 'TRAILER') return true;
                        return false;
                    });
                }

                setChecklistItems(filteredData);
            } catch (err) {
                console.error("Error fetching checklist items", err);
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [checklistType, selectedVehicleId]);

    // Group items by category
    const groupedItems = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        checklistItems.forEach(item => {
            const cat = item.category || 'Geral';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ id: item.id, label: item.name }); // Map DB 'name' to UI 'label'
        });
        return Object.entries(groups).map(([section, items]) => ({ section, items }));
    }, [checklistItems]);

    const checklistSections = groupedItems;

    const handleStatusChange = (itemId: string, status: 'OK' | 'PROBLEM') => {
        setItemsStatus(prev => ({ ...prev, [itemId]: status }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle) return;

        // Flatten items for submission
        const allItems = checklistSections.flatMap(s => s.items);

        // Find driver name
        const driverName = drivers.find(d => d.id === selectedDriverId)?.name || 'Desconhecido';

        const finalItems: ChecklistItem[] = [
            ...allItems.map(item => ({
                id: item.id,
                label: item.label,
                status: itemsStatus[item.id] || 'OK',
                comment: comments[item.id]
            })),
            // Add Driver as a special item for record keeping without schema change
            { id: 'driver_info', label: `Motorista: ${driverName}`, status: 'OK' }
        ];

        addChecklist({
            id: crypto.randomUUID(),
            vehicleId: selectedVehicle.id,
            date: new Date().toISOString(),
            items: finalItems,
            status: 'COMPLETED',
            type: checklistType || 'MAINTENANCE'
        });

        // Reset
        setSelectedVehicleId('');
        setSelectedDriverId('');
        setItemsStatus({});
        setComments({});
        setChecklistType(null);
        alert('Checklist salvo com sucesso!');
    };

    const calculateProgress = () => {
        if (!selectedVehicle) return 0;
        const totalItems = checklistSections.reduce((acc, section) => acc + section.items.length, 0);
        const answeredItems = Object.keys(itemsStatus).length;
        if (totalItems === 0) return 0;
        return Math.round((answeredItems / totalItems) * 100);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Checklist Diário</h2>
                <p className="text-gray-400 text-lg">Inspeção completa de segurança e manutenção</p>
            </div>

            {!checklistType ? (
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-fade-in">
                    <button
                        onClick={() => setChecklistType('MAINTENANCE')}
                        className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800 hover:border-industrial-accent hover:scale-[1.02] transition-all group text-left"
                    >
                        <div className="p-4 bg-industrial-accent/10 rounded-2xl w-fit text-industrial-accent mb-6 group-hover:bg-industrial-accent group-hover:text-black transition-colors">
                            <Truck size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Manutenção</h3>
                        <p className="text-gray-400">Inspeção mecânica, pneus, óleo e itens de segurança do veículo.</p>
                    </button>

                    <button
                        onClick={() => setChecklistType('LOADING')}
                        className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500 hover:scale-[1.02] transition-all group text-left"
                    >
                        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <ClipboardList size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Carregamento</h3>
                        <p className="text-gray-400">Validação de documentos, limpeza de carga e itens de segurança da viagem.</p>
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => {
                            setChecklistType(null);
                            setSelectedVehicleId('');
                            setSelectedDriverId('');
                            setItemsStatus({});
                        }}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-wider"
                    >
                        <Truck className="rotate-180" size={16} /> Voltar para Seleção
                    </button>

                    {/* Driver Selection */}
                    <div className="mb-8 animate-fade-in">
                        <label className="block text-gray-400 font-bold mb-3 uppercase tracking-wider text-sm">Selecione o Motorista</label>
                        <div className="relative">
                            <select
                                value={selectedDriverId}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                                className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700 appearance-none focus:border-industrial-accent focus:outline-none text-lg"
                            >
                                <option value="">Quem está realizando o checklist?</option>
                                {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.name}
                                    </option>
                                ))}
                            </select>
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {!selectedVehicle ? (
                        <div className="bg-slate-800/60 backdrop-blur-xl p-12 rounded-3xl border border-slate-700/50 shadow-2xl text-center max-w-2xl mx-auto animate-fade-in">
                            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-industrial-accent/20 to-industrial-accent/5 text-industrial-accent mb-8 ring-1 ring-industrial-accent/30">
                                <Truck size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6">Selecione o veículo para iniciar</h3>
                            <div className="max-w-md mx-auto relative group">
                                <div className="absolute inset-0 bg-industrial-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <select
                                    value={selectedVehicleId}
                                    onChange={e => {
                                        const newVehicleId = e.target.value;
                                        setSelectedVehicleId(newVehicleId);
                                        setItemsStatus({});

                                        // Auto-select driver
                                        const vehicle = vehicles.find(v => v.id === newVehicleId);
                                        if (vehicle?.defaultDriverId) {
                                            setSelectedDriverId(vehicle.defaultDriverId);
                                        } else {
                                            setSelectedDriverId('');
                                        }
                                    }}
                                    className="relative w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent focus:outline-none transition-all text-lg font-medium cursor-pointer shadow-lg hover:border-slate-500"
                                >
                                    <option value="">-- Escolha um veículo --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.plate} - {v.type === 'CAVALO' ? v.model : `Carreta (${v.axles} Eixos)`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {vehicles.length === 0 && (
                                <div className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl inline-block">
                                    <p className="text-red-400 font-bold flex items-center gap-2">
                                        <AlertTriangle size={20} />
                                        Nenhum veículo cadastrado na frota.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">

                            {/* Progress Bar */}
                            <div className="sticky top-4 z-30 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl mb-8 flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        <span>Progresso da Inspeção</span>
                                        <span>{calculateProgress()}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-industrial-accent to-yellow-300 transition-all duration-500 ease-out"
                                            style={{ width: `${calculateProgress()}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedVehicleId('')}
                                    className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
                                >
                                    TROCAR VEÍCULO
                                </button>
                            </div>

                            <div className="space-y-8">
                                {checklistSections.map((section, sIndex) => (
                                    <div key={sIndex} className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
                                        <div className="bg-slate-800/80 p-6 border-b border-slate-700/50 flex items-center gap-3">
                                            <div className="p-2 bg-industrial-accent/10 rounded-lg text-industrial-accent">
                                                <ClipboardList size={24} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{section.section}</h3>
                                        </div>

                                        <div className="p-6 grid gap-4">
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`p-4 rounded-xl border transition-all duration-200 ${itemsStatus[item.id] === 'OK' ? 'bg-emerald-950/20 border-emerald-500/30' :
                                                        itemsStatus[item.id] === 'PROBLEM' ? 'bg-red-950/20 border-red-500/30' :
                                                            'bg-slate-900/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-900/60'
                                                        }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-1 text-gray-500">
                                                                <Info size={16} />
                                                            </div>
                                                            <label className="font-medium text-gray-200 text-lg">{item.label}</label>
                                                        </div>

                                                        <div className="flex gap-2 w-full md:w-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(item.id, 'OK')}
                                                                className={`flex-1 md:flex-none px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${itemsStatus[item.id] === 'OK'
                                                                    ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20 scale-105'
                                                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                                                                    }`}
                                                            >
                                                                <CheckCircle size={20} /> OK
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusChange(item.id, 'PROBLEM')}
                                                                className={`flex-1 md:flex-none px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${itemsStatus[item.id] === 'PROBLEM'
                                                                    ? 'bg-red-500 text-red-950 shadow-lg shadow-red-500/20 scale-105'
                                                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                                                                    }`}
                                                            >
                                                                <AlertTriangle size={20} /> Avaria
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {itemsStatus[item.id] === 'PROBLEM' && (
                                                        <div className="mt-4 pt-4 border-t border-red-500/20 animate-fade-in grid gap-3">
                                                            <div className="relative">
                                                                <textarea
                                                                    placeholder="Descreva o problema encontrado com detalhes..."
                                                                    value={comments[item.id] || ''}
                                                                    onChange={e => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all resize-none h-24"
                                                                />
                                                            </div>
                                                            <button type="button" className="w-fit px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-sm flex items-center gap-2 transition-colors">
                                                                <Camera size={18} />
                                                                Adicionar Foto
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-700/50">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-industrial-accent to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-black text-xl py-6 rounded-2xl flex justify-center items-center gap-3 shadow-xl shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                >
                                    <Save size={28} strokeWidth={2.5} />
                                    FINALIZAR CHECKLIST AGORA
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};

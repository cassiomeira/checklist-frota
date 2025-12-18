import React, { useState } from 'react';
import { useFleet } from '../store/FleetContext';
import { CheckCircle, AlertTriangle, Save, Camera, ClipboardList, Info, Truck, User } from 'lucide-react';
import type { ChecklistItem } from '../types';

const TRUCK_ITEMS = [
    {
        section: 'Documentação & Segurança', items: [
            { id: 'docs_crlv', label: 'Documentos (CRLV, CNH, Seguros)' },
            { id: 'fire_extinguisher', label: 'Extintor de Incêndio (Validade/Lacre)' },
            { id: 'triangle_tools', label: 'Triângulo, Macaco e Chave de Roda' },
            { id: 'epi', label: 'EPIs (Colete, Capacete, Botas)' },
        ]
    },
    {
        section: 'Cabine & Painel', items: [
            { id: 'dashboard_lights', label: 'Luzes do Painel (Avisos/Falhas)' },
            { id: 'fuel_level', label: 'Nível de Combustível' },
            { id: 'arla_level', label: 'Nível de Arla 32' },
            { id: 'tachograph', label: 'Cronotacógrafo (Funcionamento/Disco/Fita)' },
            { id: 'ac_wipers', label: 'Ar Condicionado e Limpadores' },
            { id: 'mirrors_cab', label: 'Retrovisores (Ajuste/Estado)' },
        ]
    },
    {
        section: 'Externa & Mecânica', items: [
            { id: 'lights_external', label: 'Iluminação (Faróis, Setas, Freio, Ré)' },
            { id: 'tires_truck', label: 'Pneus (Calibragem, Sulcos, Parafusos)' },
            { id: 'oil_engine', label: 'Nível de Óleo do Motor' },
            { id: 'coolant', label: 'Líquido de Arrefecimento' },
            { id: 'leaks', label: 'Vazamentos Visíveis (Água/Óleo/Ar)' },
            { id: 'airbags_suspension', label: 'Bolsas de Ar da Suspensão' },
            { id: 'fifth_wheel_lock', label: 'Quinta Roda (Travamento)' },
        ]
    }
];

const TRAILER_ITEMS = [
    {
        section: 'Estrutura & Segurança', items: [
            { id: 'trailer_docs', label: 'Documentação da Carreta' },
            { id: 'reflective_strips', label: 'Faixas Refletivas e Placas' },
            { id: 'bumper', label: 'Para-choque Traseiro' },
            { id: 'mudflaps', label: 'Aparabarros' },
        ]
    },
    {
        section: 'Pneus & Suspensão', items: [
            { id: 'tires_trailer', label: '13 Pneus (Estado/Pressão/Estepe)' },
            { id: 'suspension_trailer', label: 'Bolsas de Ar / Molas' },
            { id: 'brakes_trailer', label: 'Freios (Lonas/Tambores/Cuícas)' },
            { id: 'wheel_hubs', label: 'Cubos de Roda (Vazamentos)' },
        ]
    },
    {
        section: 'Conexões & Carga', items: [
            { id: 'hoses_cables', label: 'Mangueiras de Ar e Cabos Elétricos (ABS)' },
            { id: 'landing_gear', label: 'Pés de Apoio (Funcionamento)' },
            { id: 'floor_tarps', label: 'Assoalho, Lonas e Amarração de Carga' },
            { id: 'doors_locks', label: 'Portas Traseiras e Travas' },
        ]
    }
];

const LOADING_ITEMS = [
    {
        section: 'Documentação & Motorista', items: [
            { id: 'load_badge', label: 'Crachá de Identificação' },
            { id: 'load_cnh', label: 'CNH (Porte/Validade/Categoria)' },
            { id: 'load_ief', label: 'Registro do IEF (Validade)' },
            { id: 'load_laudo', label: 'Laudo de Descaracterização' },
            { id: 'load_crlv', label: 'CRLV do Ano Vigente' },
            { id: 'load_antt', label: 'Extrato da ANTT (Placa Cavalo/Carreta)' },
            { id: 'load_ibama', label: 'Cadastro Técnico Federal (IBAMA)' },
            { id: 'load_epis', label: 'EPIs (Capacete, Máscara, Colete, Botina, Óculos, Perneira)' },
        ]
    },
    {
        section: 'Segurança Veicular', items: [
            { id: 'load_seatbelt', label: 'Cinto de Segurança' },
            { id: 'load_tires', label: 'Pneus / Estepe (Estado/Avarias)' },
            { id: 'load_lights', label: 'Faróis / Lanternas / Sinal Sonoro Ré' },
            { id: 'load_extinguisher', label: 'Kit Emergência (Extintor, Cones, Ferramentas)' },
        ]
    },
    {
        section: 'Compartimento de Carga', items: [
            { id: 'load_tarp_condition', label: 'Lona de Cobertura (Sem furos/Estado)' },
            { id: 'load_tarp_lock', label: 'Cabo Travamento Lona / Suporte Lacre' },
            { id: 'load_structure', label: 'Estrutura da Carreta (Assoalho/Arcos sem danos)' },
            { id: 'load_cleanliness', label: 'Limpeza (Materiais estranhos/Resto de carvão)' },
            { id: 'load_fines', label: 'Finos em Excesso' },
            { id: 'load_humidity', label: 'Água / Umidade' },
            { id: 'load_rubber', label: 'Borrachões / Calhas Metálicas' },
            { id: 'load_straps', label: 'Cintas (Estado das 3 cintas)' },
            { id: 'load_ropes', label: 'Cordas para Fixar Lona (Dianteira/Traseira)' },
        ]
    }
];

export const ChecklistPage: React.FC = () => {
    const { vehicles, addChecklist, drivers } = useFleet();
    const [checklistType, setChecklistType] = useState<'MAINTENANCE' | 'LOADING' | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [itemsStatus, setItemsStatus] = useState<Record<string, 'OK' | 'PROBLEM'>>({});
    const [comments, setComments] = useState<Record<string, string>>({});

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    let checklistSections: { section: string; items: { id: string; label: string; }[] }[] = [];
    if (checklistType === 'LOADING') {
        checklistSections = LOADING_ITEMS;
    } else if (checklistType === 'MAINTENANCE' && selectedVehicle) {
        checklistSections = selectedVehicle.type === 'CAVALO' ? TRUCK_ITEMS : TRAILER_ITEMS;
    }

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

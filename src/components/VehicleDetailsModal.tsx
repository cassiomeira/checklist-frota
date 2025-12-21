import React, { useState, useEffect } from 'react';

import { X, FileText, Image as ImageIcon, Truck as TruckIcon, AlertTriangle, Plus, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import type { Vehicle, MaintenanceTask } from '../types';
import { supabase } from '../lib/supabase';
import { useFinancial } from '../store/FinancialContext';

interface VehicleDetailsModalProps {
    vehicle: Vehicle;
    onClose: () => void;
    onEdit: () => void;
    initialTab?: 'DETAILS' | 'ALERTS';
    onUpdate?: () => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose, onEdit, initialTab = 'DETAILS', onUpdate }) => {
    const { addTransaction } = useFinancial();
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'ALERTS'>(initialTab);
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

    // New Task State
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [newTaskCost, setNewTaskCost] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('maintenance_alerts')
            .select('*')
            .eq('vehicle_id', vehicle.id)
            .order('status', { ascending: false }) // PENDING first
            .order('priority', { ascending: false }) // HIGH first
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTasks(data as MaintenanceTask[]);
        }
    };

    useEffect(() => {
        if (activeTab === 'ALERTS') {
            fetchTasks();
        }
    }, [activeTab, vehicle.id]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('maintenance_alerts').insert({
                vehicle_id: vehicle.id,
                description: newTaskDesc,
                priority: newTaskPriority,
                cost: newTaskCost ? Number(newTaskCost) : 0,
                due_date: newTaskDate || null,
                status: 'PENDING',
                created_by: user?.id
            });

            if (error) throw error;

            setNewTaskDesc('');
            setNewTaskCost('');
            setNewTaskDate('');
            fetchTasks();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar alerta.');
        }
    };

    const handleCompleteTask = async (task: MaintenanceTask) => {
        const confirmComplete = confirm('Deseja marcar esta manutenção como CONCLUÍDA?');
        if (!confirmComplete) return;

        let transactionId = null;

        // Ask to create transaction if cost > 0
        if (task.cost && task.cost > 0) {
            const createTx = confirm(`Este alerta tem um custo de R$ ${task.cost}. Deseja lançar uma DESPESA no financeiro agora?`);
            if (createTx) {
                try {
                    const tx = await addTransaction({
                        description: `Manutenção: ${task.description}`,
                        amount: task.cost,
                        type: 'EXPENSE',
                        status: 'PENDING',
                        category: 'MAINTENANCE',
                        vehicleId: vehicle.id,
                        dueDate: new Date().toISOString().split('T')[0]
                    });
                    if (tx) transactionId = tx.id;
                    alert('Despesa lançada no financeiro!');
                } catch (e) {
                    console.error(e);
                    alert('Erro ao lançar despesa, mas vamos concluir a tarefa.');
                }
            }
        }

        // Update Task
        const { error } = await supabase
            .from('maintenance_alerts')
            .update({ status: 'DONE', transaction_id: transactionId })
            .eq('id', task.id);

        if (!error) {
            fetchTasks();
            if (onUpdate) onUpdate();
        }
    };

    const handleViewDocument = () => {
        if (vehicle.documentUrl) {
            const link = document.createElement('a');
            link.href = vehicle.documentUrl;
            link.download = `documento_${vehicle.plate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 p-2 overflow-auto backdrop-blur-sm">
            <div className="min-h-screen flex items-center justify-center py-4">
                <div className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-xl">
                                <TruckIcon className="text-industrial-accent" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white flex gap-2 items-center">
                                    {vehicle.plate}
                                    <span className="text-sm font-normal text-gray-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                        {vehicle.type === 'CAVALO' ? 'Cavalo' : 'Carreta'}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-400">
                                    {vehicle.type === 'CAVALO' ? `${vehicle.model}` : `Carreta ${vehicle.axles} eixos`}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-800 bg-slate-900/50">
                        <button
                            onClick={() => setActiveTab('DETAILS')}
                            className={`flex-1 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'DETAILS' ? 'border-industrial-accent text-industrial-accent bg-industrial-accent/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            Detalhes & Documentos
                        </button>
                        <button
                            onClick={() => setActiveTab('ALERTS')}
                            className={`flex-1 py-4 font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'ALERTS' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <AlertTriangle size={16} />
                            Alertas de Manutenção
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 min-h-[400px]">
                        {activeTab === 'DETAILS' ? (
                            <div className="space-y-6 animate-fade-in">
                                {/* Stats */}
                                {vehicle.type === 'CAVALO' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                            <p className="text-xs text-gray-400 mb-1 uppercase font-bold">KM Atual</p>
                                            <p className="text-2xl font-mono font-bold text-white">{vehicle.currentKm.toLocaleString('pt-BR')} km</p>
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                            <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Próxima Troca de Óleo</p>
                                            <p className="text-2xl font-mono font-bold text-blue-400">{vehicle.nextOilChangeKm.toLocaleString('pt-BR')} km</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Document */}
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-blue-400" />
                                            Documentação
                                        </h3>
                                        {vehicle.documentUrl ? (
                                            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/20 rounded text-blue-400">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">Documento do Veículo</p>
                                                        <p className="text-xs text-gray-500">PDF disponível</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleViewDocument}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                                >
                                                    Baixar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-slate-700 rounded-lg">
                                                Nenhum documento anexado
                                            </div>
                                        )}
                                    </div>

                                    {/* Photos */}
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <ImageIcon size={20} className="text-purple-400" />
                                            Galeria de Fotos
                                        </h3>
                                        {vehicle.photos && vehicle.photos.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                                                {vehicle.photos.map((photo, i) => (
                                                    <img
                                                        key={i}
                                                        src={photo}
                                                        alt={`Foto ${i + 1}`}
                                                        className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-slate-700"
                                                        onClick={() => window.open(photo, '_blank')}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-slate-700 rounded-lg">
                                                Nenhuma foto cadastrada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col md:flex-row gap-8">
                                {/* Left: Task List */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-bold text-lg">Pendências</h3>
                                        <span className="text-xs bg-slate-800 text-gray-400 px-2 py-1 rounded-full border border-slate-700">
                                            {tasks.filter(t => t.status === 'PENDING').length} tarefas
                                        </span>
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {tasks.length === 0 && (
                                            <p className="text-gray-500 text-center py-10 italic">Nenhuma tarefa registrada.</p>
                                        )}
                                        {tasks.map(task => (
                                            <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.status === 'DONE' ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {task.status === 'DONE' && <CheckCircle2 size={16} className="text-green-500" />}
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                                task.priority === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {task.priority === 'HIGH' ? 'ALTA' : task.priority === 'MEDIUM' ? 'MÉDIA' : 'BAIXA'}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={`font-medium ${task.status === 'DONE' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                            {task.description}
                                                        </p>
                                                        {task.cost && task.cost > 0 && (
                                                            <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                                                                <DollarSign size={12} />
                                                                R$ {task.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {task.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCompleteTask(task)}
                                                            className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors group"
                                                            title="Concluir"
                                                        >
                                                            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Add Form */}
                                <div className="w-full md:w-80 bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-fit sticky top-0">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Plus size={20} className="text-yellow-500" />
                                        Nova Tarefa
                                    </h3>
                                    <form onSubmit={handleAddTask} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">O que precisa fazer?</label>
                                            <textarea
                                                required
                                                value={newTaskDesc}
                                                onChange={e => setNewTaskDesc(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none min-h-[80px]"
                                                placeholder="Ex: Trocar filtro de ar..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Prioridade</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                                    <button
                                                        type="button"
                                                        key={p}
                                                        onClick={() => setNewTaskPriority(p)}
                                                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${newTaskPriority === p
                                                            ? (p === 'HIGH' ? 'bg-red-500 border-red-500 text-white' : p === 'MEDIUM' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-blue-500 border-blue-500 text-white')
                                                            : 'bg-slate-900 border-slate-600 text-gray-400 hover:border-gray-500'
                                                            }`}
                                                    >
                                                        {p === 'HIGH' ? 'ALTA' : p === 'MEDIUM' ? 'MÉDIA' : 'BAIXA'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Custo Estimado (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newTaskCost}
                                                onChange={e => setNewTaskCost(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Data Limite (Opcional)</label>
                                            <input
                                                type="date"
                                                value={newTaskDate}
                                                onChange={e => setNewTaskDate(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Adicionar
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {activeTab === 'DETAILS' && (
                        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                            <button
                                onClick={onEdit}
                                className="w-full bg-industrial-accent text-slate-900 font-bold py-3 rounded-lg hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all"
                            >
                                Editar Informações do Veículo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

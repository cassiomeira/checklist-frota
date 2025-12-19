import React, { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { clsx } from 'clsx';

interface ChecklistDefinition {
    id: string;
    name: string;
    type: 'MAINTENANCE' | 'LOADING';
    category?: string;
    vehicle_scope?: 'ALL' | 'TRUCK' | 'TRAILER';
    is_active: boolean;
}

export function ChecklistSettings() {
    const [items, setItems] = useState<ChecklistDefinition[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newItemName, setNewItemName] = useState('');
    const [newItemType, setNewItemType] = useState<'MAINTENANCE' | 'LOADING'>('MAINTENANCE');
    const [newItemCategory, setNewItemCategory] = useState('');
    const [newItemScope, setNewItemScope] = useState<'ALL' | 'TRUCK' | 'TRAILER'>('ALL');

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('checklist_definitions')
                .select('*')
                .order('category', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            alert('Erro ao carregar itens');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        if (!newItemName.trim() || !newItemCategory.trim()) {
            alert('Preencha nome e categoria');
            return;
        }

        try {
            const { error } = await supabase
                .from('checklist_definitions')
                .insert([{
                    name: newItemName,
                    type: newItemType,
                    category: newItemCategory,
                    vehicle_scope: newItemScope,
                    is_active: true
                }]);

            if (error) throw error;

            setNewItemName('');
            setNewItemCategory('');
            loadItems();
        } catch (error) {
            console.error('Erro ao adicionar:', error);
            alert('Erro ao adicionar item');
        }
    }

    async function handleDeleteItem(id: string) {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        try {
            const { error } = await supabase
                .from('checklist_definitions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadItems();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir item');
        }
    }

    async function toggleActive(id: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('checklist_definitions')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            loadItems();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
        }
    }

    const maintenanceItems = items.filter(i => i.type === 'MAINTENANCE');
    const loadingItems = items.filter(i => i.type === 'LOADING');

    const categories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Configuração do Checklist</h1>
                    <p className="text-gray-400 mt-2">Personalize os itens, categorias e regras de exibição (Cavalo/Carreta)</p>
                </div>
            </div>

            {/* Formulário de Adição */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-industrial-accent" />
                    Novo Item
                </h2>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Nome */}
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Item</label>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-industrial-accent"
                            placeholder="Ex: Freios, Pneus..."
                        />
                    </div>

                    {/* Categoria */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                        <input
                            type="text"
                            list="categories-list"
                            value={newItemCategory}
                            onChange={e => setNewItemCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-industrial-accent"
                            placeholder="Ex: Mecânica, Segurança..."
                        />
                        <datalist id="categories-list">
                            {categories.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    {/* Tipo Checklist */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tipo Checklist</label>
                        <select
                            value={newItemType}
                            onChange={e => setNewItemType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-industrial-accent"
                        >
                            <option value="MAINTENANCE">Manutenção</option>
                            <option value="LOADING">Carga</option>
                        </select>
                    </div>

                    {/* Escopo Veículo */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Veículo</label>
                        <select
                            value={newItemScope}
                            onChange={e => setNewItemScope(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-industrial-accent"
                        >
                            <option value="ALL">Todos</option>
                            <option value="TRUCK">Apenas Cavalo</option>
                            <option value="TRAILER">Apenas Carreta</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <button
                            type="submit"
                            className="w-full bg-industrial-accent hover:bg-amber-600 text-slate-900 font-bold p-3 rounded-lg transition-colors flex justify-center items-center"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Listas */}
            <div className="grid grid-cols-1 gap-6">
                {[
                    { title: 'Itens de Manutenção', color: 'bg-blue-500', list: maintenanceItems },
                    { title: 'Itens de Carga', color: 'bg-purple-500', list: loadingItems }
                ].map((section, idx) => (
                    <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                            <div className={`w-2 h-8 ${section.color} rounded-full`}></div>
                            {section.title}
                        </h3>
                        <div className="space-y-2">
                            {section.list.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Nenhum item cadastrado</p>
                            ) : (
                                section.list.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/50 group hover:border-slate-500 transition-colors">
                                        <div className="flex flex-col">
                                            <span className={clsx("font-medium text-lg", !item.is_active && "text-gray-500 line-through")}>
                                                {item.name}
                                            </span>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-slate-800 text-gray-300 px-2 py-1 rounded border border-slate-700">
                                                    {item.category || 'Geral'}
                                                </span>
                                                {item.vehicle_scope !== 'ALL' && (
                                                    <span className={clsx(
                                                        "text-xs px-2 py-1 rounded border font-bold",
                                                        item.vehicle_scope === 'TRUCK' ? "bg-blue-900/30 text-blue-400 border-blue-900" :
                                                            "bg-purple-900/30 text-purple-400 border-purple-900"
                                                    )}>
                                                        {item.vehicle_scope === 'TRUCK' ? 'CAVALO' : 'CARRETA'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => toggleActive(item.id, item.is_active)}
                                                className={clsx(
                                                    "p-2 rounded hover:bg-slate-700 transition-colors",
                                                    item.is_active ? "text-emerald-500" : "text-gray-500"
                                                )}
                                                title={item.is_active ? "Desativar" : "Ativar"}
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

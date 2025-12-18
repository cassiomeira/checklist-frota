import React, { useState } from 'react';
import { useFleet } from '../store/FleetContext';
import { User, Plus, Trash2, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export const DriversPage: React.FC = () => {
    const { drivers, addDriver, removeDriver } = useFleet();
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [cnh, setCnh] = useState('');
    const [category, setCategory] = useState('');
    const [expiration, setExpiration] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addDriver({
            id: crypto.randomUUID(),
            name,
            cnhNumber: cnh,
            cnhCategory: category.toUpperCase(),
            cnhExpiration: expiration
        });
        setIsAdding(false);
        setName(''); setCnh(''); setCategory(''); setExpiration('');
    };

    const getStatus = (dateString: string) => {
        const today = new Date();
        const expDate = new Date(dateString);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'VENCIDA', color: 'red' };
        if (diffDays < 30) return { label: 'VENCE EM BREVE', color: 'yellow' };
        return { label: 'VIGENTE', color: 'emerald' };
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2">Motoristas</h2>
                    <p className="text-gray-400 text-lg">Cadastro e controle de CNH</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-industrial-accent text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-lg"
                >
                    <Plus size={20} />
                    {isAdding ? 'Cancelar' : 'Novo Motorista'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl mb-12 border border-slate-700/50 shadow-2xl animate-fade-in max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nome Completo</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none transition-all"
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nº CNH</label>
                                <input
                                    required
                                    value={cnh}
                                    onChange={e => setCnh(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Categoria</label>
                                <input
                                    required
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none transition-all uppercase"
                                    placeholder="Ex: AE"
                                    maxLength={2}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Validade</label>
                                <input
                                    required
                                    type="date"
                                    value={expiration}
                                    onChange={e => setExpiration(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-white focus:border-industrial-accent focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                            Salvar Motorista
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map(driver => {
                    const status = getStatus(driver.cnhExpiration);
                    return (
                        <div key={driver.id} className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-all group relative">
                            <button
                                onClick={() => removeDriver(driver.id)}
                                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-slate-700/50 rounded-full text-gray-300">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-white">{driver.name}</h4>
                                    <p className="text-sm text-gray-400">CNH: {driver.cnhNumber} <span className="text-industrial-accent font-bold ml-1">({driver.cnhCategory})</span></p>
                                </div>
                            </div>

                            <div className={clsx(
                                "flex items-center justify-between p-3 rounded-lg border",
                                status.color === 'red' ? "bg-red-950/20 border-red-500/30 text-red-400" :
                                    status.color === 'yellow' ? "bg-yellow-950/20 border-yellow-500/30 text-yellow-400" :
                                        "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                            )}>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <ShieldAlert size={16} />
                                    <span>{status.label}</span>
                                </div>
                                <span className="font-mono text-sm">{new Date(driver.cnhExpiration).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    );
                })}
                {drivers.length === 0 && !isAdding && (
                    <p className="col-span-full text-center text-gray-500 py-10">Nenhum motorista cadastrado.</p>
                )}
            </div>
        </div>
    );
};

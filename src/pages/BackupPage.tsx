
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Upload, AlertCircle, CheckCircle, Database } from 'lucide-react';

export const BackupPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // List of tables to backup/restore in dependency order
    const TABLES = [
        'vehicles',
        'drivers',
        'financial_accounts',
        'suppliers',
        'customers',
        'checklists', // depends on vehicles
        'transactions', // depends on accounts, suppliers, customers, vehicles, checklists
        'trips',     // depends on vehicles, drivers
        'fuel_entries' // depends on vehicles, drivers, transactions(optional)
    ];

    const handleExport = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const backupData: Record<string, any[]> = {};

            for (const table of TABLES) {
                const { data, error } = await supabase.from(table).select('*');
                if (error) {
                    console.error(`Error fetching ${table}:`, error);
                    // Don't throw, just skip or warn? For backup we usually want everything.
                    // If table doesn't exist (e.g. fuel_entries might be new), just skip.
                    if (error.code !== '42P01') {
                        throw error;
                    }
                }
                if (data) {
                    backupData[table] = data;
                }
            }

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_frota_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Backup realizado com sucesso! O arquivo foi baixado.' });
        } catch (error: any) {
            console.error('Export error:', error);
            setMessage({ type: 'error', text: 'Erro ao criar backup: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Você precisa estar logado para restaurar dados.');

            // Process tables in order
            for (const table of TABLES) {
                const rows = data[table];
                if (rows && Array.isArray(rows) && rows.length > 0) {
                    // Prepare rows: Remove ID (optional, but keeping UUID might be good for refs)
                    // CRITICAL: Overwrite created_by with current user
                    const cleanRows = rows.map(row => {
                        const { created_at, ...rest } = row; // Keep ID to preserve relations
                        return {
                            ...rest,
                            created_by: user.id
                        };
                    });

                    // Upsert data
                    const { error } = await supabase.from(table).upsert(cleanRows, { onConflict: 'id' });
                    if (error) {
                        // If table missing, ignore
                        if (error.code !== '42P01') {
                            console.error(`Error importing ${table}:`, error);
                            throw new Error(`Erro na tabela ${table}: ${error.message}`);
                        }
                    }
                }
            }

            setMessage({ type: 'success', text: 'Dados restaurados com sucesso! Verifique os painéis.' });
        } catch (error: any) {
            console.error('Import error:', error);
            setMessage({ type: 'error', text: 'Erro na restauração: ' + error.message });
        } finally {
            setLoading(false);
            // Reset input
            event.target.value = '';
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Database className="text-yellow-400" />
                Backup e Restauração
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {/* Export Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Download className="text-blue-400" />
                        Exportar Dados
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Baixe uma cópia completa de todos os seus dados (Veículos, Motoristas, Financeiro, etc) em formato JSON.
                        Isso serve como uma cópia de segurança.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Baixar Backup Completo'}
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Upload className="text-green-400" />
                        Restaurar Dados
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Carregue um arquivo de backup para restaurar seus dados nesta conta.
                        <br />
                        <span className="text-yellow-500 text-sm font-bold">
                            Atenção: Os dados serão vinculados ao seu usuário atual.
                        </span>
                    </p>
                    <label className="w-full cursor-pointer">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={loading}
                            className="hidden"
                        />
                        <div className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 opacity-100 hover:opacity-90">
                            {loading ? 'Processando...' : 'Selecionar Arquivo de Backup'}
                        </div>
                    </label>
                </div>
            </div>

            {/* Messages */}
            {message && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 max-w-4xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-4xl text-yellow-200 text-sm">
                <p className="font-bold flex items-center gap-2 mb-2">
                    <AlertCircle size={16} />
                    Como usar para migração:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-1 text-yellow-100/80">
                    <li>Exporte seus dados atuais usando o botão azul (enquanto os dados estão visíveis).</li>
                    <li>Avise o suporte para "Trancar o Sistema" (Ativar modo SaaS).</li>
                    <li>Faça login na conta correta.</li>
                    <li>Use o botão verde para carregar o arquivo que você baixou.</li>
                </ol>
            </div>
        </div>
    );
};

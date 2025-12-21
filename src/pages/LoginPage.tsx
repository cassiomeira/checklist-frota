import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user && data.session) {
                    navigate('/');
                } else {
                    setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar (se necessário) ou faça login.');
                    setIsLogin(true);
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('Digite seu e-mail para recuperar a senha.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccessMessage('E-mail de recuperação enviado!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-3xl shadow-inner"></div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                        <Truck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        CLC <span className="text-blue-500">TRANSPORTES</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Gestão de Frota Inteligente</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">

                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={clsx(
                                "flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200",
                                isLogin ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={clsx(
                                "flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200",
                                !isLogin ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-sm text-red-200">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                                <AlertCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-sm text-green-200">{successMessage}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar no Sistema' : 'Começar Agora'}
                                    <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} CLC Transportes. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

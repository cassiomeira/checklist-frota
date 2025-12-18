import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, ClipboardCheck, User } from 'lucide-react';
import clsx from 'clsx';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent",
                isActive
                    ? "bg-industrial-accent text-slate-900 font-bold shadow-lg shadow-industrial-accent/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-transparent text-industrial-text overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl z-20">
                <div className="p-8 border-b border-slate-700/50 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-industrial-accent p-2 rounded-lg">
                            <Truck className="text-slate-900" size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight leading-none">CLC</h1>
                                <p className="text-xs text-industrial-accent font-bold tracking-widest uppercase">TRANSPORTES</p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu Principal</p>
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Painel de Controle" />
                    <NavItem to="/vehicles" icon={<Truck size={20} />} label="Frota" />
                    <NavItem to="/drivers" icon={<User size={20} />} label="Motoristas" />
                    <NavItem to="/checklist" icon={<ClipboardCheck size={20} />} label="Checklist Diário" />
                </nav>

                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-industrial-accent to-yellow-200 flex items-center justify-center text-slate-900 font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Admin User</p>
                            <p className="text-xs text-gray-400">admin@scania.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gradient-industrial relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="p-8 max-w-7xl mx-auto relative z-10 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

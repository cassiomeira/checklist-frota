
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Users, ClipboardCheck,
    Wallet, Map as MapIcon, FileText, Settings, LogOut, Save,
    ChevronDown, ChevronRight, Droplets, CreditCard, UserCircle, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

interface MenuItem {
    label: string;
    path?: string;
    icon: React.ElementType;
    children?: MenuItem[];
}

const MAIN_MENU_ITEMS: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Painel de Controle', path: '/' },
    { icon: Truck, label: 'Frota', path: '/vehicles' },
    { icon: Users, label: 'Motoristas', path: '/drivers' },
    { icon: ClipboardCheck, label: 'Checklist Diário', path: '/checklist' },
    {
        icon: Wallet,
        label: 'Financeiro',
        children: [
            { icon: Wallet, label: 'Lançamentos', path: '/financial' },
            { icon: MapIcon, label: 'Viagens', path: '/financial/trips' },
            { icon: Droplets, label: 'Abastecimento', path: '/financial/fuel' },
            { icon: FileText, label: 'Extrato Motorista', path: '/financial/driver-statement' },
            { icon: CreditCard, label: 'Carteiras / Bancos', path: '/financial/accounts' },
            { icon: UserCircle, label: 'Clientes', path: '/financial/customers' },
            { icon: Building2, label: 'Fornecedores', path: '/financial/suppliers' },
            { icon: FileText, label: 'Relatórios', path: '/financial/reports' },
        ]
    },
];

const NavItem: React.FC<{ item: MenuItem }> = ({ item }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Check if any child is active to auto-open
    const hasActiveChild = item.children?.some(child => child.path === location.pathname);
    const isActive = item.path === location.pathname || hasActiveChild;

    useEffect(() => {
        if (hasActiveChild) {
            setIsOpen(true);
        }
    }, [hasActiveChild]);

    if (item.children) {
        return (
            <div className="mb-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={clsx(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border border-transparent group",
                        isActive
                            ? "bg-industrial-accent/10 text-industrial-accent border-industrial-accent/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isOpen && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-700/50 space-y-1 animate-fade-in">
                        {item.children.map((child) => (
                            <Link
                                key={child.path}
                                to={child.path!}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                                    location.pathname === child.path
                                        ? "bg-industrial-accent text-slate-900 font-bold shadow-md shadow-industrial-accent/10"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <child.icon size={16} />
                                <span>{child.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            to={item.path!}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent mb-1",
                isActive
                    ? "bg-industrial-accent text-slate-900 font-bold shadow-lg shadow-industrial-accent/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/5"
            )}
        >
            <item.icon size={20} />
            <span>{item.label}</span>
        </Link>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState<string>('Carregando...');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) {
                setUserEmail(user.email);
            }
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

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

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu Principal</p>
                    {MAIN_MENU_ITEMS.map((item, index) => (
                        <NavItem key={index} item={item} />
                    ))}

                    <div className="pt-4 mt-4 border-t border-slate-700/50">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Configurações</p>
                        <NavItem item={{ path: "/settings", icon: Settings, label: "Itens do Checklist" }} />
                        <NavItem item={{ path: "/backup", icon: Save, label: "Backup e Restauração" }} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 min-w-9 rounded-full bg-gradient-to-tr from-industrial-accent to-yellow-200 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-industrial-accent/10">
                                {userEmail.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-bold text-white truncate max-w-[140px]">{userEmail.split('@')[0]}</p>
                                <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{userEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Sair do Sistema"
                        >
                            <LogOut size={18} />
                        </button>
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

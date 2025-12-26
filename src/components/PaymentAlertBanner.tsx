import { AlertCircle, X, BellOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { useNavigate } from 'react-router-dom';

interface PaymentAlertBannerProps {
    dueTodayTransactions: Transaction[];
}


export function PaymentAlertBanner({ dueTodayTransactions }: PaymentAlertBannerProps) {
    const navigate = useNavigate();
    const [isBlinking, setIsBlinking] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    // Check localStorage for dismissed state
    useEffect(() => {
        const dismissedKey = `payment-alert-dismissed-${new Date().toISOString().split('T')[0]}`;
        const dismissed = localStorage.getItem(dismissedKey);
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    // Auto-dismiss when no more pending transactions
    useEffect(() => {
        if (dueTodayTransactions.length === 0 && !isDismissed) {
            setIsDismissed(true);
        }
    }, [dueTodayTransactions, isDismissed]);

    const handleDismiss = () => {
        const dismissedKey = `payment-alert-dismissed-${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(dismissedKey, 'true');
        setIsDismissed(true);
    };

    const handleStopBlinking = () => {
        setIsBlinking(false);
    };

    const handleViewTransactions = () => {
        navigate('/financial/transactions');
    };

    const totalAmount = dueTodayTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    if (isDismissed || dueTodayTransactions.length === 0) {
        return null;
    }

    return (
        <div
            className={`relative bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-lg shadow-lg mb-6 ${isBlinking ? 'animate-pulse-slow' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">
                            ⚠️ Contas a Pagar Vencidas ou Vencendo Hoje
                        </h3>
                        <p className="text-sm opacity-90 mb-2">
                            {dueTodayTransactions.length} conta(s) pendente(s) com vencimento até hoje
                        </p>
                        <div className="space-y-1 text-sm">
                            {dueTodayTransactions.slice(0, 3).map(tx => (
                                <div key={tx.id} className="opacity-90">
                                    • {tx.description} - R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            ))}
                            {dueTodayTransactions.length > 3 && (
                                <div className="opacity-75 italic">
                                    ... e mais {dueTodayTransactions.length - 3} conta(s)
                                </div>
                            )}
                        </div>
                        <div className="mt-3 text-base font-semibold">
                            Total: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Dispensar alerta"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {isBlinking && (
                        <button
                            onClick={handleStopBlinking}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Parar de piscar"
                        >
                            <BellOff className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleViewTransactions}
                    className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                    Ver Lançamentos
                </button>
            </div>
        </div>
    );
}

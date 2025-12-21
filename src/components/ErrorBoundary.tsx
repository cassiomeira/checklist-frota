import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/30 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <ShieldAlert size={48} />
                            <h1 className="text-2xl font-bold">Algo deu errado!</h1>
                        </div>

                        <div className="bg-black/50 p-4 rounded-lg overflow-auto max-h-64 mb-6 border border-slate-700">
                            <code className="text-red-400 font-mono text-sm break-words">
                                {this.state.error?.toString()}
                            </code>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-spin" size={32} />
            </div>
        );
    }

    if (!session) {
        // Redirect to login, but save the intended location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

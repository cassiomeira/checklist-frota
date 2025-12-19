import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ driver, onLogout, onNewChecklist, onHistory }) {
    const [vehicles, setVehicles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const loadData = async () => {
        try {
            // Carregar Veículos
            const { data: vehiclesData, error: vehiclesError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('default_driver_id', driver.id);

            if (vehiclesData) {
                setVehicles(vehiclesData);
            }

            // Verificar Pendências (Filtrar problemas reais)
            const { data: pendingData } = await supabase
                .from('checklists')
                .select('items')
                .eq('driver_id', driver.id)
                .eq('status', 'PENDING');

            if (pendingData) {
                const realCount = pendingData.filter(c =>
                    c.items && Array.isArray(c.items) && c.items.some(i => i.status === 'PROBLEM')
                ).length;
                setPendingCount(realCount);
            } else {
                setPendingCount(0);
            }

        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getDate = () => {
        return new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoSmall}>
                    <Text style={styles.logoTextSmall}>CLC</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.greeting}>👤 {driver.name}</Text>
                    <Text style={styles.date}>{getDate()}</Text>
                </View>
                <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                }
            >
                {/* ALERTA DE PENDÊNCIAS */}
                {pendingCount > 0 && (
                    <TouchableOpacity style={styles.alertBanner} onPress={onHistory}>
                        <Text style={styles.alertTitle}>⚠️ Atenção Necessária</Text>
                        <Text style={styles.alertText}>
                            Você tem {pendingCount} checklist{pendingCount > 1 ? 's' : ''} com avaria(s).
                        </Text>
                        <Text style={styles.alertLink}>Toque para ver e corrigir →</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.sectionTitle}>Meus Veículos</Text>

                {vehicles.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Nenhum veículo vinculado</Text>
                        <Text style={styles.emptySubtext}>Entre em contato com o gerente</Text>
                    </View>
                ) : (
                    vehicles.map((vehicle) => (
                        <View key={vehicle.id} style={styles.vehicleCard}>
                            <View style={styles.vehicleIcon}>
                                <Text style={styles.vehicleIconText}>
                                    {vehicle.type === 'CAVALO' ? '🚛' : '📦'}
                                </Text>
                            </View>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                                <Text style={styles.vehicleType}>
                                    {vehicle.type === 'CAVALO'
                                        ? `Scania ${vehicle.model}`
                                        : `Carreta ${vehicle.axles} eixos`}
                                </Text>
                            </View>
                            <View style={styles.vehicleStatus}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Ativo</Text>
                            </View>
                        </View>
                    ))
                )}

                <View style={styles.spacing} />
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={onHistory}
                >
                    <Text style={styles.historyButtonText}>📜 Ver Histórico</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.newChecklistButton}
                    onPress={onNewChecklist}
                >
                    <Text style={styles.newChecklistText}>➕ Novo Checklist</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    logoSmall: {
        width: 50,
        height: 50,
        backgroundColor: '#f59e0b',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoTextSmall: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    date: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#334155',
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 14,
        color: '#f59e0b',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    vehicleIcon: {
        width: 60,
        height: 60,
        backgroundColor: '#334155',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleIconText: {
        fontSize: 32,
    },
    vehicleInfo: {
        flex: 1,
        marginLeft: 12,
    },
    vehiclePlate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    vehicleType: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
    },
    vehicleStatus: {
        alignItems: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#64748b',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#475569',
        marginTop: 8,
    },
    spacing: {
        height: 100,
    },
    footer: {
        padding: 20,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    newChecklistButton: {
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    newChecklistText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    historyButton: {
        backgroundColor: '#334155',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#475569',
    },
    historyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    alertBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    alertTitle: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    alertText: {
        color: '#cbd5e1',
        fontSize: 14,
        marginBottom: 8,
    },
    alertLink: {
        color: '#fca5a5',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

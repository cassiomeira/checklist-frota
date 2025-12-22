import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ driver, onLogout, onNewChecklist, onHistory }) {
    const [vehicles, setVehicles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const [activeTrip, setActiveTrip] = useState(null);
    const [showStartTripModal, setShowStartTripModal] = useState(false);
    const [showFinishTripModal, setShowFinishTripModal] = useState(false);
    const [tripForm, setTripForm] = useState({
        vehicleId: null,
        odometer: '',
        location: ''
    });
    const [loadingTripAction, setLoadingTripAction] = useState(false);

    // Report Issue State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportForm, setReportForm] = useState({
        vehicleId: null,
        description: '',
        priority: 'HIGH' // LOW, MEDIUM, HIGH
    });
    const [loadingReport, setLoadingReport] = useState(false);

    const loadData = async () => {
        try {
            // Carregar Veículos via RPC
            const { data: vehiclesData, error: vehiclesError } = await supabase.rpc('get_driver_vehicles', {
                p_driver_id: driver.id
            });

            if (vehiclesData) {
                setVehicles(vehiclesData);
                // Pre-select first vehicle for trip form if available
                if (vehiclesData.length > 0) {
                    setTripForm(prev => ({ ...prev, vehicleId: vehiclesData[0].id }));
                }
            }

            // Verificar Pendências via RPC
            const { data: pendingData, error: pendingError } = await supabase.rpc('get_driver_pending_alerts', {
                p_driver_id: driver.id
            });

            if (pendingData) {
                const realCount = pendingData.length;
                setPendingCount(realCount);
            } else {
                setPendingCount(0);
            }

            // Carregar Viagem Ativa via RPC
            const { data: tripData, error: tripError } = await supabase.rpc('get_driver_active_trip', {
                p_driver_id: driver.id
            });

            if (tripData) {
                setActiveTrip(tripData);
            } else {
                setActiveTrip(null);
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

    const handleStartTrip = async () => {
        if (!tripForm.vehicleId || !tripForm.odometer || !tripForm.location) {
            Alert.alert('Erro', 'Preencha todos os campos (Veículo, KM, Local).');
            return;
        }

        try {
            setLoadingTripAction(true);
            const { error } = await supabase.rpc('start_trip', {
                p_driver_id: driver.id,
                p_vehicle_id: tripForm.vehicleId,
                p_start_km: parseFloat(tripForm.odometer),
                p_start_location: tripForm.location
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Viagem iniciada!');
            setShowStartTripModal(false);
            setTripForm({ ...tripForm, odometer: '', location: '' }); // Keep vehicleId
            loadData();
        } catch (err) {
            Alert.alert('Erro', 'Falha ao iniciar viagem: ' + err.message);
        } finally {
            setLoadingTripAction(false);
        }
    };

    const handleFinishTrip = async () => {
        if (!tripForm.odometer || !tripForm.location) {
            Alert.alert('Erro', 'Preencha KM Final e Local.');
            return;
        }

        try {
            setLoadingTripAction(true);
            const { error } = await supabase.rpc('finish_trip', {
                p_trip_id: activeTrip.id,
                p_end_km: parseFloat(tripForm.odometer),
                p_end_location: tripForm.location
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Viagem finalizada!');
            setShowFinishTripModal(false);
            setTripForm({ ...tripForm, odometer: '', location: '' });
            loadData();
        } catch (err) {
            Alert.alert('Erro', 'Falha ao finalizar viagem: ' + err.message);
        } finally {
            setLoadingTripAction(false);
        }
    };

    const handleOpenReport = (vehicleId) => {
        setReportForm({ vehicleId, description: '', priority: 'HIGH' });
        setShowReportModal(true);
    };

    const handleSendReport = async () => {
        if (!reportForm.description.trim()) {
            Alert.alert('Erro', 'Descreva o problema.');
            return;
        }

        try {
            setLoadingReport(true);
            const { error } = await supabase.rpc('report_vehicle_issue', {
                p_vehicle_id: reportForm.vehicleId,
                p_description: reportForm.description,
                p_priority: reportForm.priority,
                p_driver_name: driver.name
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Problema reportado à gerência!');
            setShowReportModal(false);
        } catch (err) {
            Alert.alert('Erro', 'Falha ao enviar reporte: ' + err.message);
        } finally {
            setLoadingReport(false);
        }
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
                {/* VIAGEM ATIVA / INICIAR */}
                {activeTrip ? (
                    <View style={styles.activeTripCard}>
                        <View style={styles.tripHeader}>
                            <Text style={styles.tripTitle}>🚛 Viagem em Andamento</Text>
                            <View style={styles.pulsingDot} />
                        </View>
                        <View style={styles.tripDetails}>
                            <Text style={styles.tripLabel}>Origem:</Text>
                            <Text style={styles.tripValue}>{activeTrip.start_location}</Text>
                            <Text style={styles.tripLabel}>KM Inicial:</Text>
                            <Text style={styles.tripValue}>{activeTrip.start_km} km</Text>
                            <Text style={styles.tripLabel}>Início:</Text>
                            <Text style={styles.tripValue}>{new Date(activeTrip.start_date).toLocaleString('pt-BR')}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.finishTripButton}
                            onPress={() => setShowFinishTripModal(true)}
                        >
                            <Text style={styles.finishTripText}>🏁 Finalizar Viagem</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.startTripCard}
                        onPress={() => setShowStartTripModal(true)}
                    >
                        <Text style={styles.startTripTitle}>🚀 Iniciar Nova Viagem</Text>
                        <Text style={styles.startTripSubtitle}>Toque para registrar saída</Text>
                    </TouchableOpacity>
                )}

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

                            {/* REPORT ISSUE BUTTON */}
                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => handleOpenReport(vehicle.id)}
                            >
                                <Text style={styles.reportButtonText}>🚨 Reportar Problema</Text>
                            </TouchableOpacity>
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

            {/* MODAL INICIAR VIAGEM */}
            <Modal visible={showStartTripModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Iniciar Viagem</Text>

                        <Text style={styles.label}>Veículo</Text>
                        <ScrollView horizontal style={styles.vehicleSelector} showsHorizontalScrollIndicator={false}>
                            {vehicles.map(v => (
                                <TouchableOpacity
                                    key={v.id}
                                    style={[styles.vehicleChip, tripForm.vehicleId === v.id && styles.vehicleChipActive]}
                                    onPress={() => setTripForm({ ...tripForm, vehicleId: v.id })}
                                >
                                    <Text style={[styles.vehicleChipText, tripForm.vehicleId === v.id && styles.vehicleChipTextActive]}>
                                        {v.plate}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>KM Inicial</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 150000"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                            value={tripForm.odometer}
                            onChangeText={t => setTripForm({ ...tripForm, odometer: t })}
                        />

                        <Text style={styles.label}>Local de Origem</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Garagem SP"
                            placeholderTextColor="#64748b"
                            value={tripForm.location}
                            onChangeText={t => setTripForm({ ...tripForm, location: t })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStartTripModal(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleStartTrip}
                                disabled={loadingTripAction}
                            >
                                <Text style={styles.confirmText}>{loadingTripAction ? 'Iniciando...' : 'Iniciar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL FINALIZAR VIAGEM */}
            <Modal visible={showFinishTripModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Finalizar Viagem</Text>

                        <Text style={styles.label}>KM Final</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 150500"
                            placeholderTextColor="#64748b"
                            keyboardType="numeric"
                            value={tripForm.odometer}
                            onChangeText={t => setTripForm({ ...tripForm, odometer: t })}
                        />

                        <Text style={styles.label}>Local de Destino</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Cliente RJ"
                            placeholderTextColor="#64748b"
                            value={tripForm.location}
                            onChangeText={t => setTripForm({ ...tripForm, location: t })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFinishTripModal(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleFinishTrip}
                                disabled={loadingTripAction}
                            >
                                <Text style={styles.confirmText}>{loadingTripAction ? 'Finalizando...' : 'Finalizar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL REPORTAR PROBLEMA */}
            <Modal visible={showReportModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reportar Problema</Text>
                        <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
                            Descreva o problema para a gerência.
                        </Text>

                        <Text style={styles.label}>Descrição do Problema</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Ex: Pneu estourou na estrada..."
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={4}
                            value={reportForm.description}
                            onChangeText={t => setReportForm({ ...reportForm, description: t })}
                        />

                        <Text style={styles.label}>Prioridade</Text>
                        <View style={styles.prioritySelector}>
                            {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.priorityChip,
                                        reportForm.priority === p && styles.priorityChipActive,
                                        reportForm.priority === p && (p === 'HIGH' ? styles.bgRed : p === 'MEDIUM' ? styles.bgOrange : styles.bgGreen)
                                    ]}
                                    onPress={() => setReportForm({ ...reportForm, priority: p })}
                                >
                                    <Text style={[styles.priorityText, reportForm.priority === p && styles.priorityTextActive]}>
                                        {p === 'HIGH' ? 'ALTA' : p === 'MEDIUM' ? 'MÉDIA' : 'BAIXA'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReportModal(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: '#ef4444' }]}
                                onPress={handleSendReport}
                                disabled={loadingReport}
                            >
                                <Text style={styles.confirmText}>{loadingReport ? 'Enviando...' : 'Enviar Alerta'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

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
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    vehicleHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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

    // TRIP STYLES
    activeTripCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: '#10b981',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    tripTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    pulsingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    tripDetails: {
        marginBottom: 20,
    },
    tripLabel: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 2,
    },
    tripValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    finishTripButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    finishTripText: {
        color: '#064e3b',
        fontWeight: 'bold',
        fontSize: 16,
    },
    startTripCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    startTripTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginBottom: 8,
    },
    startTripSubtitle: {
        color: '#94a3b8',
        fontSize: 14,
    },

    // MODAL STYLES
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#334155',
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f59e0b',
        alignItems: 'center',
    },
    confirmText: {
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 16,
    },
    vehicleSelector: {
        maxHeight: 60,
    },
    vehicleChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#334155',
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    vehicleChipActive: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
    },
    vehicleChipText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    vehicleChipTextActive: {
        color: '#f59e0b',
    },
    reportButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    prioritySelector: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityChip: {
        flex: 1,
        padding: 12,
        backgroundColor: '#334155',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    priorityChipActive: {
        borderColor: '#fff',
    },
    bgRed: { backgroundColor: '#ef4444' },
    bgOrange: { backgroundColor: '#f97316' },
    bgGreen: { backgroundColor: '#10b981' },
    priorityText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
    priorityTextActive: { color: '#fff' }
});

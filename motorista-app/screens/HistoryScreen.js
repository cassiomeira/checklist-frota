import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HistoryScreen({ driver, onBack }) {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [corrections, setCorrections] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Estado para correção inline
    const [correctingItemId, setCorrectingItemId] = useState(null);
    const [correctionText, setCorrectionText] = useState('');
    const [sendingCorrection, setSendingCorrection] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('checklists')
                .select('*')
                .eq('driver_id', driver.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setChecklists(data || []);
        } catch (err) {
            Alert.alert('Erro', 'Erro ao carregar histórico: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChecklist = async (checklist) => {
        setSelectedChecklist(checklist);
        setCorrections([]);
        setCorrectingItemId(null);

        const hasProblems = checklist.items.some(i => i.status === 'PROBLEM');

        if (hasProblems) {
            loadCorrections(checklist.id);
        }
    };

    const loadCorrections = async (checklistId) => {
        try {
            setLoadingDetails(true);
            const { data, error } = await supabase
                .from('corrective_actions')
                .select('*')
                .eq('checklist_id', checklistId);

            if (data) setCorrections(data);
        } catch (err) {
            console.error("Erro ao buscar correções", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleStartCorrection = (itemId) => {
        setCorrectingItemId(itemId);
        setCorrectionText('');
    };

    const handleSaveCorrection = async (item) => {
        if (!correctionText.trim()) {
            Alert.alert('Erro', 'Descreva o que foi feito.');
            return;
        }

        try {
            setSendingCorrection(true);
            const itemId = item.id || item.name; // Fallback para checklists antigos

            const { error } = await supabase
                .from('corrective_actions')
                .insert({
                    checklist_id: selectedChecklist.id,
                    item_id: itemId,
                    corrected_by: driver.name,
                    action_taken: correctionText, // Mobile usa snake_case ou camelCase? Verificando types... O banco provavelmente é snake_case
                    // Mas o context web usa map. Vamos tentar inserir snake_case direto.
                    // Espera, no web app a gente usou um context que mapeava.
                    // O insert direto no supabase usa os nomes das colunas do banco.
                    // Vamos assumir snake_case: action_taken, created_at, verified (default false)
                    created_at: new Date().toISOString(),
                    verified: false
                });

            if (error) throw error;

            Alert.alert('Sucesso', 'Correção registrada!');
            setCorrectingItemId(null);
            setCorrectionText('');
            loadCorrections(selectedChecklist.id); // Recarregar correções

        } catch (err) {
            Alert.alert('Erro', 'Falha ao salvar: ' + err.message);
        } finally {
            setSendingCorrection(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Histórico</Text>
                <View style={{ width: 60 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#f59e0b" />
                </View>
            ) : checklists.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>Nenhum checklist encontrado</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {checklists.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleSelectChecklist(item)}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.date}>{formatDate(item.date)}</Text>
                                <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusOk : styles.statusProblem]}>
                                    <Text style={[styles.statusText, item.status === 'COMPLETED' ? styles.textOk : styles.textProblem]}>
                                        {item.status === 'COMPLETED' ? 'APROVADO' : 'PENDENTE'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.type}>
                                {item.type === 'MAINTENANCE' ? '🔧 Manutenção' : '📦 Carga'}
                            </Text>
                            <Text style={styles.clickHint}>Toque para ver detalhes</Text>
                        </TouchableOpacity>
                    ))}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {/* MODAL DE DETALHES */}
            <Modal visible={!!selectedChecklist} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes do Checklist</Text>
                            <TouchableOpacity onPress={() => setSelectedChecklist(null)} style={styles.closeButton}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {selectedChecklist?.items.map((item, idx) => {
                                const itemId = item.id || item.name;
                                const correction = corrections.find(c => c.item_id === item.id || c.item_id === item.name);
                                const isCorrecting = correctingItemId === itemId;

                                return (
                                    <View key={idx} style={[
                                        styles.detailItem,
                                        item.status === 'PROBLEM' ? styles.detailItemProblem : styles.detailItemOk
                                    ]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.detailName}>{item.name || item.label}</Text>
                                            <Text style={[
                                                styles.detailStatus,
                                                item.status === 'PROBLEM' ? styles.textProblem : styles.textOk
                                            ]}>
                                                {item.status === 'PROBLEM' ? '⚠️ AVARIA' : '✅ OK'}
                                            </Text>
                                        </View>

                                        {item.status === 'PROBLEM' && (
                                            <View style={styles.problemDetails}>
                                                <Text style={styles.commentLabel}>Obs: {item.comment}</Text>

                                                {/* CORREÇÃO DO MECÂNICO OU MOTORISTA */}
                                                {loadingDetails ? (
                                                    <ActivityIndicator color="#f59e0b" />
                                                ) : correction ? (
                                                    <View style={styles.correctionBox}>
                                                        <Text style={styles.correctionTitle}>🔧 Correção Realizada:</Text>
                                                        <Text style={styles.correctionText}>{correction.action_taken || correction.actionTaken}</Text>
                                                        <Text style={styles.correctionFooter}>
                                                            Por: {correction.corrected_by || correction.correctedBy}
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <View>
                                                        {isCorrecting ? (
                                                            <View style={styles.inlineForm}>
                                                                <Text style={styles.formLabel}>O que foi feito?</Text>
                                                                <TextInput
                                                                    style={styles.formInput}
                                                                    placeholder="Descreva a correção..."
                                                                    placeholderTextColor="#64748b"
                                                                    value={correctionText}
                                                                    onChangeText={setCorrectionText}
                                                                />
                                                                <View style={styles.formButtons}>
                                                                    <TouchableOpacity
                                                                        style={styles.cancelButton}
                                                                        onPress={() => setCorrectingItemId(null)}
                                                                    >
                                                                        <Text style={styles.cancelText}>Cancelar</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={styles.saveButton}
                                                                        onPress={() => handleSaveCorrection(item)}
                                                                        disabled={sendingCorrection}
                                                                    >
                                                                        <Text style={styles.saveText}>{sendingCorrection ? 'Salvando...' : 'Salvar Correção'}</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            <TouchableOpacity
                                                                style={styles.registerButton}
                                                                onPress={() => handleStartCorrection(itemId)}
                                                            >
                                                                <Text style={styles.registerButtonText}>🔧 Registrar Correção</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingTop: 50, backgroundColor: '#1e293b',
        borderBottomWidth: 1, borderBottomColor: '#334155',
    },
    backButton: { padding: 8 },
    backText: { fontSize: 16, color: '#f59e0b', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    card: {
        backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#334155',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    date: { color: '#cbd5e1', fontSize: 14 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
    statusOk: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
    statusProblem: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    textOk: { color: '#10b981' },
    textProblem: { color: '#ef4444' },
    type: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    clickHint: { color: '#64748b', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
    emptyText: { color: '#64748b', fontSize: 16 },

    // Modal Styles
    modalContainer: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end',
    },
    modalContent: {
        height: '90%', backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, paddingBottom: 0
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    closeButton: { padding: 8 },
    closeText: { fontSize: 24, color: '#94a3b8' },
    modalBody: { flex: 1 },
    detailItem: {
        padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b'
    },
    detailItemProblem: { borderColor: '#7f1d1d' },
    detailItemOk: { borderColor: '#064e3b' },
    detailName: { color: '#fff', fontSize: 16, fontWeight: '600' },
    detailStatus: { fontSize: 14, fontWeight: 'bold' },
    problemDetails: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    commentLabel: { color: '#fca5a5', fontSize: 14, marginBottom: 8 },
    correctionBox: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    correctionTitle: { color: '#f59e0b', fontWeight: 'bold', marginBottom: 4 },
    correctionText: { color: '#fff', fontSize: 14 },
    correctionFooter: { color: '#94a3b8', fontSize: 12, marginTop: 4 },

    // Form Styles
    registerButton: {
        backgroundColor: '#334155', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 6
    },
    registerButtonText: { color: '#f59e0b', fontWeight: 'bold' },
    inlineForm: {
        backgroundColor: '#0f172a', padding: 10, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#334155'
    },
    formLabel: { color: '#cbd5e1', marginBottom: 6, fontSize: 12 },
    formInput: {
        backgroundColor: '#1e293b', color: '#fff', borderWidth: 1, borderColor: '#475569',
        borderRadius: 6, padding: 8, marginBottom: 10
    },
    formButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    cancelButton: { padding: 8 },
    cancelText: { color: '#94a3b8' },
    saveButton: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    saveText: { color: '#fff', fontWeight: 'bold' }
});


import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';

export default function ChecklistScreen({ driver, type, vehicles, onBack, onComplete }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0] || null);

    // Dynamic Items State
    const [checklistSections, setChecklistSections] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);

    // Form State (keyed by Item ID)
    const [status, setStatus] = useState({});
    const [photos, setPhotos] = useState({});
    const [comments, setComments] = useState({});

    const [showCamera, setShowCamera] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const cameraRef = useRef(null);

    // Fetch items from DB
    useEffect(() => {
        if (!type) return;

        const fetchItems = async () => {
            setLoadingItems(true);
            try {
                // Fetch items via RPC (bypassing RLS)
                const { data, error } = await supabase.rpc('get_checklist_definitions', {
                    p_type: type
                });

                if (error) throw error;

                let filteredData = data || [];

                // Filter by scope if maintenance
                if (type === 'MAINTENANCE' && selectedVehicle) {
                    const isTruck = selectedVehicle.type === 'CAVALO';
                    filteredData = filteredData.filter(item => {
                        if (!item.vehicle_scope || item.vehicle_scope === 'ALL') return true;
                        if (isTruck && item.vehicle_scope === 'TRUCK') return true;
                        if (!isTruck && item.vehicle_scope === 'TRAILER') return true;
                        return false;
                    });
                }

                // Group by category
                const groups = {};
                filteredData.forEach(item => {
                    const cat = item.category || 'Geral';
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(item);
                });

                const sections = Object.keys(groups).map(key => ({
                    title: key,
                    data: groups[key]
                }));

                setChecklistSections(sections);

                // Clear state when items change (e.g. vehicle switch)
                setStatus({});
                setPhotos({});
                setComments({});

            } catch (err) {
                console.error("Error fetching checklist items", err);
                Alert.alert("Erro", "Não foi possível carregar o checklist.");
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [type, selectedVehicle?.id]); // Refetch if vehicle changes (scope might change)


    const handleTakePhoto = async (itemId) => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permissão', 'Permissão de câmera necessária');
                return;
            }
        }
        setCurrentItemId(itemId);
        setShowCamera(true);
    };

    const capturePhoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
            const uri = `data:image/jpeg;base64,${photo.base64}`;

            setPhotos(prev => ({ ...prev, [currentItemId]: uri }));
            setShowCamera(false);
            setCurrentItemId(null);
        }
    };

    const handleStatusChange = (itemId, newStatus) => {
        setStatus(prev => ({ ...prev, [itemId]: newStatus }));
        // Clean up error state if swtiching to OK? optional.
    };

    const handleCommentChange = (itemId, text) => {
        setComments(prev => ({ ...prev, [itemId]: text }));
    };

    const handleSubmit = async () => {
        try {
            const allItems = checklistSections.flatMap(s => s.data);

            // Validation: All items must have status
            const pendingItems = allItems.filter(item => !status[item.id]);
            if (pendingItems.length > 0) {
                Alert.alert('Atenção', `Responda todos os itens.`);
                return;
            }

            // Validation: Problems need photo and comment
            const invalidProblems = allItems.filter(item =>
                status[item.id] === 'PROBLEM' && (!photos[item.id] || !(comments[item.id] || '').trim())
            );

            if (invalidProblems.length > 0) {
                Alert.alert('Atenção', 'Itens com AVARIA precisam de FOTO e COMENTÁRIO.');
                return;
            }

            if (!selectedVehicle) {
                Alert.alert('Erro', 'Selecione um veículo');
                return;
            }

            // Prepare items
            const submissionItems = allItems.map(item => ({
                id: item.id,
                label: item.name,
                status: status[item.id],
                photo: photos[item.id] || null,
                comment: comments[item.id] || ''
            }));

            // Submit via RPC (Secure)
            const { error } = await supabase.rpc('submit_checklist', {
                p_vehicle_id: selectedVehicle.id,
                p_driver_id: driver.id,
                p_driver_name: driver.name,
                p_type: type,
                p_items: submissionItems
            });

            if (error) throw error;

            Alert.alert('Sucesso', 'Checklist enviado!');
            onComplete();
        } catch (err) {
            Alert.alert('Erro', 'Erro ao enviar: ' + err.message);
        }
    };

    const allItems = checklistSections.flatMap(s => s.data);
    const totalCount = allItems.length;
    const completedCount = allItems.filter(item => status[item.id]).length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Voltar</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            {type === 'MAINTENANCE' ? '🔧 Manutenção' : '📦 Carga'}
                        </Text>
                        <Text style={styles.headerSubtitle}>{selectedVehicle?.plate}</Text>
                    </View>
                    <View style={{ width: 60 }} />
                </View>

                {/* Vehicle Selector */}
                {vehicles.length > 1 && (
                    <ScrollView horizontal style={styles.vehicleSelector} showsHorizontalScrollIndicator={false}>
                        {vehicles.map(v => (
                            <TouchableOpacity
                                key={v.id}
                                style={[styles.vehicleChip, selectedVehicle?.id === v.id && styles.vehicleChipActive]}
                                onPress={() => setSelectedVehicle(v)}
                            >
                                <Text style={[styles.vehicleChipText, selectedVehicle?.id === v.id && styles.vehicleChipTextActive]}>
                                    {v.plate}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{completedCount}/{totalCount} itens verificados</Text>
                </View>

                {loadingItems ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#f59e0b" />
                        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando itens...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        {checklistSections.map((section, idx) => (
                            <View key={idx} style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.data.map((item) => {
                                    const itemId = item.id;
                                    const itemStatus = status[itemId];
                                    const hasPhoto = photos[itemId];
                                    const itemComment = comments[itemId] || '';

                                    return (
                                        <View key={itemId} style={[
                                            styles.itemCard,
                                            itemStatus === 'OK' ? styles.itemOk :
                                                itemStatus === 'PROBLEM' ? styles.itemProblem : null
                                        ]}>
                                            <Text style={styles.itemName}>{item.name}</Text>

                                            <View style={styles.actionRow}>
                                                <TouchableOpacity
                                                    style={[styles.statusButton, itemStatus === 'OK' && styles.statusButtonOk]}
                                                    onPress={() => handleStatusChange(itemId, 'OK')}
                                                >
                                                    <Text style={[styles.statusButtonText, itemStatus === 'OK' && styles.statusButtonTextActive]}>✅ OK</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.statusButton, itemStatus === 'PROBLEM' && styles.statusButtonProblem]}
                                                    onPress={() => handleStatusChange(itemId, 'PROBLEM')}
                                                >
                                                    <Text style={[styles.statusButtonText, itemStatus === 'PROBLEM' && styles.statusButtonTextActive]}>⚠️ AVARIA</Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Details Area */}
                                            {(itemStatus === 'PROBLEM' || itemStatus === 'OK') && (
                                                <View style={styles.detailsContainer}>
                                                    {/* Photo Button */}
                                                    <TouchableOpacity
                                                        onPress={() => handleTakePhoto(itemId)}
                                                        style={[styles.photoButton, hasPhoto && styles.photoButtonComplete]}
                                                    >
                                                        <Text style={styles.photoButtonText}>
                                                            {hasPhoto ? '📸 Foto Registrada' : (itemStatus === 'PROBLEM' ? '📸 FOTO OBRIGATÓRIA' : '📷 Foto (Opcional)')}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    {/* Preview */}
                                                    {hasPhoto && <Image source={{ uri: hasPhoto }} style={styles.thumbnailReview} />}

                                                    {/* Comment (Mandatory for Problem) */}
                                                    {itemStatus === 'PROBLEM' && (
                                                        <TextInput
                                                            style={styles.commentInput}
                                                            placeholder="Descreva o problema..."
                                                            placeholderTextColor="#94a3b8"
                                                            value={itemComment}
                                                            onChangeText={(text) => handleCommentChange(itemId, text)}
                                                            multiline
                                                        />
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, completedCount < totalCount && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={completedCount < totalCount}
                    >
                        <Text style={styles.submitButtonText}>
                            {completedCount < totalCount
                                ? `Responda todos os itens`
                                : '✓ Enviar Checklist'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>

            {/* Camera Modal */}
            <Modal visible={showCamera} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} ref={cameraRef} facing="back">
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.closeCamera} onPress={() => setShowCamera(false)}>
                                <Text style={styles.closeCameraText}>✕</Text>
                            </TouchableOpacity>
                            <View style={styles.cameraBottom}>
                                <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingTop: 50, backgroundColor: '#1e293b',
        borderBottomWidth: 1, borderBottomColor: '#334155',
    },
    backButton: { padding: 8 },
    backText: { fontSize: 16, color: '#f59e0b', fontWeight: '600' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
    vehicleSelector: {
        maxHeight: 60, paddingHorizontal: 20, paddingVertical: 12,
        backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155',
    },
    vehicleChip: {
        paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#334155',
        borderRadius: 20, marginRight: 8,
    },
    vehicleChipActive: { backgroundColor: '#f59e0b' },
    vehicleChipText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
    vehicleChipTextActive: { color: '#0f172a' },
    progressContainer: { padding: 20, paddingBottom: 12 },
    progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#f59e0b' },
    progressText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', fontWeight: '600' },
    content: { flex: 1, paddingHorizontal: 20 },
    sectionContainer: { marginBottom: 24 },
    sectionTitle: { color: '#f59e0b', fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 12 },
    itemCard: {
        backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#334155',
    },
    itemOk: { borderColor: '#10b981', backgroundColor: 'rgba(6, 78, 59, 0.3)' },
    itemProblem: { borderColor: '#ef4444', backgroundColor: 'rgba(69, 10, 10, 0.3)' },
    itemName: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 12 },
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statusButton: {
        flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#334155',
        alignItems: 'center', borderWidth: 1, borderColor: '#475569',
    },
    statusButtonOk: { backgroundColor: '#10b981', borderColor: '#059669' },
    statusButtonProblem: { backgroundColor: '#ef4444', borderColor: '#b91c1c' },
    statusButtonText: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8' },
    statusButtonTextActive: { color: '#fff' },
    detailsContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    photoButton: {
        backgroundColor: '#334155', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12
    },
    photoButtonComplete: { backgroundColor: '#10b981' },
    photoButtonText: { color: '#fff', fontWeight: '600' },
    thumbnailReview: {
        width: '100%', height: 200, marginBottom: 12, borderRadius: 8,
        resizeMode: 'cover', borderWidth: 1, borderColor: '#475569',
    },
    commentInput: {
        backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#ef4444',
        borderRadius: 8, padding: 12, color: '#fff', minHeight: 80, textAlignVertical: 'top'
    },
    footer: {
        padding: 20, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155',
    },
    submitButton: {
        backgroundColor: '#f59e0b', borderRadius: 16, padding: 18, alignItems: 'center',
    },
    submitButtonDisabled: { backgroundColor: '#334155', opacity: 0.5 },
    submitButtonText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    cameraContainer: { flex: 1 },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, backgroundColor: 'transparent' },
    closeCamera: {
        position: 'absolute', top: 50, right: 20, width: 44, height: 44,
        borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center', justifyContent: 'center'
    },
    closeCameraText: { color: '#fff', fontSize: 24 },
    cameraBottom: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
    captureButton: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#f59e0b'
    },
    captureButtonInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f59e0b' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ChecklistTypeScreen({ driver, onBack, onTypeSelected }) {
    const [vehicles, setVehicles] = useState([]);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        const { data } = await supabase
            .from('vehicles')
            .select('*')
            .eq('default_driver_id', driver.id);
        if (data) setVehicles(data);
    };

    const handleNext = () => {
        if (selectedType) {
            onTypeSelected(selectedType, vehicles);
        }
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Novo Checklist</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                <Text style={styles.title}>Selecione o Tipo</Text>
                <Text style={styles.subtitle}>Escolha o tipo de checklist que deseja realizar</Text>

                <TouchableOpacity
                    style={[
                        styles.typeCard,
                        selectedType === 'MAINTENANCE' && styles.typeCardSelected
                    ]}
                    onPress={() => setSelectedType('MAINTENANCE')}
                >
                    <View style={styles.typeIcon}>
                        <Text style={styles.typeIconText}>🔧</Text>
                    </View>
                    <View style={styles.typeInfo}>
                        <Text style={styles.typeName}>Checklist de Manutenção</Text>
                        <Text style={styles.typeDescription}>
                            Verificação de pneus, freios, luzes, óleo, etc.
                        </Text>
                    </View>
                    {selectedType === 'MAINTENANCE' && (
                        <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.typeCard,
                        selectedType === 'LOADING' && styles.typeCardSelected
                    ]}
                    onPress={() => setSelectedType('LOADING')}
                >
                    <View style={styles.typeIcon}>
                        <Text style={styles.typeIconText}>📦</Text>
                    </View>
                    <View style={styles.typeInfo}>
                        <Text style={styles.typeName}>Checklist de Carga</Text>
                        <Text style={styles.typeDescription}>
                            Verificação de amarração, lonas, separação, etc.
                        </Text>
                    </View>
                    {selectedType === 'LOADING' && (
                        <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !selectedType && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={!selectedType}
                >
                    <Text style={styles.nextButtonText}>Continuar →</Text>
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
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
        color: '#f59e0b',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 32,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#334155',
    },
    typeCardSelected: {
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b10',
    },
    typeIcon: {
        width: 60,
        height: 60,
        backgroundColor: '#334155',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeIconText: {
        fontSize: 32,
    },
    typeInfo: {
        flex: 1,
        marginLeft: 16,
    },
    typeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    typeDescription: {
        fontSize: 14,
        color: '#94a3b8',
    },
    checkmark: {
        width: 32,
        height: 32,
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        fontSize: 18,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        backgroundColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    nextButton: {
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    nextButtonDisabled: {
        opacity: 0.3,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
});

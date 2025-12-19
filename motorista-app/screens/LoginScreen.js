import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ onLogin }) {
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!cpf || !password) {
            Alert.alert('Erro', 'Preencha CPF e senha');
            return;
        }

        setLoading(true);
        const cleanCpf = cpf.replace(/\D/g, '');

        try {
            // 1. Buscar motorista pelo CPF
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .eq('cpf', cleanCpf)
                .limit(1);

            console.log('Resultado Query (raw):', JSON.stringify({ data, error }, null, 2));

            if (error) {
                console.error('ERRO QUERY:', error);
                Alert.alert('Erro Query', `Erro ao buscar motorista: ${error.message}`);
                setLoading(false);
                return;
            }

            if (!data || data.length === 0) {
                console.warn('NENHUM DADO ENCONTRADO para o CPF:', cpf);
                Alert.alert('Erro', `CPF ${cpf} não encontrado no banco de dados.\n\nVerifique se o usuário foi criado no painel.`);
                setLoading(false);
                return;
            }

            const driverData = data[0]; // Pegando o primeiro item já que removemos .single()

            if (driverData.password !== password) {
                console.warn('SENHA INCORRETA para:', cpf);
                Alert.alert('Erro', 'Senha incorreta');
                setLoading(false);
                return;
            }

            console.log('LOGIN SUCESSO! Dados:', driverData);
            onLogin(driverData);

        } catch (err) {
            console.error('ERRO GERAL (CATCH):', err);
            Alert.alert('Erro Crítico', 'Erro inesperado: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>CLC</Text>
                    </View>
                    <Text style={styles.companyName}>TRANSPORTES</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>App do Motorista</Text>
                <Text style={styles.subtitle}>Faça login para continuar</Text>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>CPF (Somente Números)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="07966147402"
                        placeholderTextColor="#64748b"
                        value={cpf}
                        onChangeText={setCpf}
                        keyboardType="numeric"
                        maxLength={11}
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor="#64748b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: '#f59e0b',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b',
        letterSpacing: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#f59e0b',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
});

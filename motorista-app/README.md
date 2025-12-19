# 📱 App do Motorista - CLC TRANSPORTES

App mobile para motoristas fazerem checklists com fotos.

## 🚀 Como Rodar

### 1. Instalar dependências (já feito)
```bash
cd motorista-app
npm install
```

### 2. Rodar o app
```bash
npx expo start
```

### 3. Abrir no celular
- Instale o **Expo Go** no seu celular (Play Store)
- Escaneie o QR Code que aparece no terminal
- O app abrirá no Expo Go

## 📋 Funcionalidades

✅ **Login com CPF e Senha**
- CPF com máscara automática
- Validação no Supabase

✅ **Home com Veículos**  
- Mostra apenas veículos vinculados
- Data atual
- Botão para novo checklist

✅ **Seleção de Tipo**
- Manutenção ou Carga
- Cards clicáveis

✅ **Checklist com Fotos**
- Foto OBRIGATÓRIA em cada item
- Câmera integrada
- Progresso visual
- Validação antes de enviar

✅ **Sincronização Automática**
- Envia para Supabase
- Aparece no painel gerencial

## 🔐 Teste

**Motorista de Teste:**
- CPF: `079.661.474-02`
- Senha: `123456`
- Veículos vinculados: RH15C17, TEX2I81

## 📱 Build Android

### Gerar APK
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Build
eas build --platform android --profile preview
```

### Instalar no Celular
1. Baixe o APK gerado
2. Instale no celular
3. Permita "Fontes desconhecidas"

## 🎨 Design

- **Cores**: Amarelo Industrial (#f59e0b) + Azul Escuro (#0f172a)
- **Interface**: Simples e touch-friendly
- **Botões grandes**: Fácil de usar em campo
- **Fotos em full screen**: Ao capturar

## 📊 Dados Salvos

Checklist salvo com:
- `vehicle_id`: ID do veículo
- `driver_id`: ID do motorista
- `type`: MAINTENANCE ou LOADING
- `items`: Array com { name, status, photo (base64) }
- `status`: PENDING (aguardando aprovação)

## ✨ Próximos Passos

- [ ] Modo offline
- [ ] Histórico de checklists
- [ ] Push notifications
- [ ] Assinatura digital

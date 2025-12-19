import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChecklistTypeScreen from './screens/ChecklistTypeScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import HistoryScreen from './screens/HistoryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [driver, setDriver] = useState(null);
  const [checklistType, setChecklistType] = useState(null);
  const [checklistVehicles, setChecklistVehicles] = useState([]);

  const handleLogin = (driverData) => {
    setDriver(driverData);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setDriver(null);
    setCurrentScreen('login');
  };

  const handleNewChecklist = () => {
    setCurrentScreen('checklistType');
  };

  const handleHistory = () => {
    setCurrentScreen('history');
  };

  const handleTypeSelected = (type, vehicles) => {
    setChecklistType(type);
    setChecklistVehicles(vehicles);
    setCurrentScreen('checklist');
  };

  const handleChecklistComplete = () => {
    Alert.alert(
      'Sucesso! ✓',
      'Checklist enviado com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => {
            setChecklistType(null);
            setChecklistVehicles([]);
            setCurrentScreen('home');
          }
        }
      ]
    );
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          driver={driver}
          onLogout={handleLogout}
          onNewChecklist={handleNewChecklist}
          onHistory={handleHistory}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryScreen
          driver={driver}
          onBack={handleBackToHome}
        />
      )}

      {currentScreen === 'checklistType' && (
        <ChecklistTypeScreen
          driver={driver}
          onBack={handleBackToHome}
          onTypeSelected={handleTypeSelected}
        />
      )}

      {currentScreen === 'checklist' && (
        <ChecklistScreen
          driver={driver}
          type={checklistType}
          vehicles={checklistVehicles}
          onBack={() => setCurrentScreen('checklistType')}
          onComplete={handleChecklistComplete}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

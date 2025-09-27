import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface ProfileDebuggerProps {
  onClose: () => void;
}

const ProfileDebugger: React.FC<ProfileDebuggerProps> = ({ onClose }) => {
  const { user, getUserId } = useCurrentUser();
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDebugTest = async () => {
    try {
      const userId = getUserId();
      const debugData = {
        userObject: user,
        extractedUserId: userId,
        timestamp: new Date().toISOString(),
      };

      // Test profile fetch
      const response = await fetch(`http://192.168.176.11:5001/caregiverProfile/${userId}`);
      const responseData = await response.json();
      
      const fullDebugInfo = {
        ...debugData,
        profileFetchStatus: response.status,
        profileFetchData: responseData,
        profileExists: response.ok,
      };

      setDebugInfo(JSON.stringify(fullDebugInfo, null, 2));
    } catch (error) {
      setDebugInfo(`Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Debugger</Text>
      
      <TouchableOpacity style={styles.button} onPress={runDebugTest}>
        <Text style={styles.buttonText}>Run Debug Test</Text>
      </TouchableOpacity>
      
      {debugInfo ? (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Information:</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  debugContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ProfileDebugger;

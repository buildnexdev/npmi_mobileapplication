import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../styles/theme';

export const QrScannerScreen: React.FC = () => {
  const [scanning, setScanning] = useState(true);

  const simulateScan = () => {
    Alert.alert(
      "Member Verified!",
      "Name: John Doe Member\nID: ORG-2026-000003\nStatus: APPROVED\nDistrict: Central Capital",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member QR Camera Scanner</Text>
      <Text style={styles.subtitle}>Align member QR code inside frame to verify identity</Text>

      <View style={styles.cameraFrame}>
        <View style={styles.scanTarget} />
        <Text style={styles.frameText}>Camera Preview Active</Text>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={simulateScan}>
        <Text style={styles.scanBtnText}>Simulate QR Code Scan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 30, textAlign: 'center' },
  cameraFrame: { width: 260, height: 260, borderWidth: 2, borderColor: theme.colors.accentGold, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  scanTarget: { width: 200, height: 200, borderWidth: 1, borderColor: '#FFF', borderStyle: 'dashed' },
  frameText: { color: '#9CA3AF', marginTop: 12, fontSize: 12 },
  scanBtn: { marginTop: 40, backgroundColor: theme.colors.accentGold, paddingVertical: 14, paddingHorizontal: 36, borderRadius: 10 },
  scanBtnText: { color: theme.colors.primaryMaroonDark, fontWeight: '800', fontSize: 14 },
});

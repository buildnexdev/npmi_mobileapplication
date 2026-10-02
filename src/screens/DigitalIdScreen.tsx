import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '../styles/theme';

export const DigitalIdScreen: React.FC = () => {
  const [showBack, setShowBack] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Digital Identity Card</Text>
      
      {!showBack ? (
        // FRONT OF DIGITAL ID CARD
        <View style={styles.idCardFront}>
          <Text style={styles.brandTitle}>COMMUNITY PLATFORM</Text>
          <Text style={styles.subTitle}>VERIFIED MEMBER IDENTIFICATION</Text>
          
          <View style={styles.profileRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }}
              style={styles.profileImg}
            />
            <View>
              <Text style={styles.memberName}>John Doe Member</Text>
              <Text style={styles.memberId}>ORG-2026-000003</Text>
              <Text style={styles.memberRole}>Life Member</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.label}>DISTRICT</Text>
              <Text style={styles.val}>Central Capital</Text>
            </View>
            <View>
              <Text style={styles.label}>STATUS</Text>
              <Text style={styles.valGreen}>APPROVED</Text>
            </View>
          </View>
        </View>
      ) : (
        // BACK OF DIGITAL ID CARD
        <View style={styles.idCardBack}>
          <Text style={styles.backTitle}>TERMS & VERIFICATION</Text>
          <Text style={styles.backBody}>
            This digital ID card is issued for official organizational identity verification. Scan the embedded QR code to access public identity records.
          </Text>
          <Text style={styles.backContact}>Helpline: +1 (800) 555-0199 | contact@orgplatform.org</Text>
        </View>
      )}

      <TouchableOpacity style={styles.flipBtn} onPress={() => setShowBack(!showBack)}>
        <Text style={styles.flipBtnText}>Flip Card ({showBack ? 'Front View' : 'Back View'})</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundLight, padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.primaryMaroon, marginBottom: 20 },
  idCardFront: { width: '100%', backgroundColor: theme.colors.primaryMaroonDark, padding: 24, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.accentGold },
  brandTitle: { color: theme.colors.accentGold, fontWeight: '800', fontSize: 16 },
  subTitle: { color: '#FFF', fontSize: 10, letterSpacing: 1, marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  profileImg: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: theme.colors.accentGold },
  memberName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  memberId: { color: theme.colors.accentGold, fontSize: 14, fontWeight: '700' },
  memberRole: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12 },
  label: { color: theme.colors.accentGold, fontSize: 9, fontWeight: '700' },
  val: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  valGreen: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  idCardBack: { width: '100%', backgroundColor: '#111827', padding: 24, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.accentGold },
  backTitle: { color: theme.colors.accentGold, fontWeight: '800', fontSize: 14, marginBottom: 12 },
  backBody: { color: '#9CA3AF', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  backContact: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  flipBtn: { marginTop: 24, backgroundColor: theme.colors.primaryMaroon, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  flipBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});

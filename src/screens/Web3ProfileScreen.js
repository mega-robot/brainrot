import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useTokens } from '../context/TokenContext';
import { useAlert } from '../context/AlertContext';

const Web3ProfileScreen = ({ navigation }) => {
  const { tokens, walletConnected, walletAddress, connectWallet, disconnectWallet } = useTokens();
  const showAlert = useAlert();

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>My Profile 🪪</Text>
        <Text style={globalStyles.subtitle}>Manage your identity and Web3 connected wallet.</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
           <Text style={styles.avatarEmoji}>{walletConnected ? '👻' : '👤'}</Text>
        </View>
        
        {walletConnected ? (
          <>
            <Text style={styles.userName}>Anon_Ph4nt0m</Text>
            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>🟢 {walletAddress}</Text>
            </View>
            <Text style={styles.tokenBalance}>{tokens} ✨ Focus Tokens</Text>
            
            <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectWallet}>
              <Text style={styles.disconnectBtnText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.guestSub}>Connect wallet to mint your focus into real assets.</Text>
            
            <TouchableOpacity style={styles.connectBtn} onPress={connectWallet}>
              <Text style={styles.connectBtnText}>Connect Phantom Wallet 👻</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Portfolio Stats Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Portfolio 📊</Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{(tokens * 0.0012).toFixed(4)}</Text>
          <Text style={styles.statLabel}>Est. ETH Value</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{walletConnected ? '3' : '0'}</Text>
          <Text style={styles.statLabel}>NFT Badges</Text>
        </View>
      </View>

      {/* Action Links */}
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Vent')}>
          <View style={styles.linkIconBox}><Text>☁️</Text></View>
          <Text style={styles.linkText}>Private Vent Space</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkRow} 
          onPress={() => showAlert("Coming Soon", "You can soon export your focus data to Arweave!")}
        >
          <View style={styles.linkIconBox}><Text>📦</Text></View>
          <Text style={styles.linkText}>Export Data (Decentralized)</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFEBF5',
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD1E8',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: colors.accent,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  addressBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  addressText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tokenBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  guestSub: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  connectBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: colors.shadow,
    elevation: 5,
  },
  connectBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disconnectBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: '#FFD1E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  disconnectBtnText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 3,
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'extrabold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  linksContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 3,
  },
  linkIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  linkArrow: {
    fontSize: 20,
    color: colors.textLight,
  }
});

export default Web3ProfileScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const RewardsScreen = () => {
  const { tokens, spendTokens } = useTokens();
  const [useWallet, setUseWallet] = useState(false);
  const showAlert = useAlert();

  const rewards = [
    { id: '1', title: 'Unlock Pastel Hat 🧢', cost: 50 },
    { id: '2', title: 'Focus Badge 🎖️', cost: 100 },
    { id: '3', title: 'Premium Customization Themes ✨', cost: 500 },
  ];

  const handlePurchase = (item) => {
    if (tokens >= item.cost) {
      showAlert(
        "Unlock Reward? 🎁",
        `Do you want to spend ${item.cost} tokens on ${item.title}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes!", onPress: () => {
             spendTokens(item.cost);
             showAlert("Success! 🎒", `You have successfully bought ${item.title}!`);
          }}
        ]
      );
    } else {
      showAlert("Not enough tokens!", "Keep focusing to earn more! 🌙");
    }
  };

  const toggleWallet = (value) => {
    setUseWallet(value);
    if (value) {
      showAlert("Connect Wallet 🪙", "A MetaMask prompt would pop up here. Your tokens will be minted to on-chain XP.");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Rewards Store 🎁</Text>
      </View>

      <View style={styles.tokenCard}>
        <Text style={styles.tokenTitle}>Your Focus Tokens</Text>
        <Text style={styles.tokenAmount}>{tokens} 🍒</Text>
      </View>

      <View style={styles.walletContainer}>
        <Text style={styles.walletText}>Enable Web3 Wallet Identity (Optional)</Text>
        <Switch
          value={useWallet}
          onValueChange={toggleWallet}
          trackColor={{ false: colors.textLight, true: colors.success }}
          thumbColor={colors.white}
        />
      </View>

      <FlatList
        data={rewards}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text style={styles.rewardTitle}>{item.title}</Text>
            <TouchableOpacity 
              style={[styles.buyBtn, tokens < item.cost && styles.buyBtnDisabled]}
              onPress={() => handlePurchase(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>{item.cost} Tokens</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tokenCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    shadowColor: colors.shadow,
    elevation: 8,
    marginBottom: 20,
  },
  tokenTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tokenAmount: {
    color: colors.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  walletText: {
    ...globalStyles.subtitle,
    flex: 1,
  },
  rewardTitle: {
    ...globalStyles.subtitle,
    fontSize: 18,
    color: colors.text,
    marginBottom: 15,
  },
  buyBtn: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: colors.textLight,
  },
  buyBtnText: {
    color: colors.white,
    fontWeight: 'bold',
  }
});

export default RewardsScreen;

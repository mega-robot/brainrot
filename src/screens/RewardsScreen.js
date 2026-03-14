import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const RewardsScreen = () => {
  const { tokens, spendTokens } = useTokens();
  const [activeTab, setActiveTab] = useState('NFT Treasury 🖼️');
  const [walletConnected, setWalletConnected] = useState(false);
  const showAlert = useAlert();

  const [achievements, setAchievements] = useState([
    { id: '1', title: 'First Focus Session ✨', desc: 'Completed your first focus session.', cost: 0, unlocked: true },
    { id: '2', title: 'Doomscroll Breaker 🛡️', desc: 'Survived your first intervention.', cost: 50, unlocked: false },
    { id: '3', title: '7 Day Streak 🔥', desc: 'Focused every day for a week.', cost: 150, unlocked: false },
    { id: '4', title: 'Squad Champion 🤝', desc: 'Completed a squad focus without failing.', cost: 200, unlocked: false },
    { id: '5', title: 'Deep Work Master 🕰️', desc: 'Reached 50 hours of total focus.', cost: 1000, unlocked: false },
  ]);

  const [digitalGoods, setDigitalGoods] = useState([
    { id: '101', title: 'ADHD Life Planner 📓', desc: 'A beautiful printable PDF to organize your day.', cost: 200, link: 'https://example.com/planner', unlocked: false },
    { id: '102', title: 'Notion Habit Tracker 📊', desc: 'Minimalist habit tracking template for Notion.', cost: 350, link: 'https://example.com/notion', unlocked: false },
    { id: '103', title: 'Dopamine Detox Guide 🌿', desc: 'A step-by-step eBook to reset your brain.', cost: 500, link: 'https://example.com/ebook', unlocked: false },
  ]);

  const [courses, setCourses] = useState([
    { id: '201', title: '50% Off UX Design Course 🎨', desc: 'Master UI/UX with this exclusive discount.', cost: 800, link: 'https://example.com/ux-course', unlocked: false },
    { id: '202', title: 'Intro to Python (Free Access) 🐍', desc: 'Unlock a premium beginner python course.', cost: 1200, link: 'https://example.com/python', unlocked: false },
    { id: '203', title: 'Learn Spanish (1 Mo Free) 🇪🇸', desc: '30 days premium access to language learning app.', cost: 1500, link: 'https://example.com/spanish', unlocked: false },
  ]);

  const handlePurchase = (item, type) => {
    if (tokens >= item.cost) {
      showAlert(
        "Unlock Reward? 🎁",
        `Do you want to spend ${item.cost} tokens on ${item.title}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: () => {
             const success = spendTokens(item.cost);
             if (type !== 'achievement') {
               showAlert("Success! 🎉", "Your reward is unlocked! Taking you to your download/discount page...", [
                 { text: "Go to Reward", onPress: () => Linking.openURL(item.link) },
                 { text: "Close", style: "cancel" }
               ]);
               if (type === 'digital') {
                 setDigitalGoods(items => items.map(d => d.id === item.id ? { ...d, unlocked: true } : d));
               } else if (type === 'course') {
                 setCourses(items => items.map(c => c.id === item.id ? { ...c, unlocked: true } : c));
               }
             } else {
               const mintMsg = walletConnected 
                 ? "You have successfully minted this rare NFT achievement to your Web3 wallet address! 🔗" 
                 : "You have unlocked this badge! Connect your Web3 wallet later to mint it as an NFT.";
               showAlert("Success! 🏅", mintMsg);
               setAchievements(items => items.map(a => a.id === item.id ? { ...a, unlocked: true } : a));
             }
          }}
        ]
      );
    } else {
      showAlert("Not enough tokens!", `You need ${item.cost - tokens} more tokens. Keep focusing to earn more! 🌙`);
    }
  };

  const renderItem = ({ item }, type) => (
    <View style={globalStyles.card}>
      <Text style={styles.rewardTitle}>{item.title}</Text>
      <Text style={styles.rewardDesc}>{item.desc}</Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.costBadge}>{item.cost === 0 ? "Free" : `${item.cost} Tokens`}</Text>
        <TouchableOpacity 
          style={[styles.buyBtn, tokens < item.cost && styles.buyBtnDisabled, item.unlocked && styles.unlockedBtn]}
          onPress={() => item.unlocked ? null : handlePurchase(item, type)}
          activeOpacity={0.8}
          disabled={item.unlocked}
        >
          <Text style={styles.buyBtnText}>
            {item.unlocked ? "Unlocked ✅" : (tokens >= item.cost ? "Redeem" : "Locked 🔒")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const connectWallet = () => {
    showAlert(
      "Connect Web3 Wallet 🦊",
      "Connect your identity to mint achievements as On-Chain NFTs and store your Focus Tokens securely.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Connect MetaMask", onPress: () => {
           setWalletConnected(true);
           showAlert("Wallet Linked! 🔗", "Connected account: 0x8F9a...2B1c. Ready to mint NFTs!");
        }}
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>The Market 🎁</Text>
      </View>

      <View style={styles.web3Card}>
        <View style={styles.web3HeaderRow}>
           <Text style={styles.tokenTitle}>Soulbound Tokens 🪙</Text>
           {walletConnected ? (
             <View style={styles.connectedBadge}>
               <Text style={styles.connectedText}>🟢 0x8F9a...2B1c</Text>
             </View>
           ) : (
             <TouchableOpacity style={styles.connectBtn} onPress={connectWallet}>
               <Text style={styles.connectBtnText}>Connect Phantom 👻</Text>
             </TouchableOpacity>
           )}
        </View>
        <Text style={styles.tokenAmount}>{tokens} ✨</Text>
        
        {walletConnected && (
          <View style={styles.onChainStats}>
            <Text style={styles.onChainText}>Estimated Value: {(tokens * 0.0012).toFixed(4)} ETH</Text>
            <TouchableOpacity style={styles.stakeBtn} onPress={() => showAlert("Staking Locked 🔒", "Coming soon! Stake your tokens to earn yield while you focus.")}>
              <Text style={styles.stakeBtnText}>Stake Tokens</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['NFT Treasury 🖼️', 'Digital Goods', 'Courses'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'NFT Treasury 🖼️' && (
        <FlatList
          data={achievements}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={(props) => renderItem(props, 'achievement')}
        />
      )}

      {activeTab === 'Digital Goods' && (
        <FlatList
          data={digitalGoods}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={(props) => renderItem(props, 'digital')}
        />
      )}

      {activeTab === 'Courses' && (
        <FlatList
          data={courses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={(props) => renderItem(props, 'course')}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  web3Card: {
    backgroundColor: '#FFEBF5',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD1E8',
  },
  web3HeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: colors.shadow,
    elevation: 3,
  },
  connectBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  connectedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.success,
  },
  connectedText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tokenAmount: {
    color: colors.primary,
    fontSize: 44,
    fontWeight: 'extrabold',
    marginTop: 5,
  },
  onChainStats: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFD1E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onChainText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  stakeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  stakeBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tabsContainer: {
    marginBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  activeTabBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.white,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  rewardDesc: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 15,
  },
  costBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  buyBtn: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#EEEEEE',
  },
  unlockedBtn: {
    backgroundColor: colors.primary,
  },
  buyBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default RewardsScreen;

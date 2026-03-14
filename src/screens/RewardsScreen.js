import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { colors, globalStyles } from '../theme';
import { useAlert } from '../context/AlertContext';
import { useTokens } from '../context/TokenContext';

const RewardsScreen = () => {
  const { tokens, spendTokens } = useTokens();
  const [activeTab, setActiveTab] = useState('Achievements');
  const showAlert = useAlert();

  const achievements = [
    { id: '1', title: 'First Focus Session ✨', desc: 'Completed your first focus session.', cost: 0, unlocked: true },
    { id: '2', title: 'Doomscroll Breaker 🛡️', desc: 'Survived your first intervention.', cost: 50, unlocked: false },
    { id: '3', title: '7 Day Streak 🔥', desc: 'Focused every day for a week.', cost: 150, unlocked: false },
    { id: '4', title: 'Squad Champion 🤝', desc: 'Completed a squad focus without failing.', cost: 200, unlocked: false },
    { id: '5', title: 'Deep Work Master 🕰️', desc: 'Reached 50 hours of total focus.', cost: 1000, unlocked: false },
  ];

  const digitalGoods = [
    { id: '101', title: 'ADHD Life Planner 📓', desc: 'A beautiful printable PDF to organize your day.', cost: 200, link: 'https://example.com/planner' },
    { id: '102', title: 'Notion Habit Tracker 📊', desc: 'Minimalist habit tracking template for Notion.', cost: 350, link: 'https://example.com/notion' },
    { id: '103', title: 'Dopamine Detox Guide 🌿', desc: 'A step-by-step eBook to reset your brain.', cost: 500, link: 'https://example.com/ebook' },
  ];

  const courses = [
    { id: '201', title: '50% Off UX Design Course 🎨', desc: 'Master UI/UX with this exclusive discount.', cost: 800, link: 'https://example.com/ux-course' },
    { id: '202', title: 'Intro to Python (Free Access) 🐍', desc: 'Unlock a premium beginner python course.', cost: 1200, link: 'https://example.com/python' },
    { id: '203', title: 'Learn Spanish (1 Mo Free) 🇪🇸', desc: '30 days premium access to language learning app.', cost: 1500, link: 'https://example.com/spanish' },
  ];

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
             } else {
               showAlert("Success! 🏅", "You have officially minted this achievement to your profile!");
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

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>The Market 🎁</Text>
      </View>

      <View style={styles.tokenCard}>
        <Text style={styles.tokenTitle}>Your Focus Tokens</Text>
        <Text style={styles.tokenAmount}>{tokens} 🍒</Text>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['Achievements', 'Digital Goods', 'Courses'].map(tab => (
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

      {activeTab === 'Achievements' && (
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

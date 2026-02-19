import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { setOnboardingComplete } from '../src/utils/storage';
import { Colors } from '../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function OnboardingScreen1() {
  const [counter, setCounter] = useState(0);
  const values = [0, 0.01, 0.02, 0.05, 0.12, 0.31, 0.85, 2.14, 5.67, 14.23, 35.89, 87.45, 198.67, 338.00, 512.34, 847.20];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % values.length;
      setCounter(values[idx]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.screenContent}>
      <Text testID="onboarding-counter" style={styles.heroCounter}>
        ${counter.toFixed(2)}
      </Text>
      <Text style={styles.headline}>Every Second Costs Money</Text>
      <Text style={styles.subtext}>
        The average meeting costs $338. Most people have no idea.
      </Text>
    </View>
  );
}

function OnboardingScreen2() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(anim1, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(anim2, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(anim3, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const items = [
    { icon: 'people' as const, text: 'Add people', anim: anim1 },
    { icon: 'cash' as const, text: 'Set salary', anim: anim2 },
    { icon: 'play' as const, text: 'Start timer', anim: anim3 },
  ];

  return (
    <View style={styles.screenContent}>
      <View style={styles.iconList}>
        {items.map((item, i) => (
          <Animated.View
            key={i}
            style={[
              styles.iconRow,
              {
                opacity: item.anim,
                transform: [
                  { translateX: item.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={24} color={Colors.fireRed} />
            </View>
            <Text style={styles.iconText}>{item.text}</Text>
          </Animated.View>
        ))}
      </View>
      <Text style={styles.headline}>Setup in 10 Seconds</Text>
      <Text style={styles.subtext}>
        No account. No login. Just tap and burn.
      </Text>
    </View>
  );
}

function OnboardingScreen3() {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.screenContent}>
      <Animated.View
        style={[
          styles.receiptCard,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.receiptDivider}>─── MEETING RECEIPT ───</Text>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Duration:</Text>
          <Text style={styles.receiptValue}>47 min</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Attendees:</Text>
          <Text style={styles.receiptValue}>6 people</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Total Cost:</Text>
          <Text style={styles.receiptCost}>$847.20</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Per Person:</Text>
          <Text style={styles.receiptValue}>$141.20</Text>
        </View>
        <Text style={styles.receiptDivider}>──────── END ────────</Text>
      </Animated.View>
      <Text style={styles.headline}>Share the Damage</Text>
      <Text style={styles.subtext}>
        Generate a meeting receipt. Share it. Start a revolution.
      </Text>
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const screens = [OnboardingScreen1, OnboardingScreen2, OnboardingScreen3];

  const handleComplete = async () => {
    await setOnboardingComplete();
    router.replace('/home');
  };

  const handleNext = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const CurrentScreen = screens[currentPage];

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {currentPage < 2 && (
          <TouchableOpacity testID="skip-onboarding-btn" onPress={handleComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.screenContainer}>
        <CurrentScreen />
      </View>

      {/* Page dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentPage ? Colors.primaryText : Colors.pageDotInactive },
            ]}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          testID="onboarding-next-btn"
          style={[
            styles.ctaButton,
            currentPage === 2 && styles.ctaButtonFinal,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>
            {currentPage === 2 ? 'Start Burning →' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    paddingTop: 60,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    height: 44,
    justifyContent: 'center',
  },
  skipText: {
    color: Colors.secondaryText,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  screenContent: {
    alignItems: 'center',
  },
  heroCounter: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    fontSize: 56,
    color: Colors.fireRed,
    marginBottom: 40,
    fontVariant: ['tabular-nums'],
  },
  iconList: {
    marginBottom: 40,
    alignSelf: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    color: Colors.primaryText,
    fontSize: 18,
    fontWeight: '500',
  },
  receiptCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  receiptDivider: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: Colors.tertiaryText,
    textAlign: 'center',
    marginVertical: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.secondaryText,
  },
  receiptValue: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  receiptCost: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.fireRed,
    fontWeight: 'bold',
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  ctaButton: {
    backgroundColor: Colors.inputField,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonFinal: {
    backgroundColor: Colors.fireRed,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primaryText,
  },
});

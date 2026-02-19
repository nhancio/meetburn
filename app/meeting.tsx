import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { CURRENCIES, COST_MILESTONES } from '../src/constants/currencies';
import { calculateMeetingRate, formatCurrency, formatDuration } from '../src/utils/calculator';
import ConfirmModal from '../src/components/ConfirmModal';
import { getSettings } from '../src/utils/storage';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export default function MeetingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ people: string; salary: string; currency: string; companyName?: string; hostedBy?: string }>();

  const [numPeople, setNumPeople] = useState(parseInt(params.people || '5', 10));
  const [salary] = useState(parseInt(params.salary || '75000', 10));
  const [currencyCode] = useState(params.currency || 'USD');
  const [companyName] = useState(params.companyName || '');
  const [hostedBy] = useState(params.hostedBy || '');
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [pauseVisible, setPauseVisible] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [settings, setSettings] = useState<{ milestoneAlerts: boolean; hapticFeedback: boolean; keepScreenAwake: boolean }>({
    milestoneAlerts: true,
    hapticFeedback: true,
    keepScreenAwake: true,
  });

  const startTimeRef = useRef(Date.now());
  const pausedDurationRef = useRef(0);
  const lastPauseTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const milestoneHitRef = useRef<Set<number>>(new Set());
  const milestoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currencyObj = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const rate = calculateMeetingRate(numPeople, salary);

  const keepAwakeRef = useRef(false);

  useEffect(() => {
    loadSettings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (keepAwakeRef.current) {
        try { deactivateKeepAwake(); } catch {}
      }
    };
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings({
      milestoneAlerts: s.milestoneAlerts,
      hapticFeedback: s.hapticFeedback,
      keepScreenAwake: s.keepScreenAwake,
    });
    if (s.keepScreenAwake) {
      try {
        await activateKeepAwakeAsync();
        keepAwakeRef.current = true;
      } catch {}
    }
  };

  // Timer tick
  useEffect(() => {
    let interval: number;
    if (!isPaused) {
      const tickRate = 100; // 10x per sec (smooth)
      interval = setInterval(() => {
        const now = Date.now();
        const totalElapsed = (now - startTimeRef.current - pausedDurationRef.current) / 1000;
        const clampedElapsed = Math.max(0, totalElapsed);
        setElapsedSeconds(clampedElapsed);
        const cost = rate.costPerSecond * clampedElapsed;
        setTotalCost(cost);

        // Check milestones
        if (settings.milestoneAlerts) {
          for (const ms of COST_MILESTONES) {
            if (cost >= ms && !milestoneHitRef.current.has(ms)) {
              milestoneHitRef.current.add(ms);
              setMilestone(`${currencyObj.symbol}${ms.toLocaleString()} burned!`);
              if (settings.hapticFeedback) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              if (milestoneTimeoutRef.current) clearTimeout(milestoneTimeoutRef.current);
              milestoneTimeoutRef.current = setTimeout(() => setMilestone(null), 2000);
            }
          }
        }
      }, tickRate) as unknown as number;
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPaused, numPeople, settings.milestoneAlerts, rate.costPerSecond]);

  // Pause blink
  useEffect(() => {
    if (!isPaused) {
      setPauseVisible(true);
      return;
    }
    const blink = setInterval(() => {
      setPauseVisible(prev => !prev);
    }, 500);
    return () => clearInterval(blink);
  }, [isPaused]);

  const togglePause = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isPaused) {
      // Resuming
      pausedDurationRef.current += Date.now() - lastPauseTimeRef.current;
      setIsPaused(false);
    } else {
      // Pausing
      lastPauseTimeRef.current = Date.now();
      setIsPaused(true);
    }
  };

  const adjustPerson = (delta: number) => {
    const newCount = Math.max(1, Math.min(50, numPeople + delta));
    if (newCount !== numPeople) {
      setNumPeople(newCount);
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleEndMeeting = () => {
    setShowEndConfirm(true);
  };

  const confirmEndMeeting = () => {
    setShowEndConfirm(false);
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (keepAwakeRef.current) {
      try { deactivateKeepAwake(); keepAwakeRef.current = false; } catch {}
    }
    router.replace({
      pathname: '/receipt',
      params: {
        people: numPeople.toString(),
        salary: salary.toString(),
        currency: currencyCode,
        duration: Math.floor(elapsedSeconds).toString(),
        totalCost: totalCost.toFixed(2),
        isNew: 'true',
        companyName: companyName,
        hostedBy: hostedBy,
      },
    });
  };

  // Background color based on cost
  const getBgColor = () => {
    if (isPaused) return Colors.primaryBg;
    if (totalCost >= 5000) return Colors.bg5000;
    if (totalCost >= 1000) return Colors.bg1000;
    if (totalCost >= 500) return Colors.bg500;
    if (totalCost >= 100) return Colors.bg100;
    return Colors.primaryBg;
  };

  // Format cost parts
  const costStr = totalCost.toFixed(2);
  const dotIdx = costStr.indexOf('.');
  const dollars = Math.floor(totalCost).toLocaleString('en-US');
  const cents = costStr.slice(dotIdx + 1);

  const updatedRate = calculateMeetingRate(numPeople, salary);

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft} />
          <Text style={styles.meetingInfo}>
            {numPeople} people · {currencyObj.symbol}{(salary / 1000).toFixed(0)}K avg
          </Text>
          <TouchableOpacity testID="end-meeting-top-btn" onPress={handleEndMeeting}>
            <Text style={styles.endText}>End Meeting</Text>
          </TouchableOpacity>
        </View>

        {/* Milestone banner */}
        {milestone && (
          <View testID="milestone-banner" style={styles.milestoneBanner}>
            <Text style={styles.milestoneText}>{milestone}</Text>
          </View>
        )}

        {/* Hero Cost Counter */}
        <View style={styles.heroContainer}>
          {isPaused && (
            <Text style={[styles.pausedLabel, { opacity: pauseVisible ? 1 : 0 }]}>
              PAUSED
            </Text>
          )}
          <View style={styles.costRow}>
            <Text testID="cost-symbol" style={styles.costSymbol}>{currencyObj.symbol}</Text>
            <Text testID="cost-dollars" style={styles.costDollars}>{dollars}</Text>
            <Text testID="cost-cents" style={styles.costCents}>.{cents}</Text>
          </View>
          <Text testID="burn-rate" style={styles.burnRate}>
            {currencyObj.symbol}{updatedRate.costPerSecond.toFixed(2)}/sec
          </Text>
          <Text testID="timer-display" style={styles.timerDisplay}>
            {formatDuration(elapsedSeconds)}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controlBar}>
          {/* Pause/Resume */}
          <TouchableOpacity
            testID="pause-resume-btn"
            style={[styles.controlBtn, isPaused && styles.controlBtnPaused]}
            onPress={togglePause}
          >
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={28}
              color={isPaused ? Colors.fireRed : Colors.primaryText}
            />
          </TouchableOpacity>

          {/* Add/Remove Person */}
          <View style={styles.personAdjust}>
            <TouchableOpacity
              testID="remove-person-btn"
              style={styles.personBtn}
              onPress={() => adjustPerson(-1)}
            >
              <Ionicons name="person-remove" size={20} color={Colors.primaryText} />
            </TouchableOpacity>
            <Text style={styles.personCount}>{numPeople}</Text>
            <TouchableOpacity
              testID="add-person-btn"
              style={styles.personBtn}
              onPress={() => adjustPerson(1)}
            >
              <Ionicons name="person-add" size={20} color={Colors.primaryText} />
            </TouchableOpacity>
          </View>

          {/* End Meeting */}
          <TouchableOpacity
            testID="end-meeting-btn"
            style={styles.endBtn}
            onPress={handleEndMeeting}
          >
            <Ionicons name="stop" size={28} color={Colors.primaryBg} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ConfirmModal
        visible={showEndConfirm}
        title="End this meeting?"
        message={`Total cost so far: ${formatCurrency(totalCost, currencyObj.symbol)}`}
        confirmText="End Meeting"
        cancelText="Keep Going"
        destructive
        onConfirm={confirmEndMeeting}
        onCancel={() => setShowEndConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarLeft: {
    width: 80,
  },
  meetingInfo: {
    fontSize: 12,
    color: Colors.tertiaryText,
  },
  endText: {
    fontSize: 15,
    color: Colors.fireRed,
    fontWeight: '600',
  },
  milestoneBanner: {
    backgroundColor: Colors.elevatedSurface,
    marginHorizontal: 40,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 16,
    color: Colors.fireRed,
    fontWeight: 'bold',
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pausedLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    letterSpacing: 4,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  costSymbol: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    fontSize: 36,
    color: Colors.fireRed,
    marginTop: 8,
  },
  costDollars: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    fontSize: 72,
    color: Colors.fireRed,
    fontVariant: ['tabular-nums'],
  },
  costCents: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    fontSize: 36,
    color: Colors.fireRed,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  burnRate: {
    fontFamily: 'Courier',
    fontSize: 20,
    color: Colors.fireRed,
    opacity: 0.6,
    marginTop: 8,
    fontWeight: '500',
  },
  timerDisplay: {
    fontFamily: 'Courier',
    fontSize: 24,
    color: Colors.tertiaryText,
    marginTop: 16,
    fontVariant: ['tabular-nums'],
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 16,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.inputField,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnPaused: {
    borderWidth: 1,
    borderColor: Colors.fireRed,
  },
  personAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.inputField,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personCount: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: Colors.primaryText,
    fontWeight: 'bold',
    marginHorizontal: 12,
    fontVariant: ['tabular-nums'],
  },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.fireRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

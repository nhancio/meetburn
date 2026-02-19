import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { getSavedMeetings, deleteMeeting, SavedMeeting } from '../src/utils/storage';
import { formatCurrency, formatDurationShort } from '../src/utils/calculator';
import { CURRENCIES } from '../src/constants/currencies';
import ConfirmModal from '../src/components/ConfirmModal';
import * as Haptics from 'expo-haptics';

const logoImage = require('../assets/images/meetburn-icon.png');

export default function HomeScreen() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<SavedMeeting[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadMeetings();
    }, [])
  );

  const loadMeetings = async () => {
    const data = await getSavedMeetings();
    setMeetings(data);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await deleteMeeting(deleteId);
      setDeleteId(null);
      loadMeetings();
    }
  };

  const getWeekMeetings = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return meetings.filter(m => new Date(m.date) >= startOfWeek);
  };

  const weekMeetings = getWeekMeetings();
  const weekTotal = weekMeetings.reduce((sum, m) => sum + m.totalCost, 0);
  const recentMeetings = meetings.slice(0, 10);

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={logoImage} style={styles.appIconImage} resizeMode="contain" />
            <View>
              <Text style={styles.appTitle}>MeetBurn</Text>
              <Text style={styles.appTagline}>Watch your money burn.</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="settings-btn"
            onPress={() => router.push('/settings')}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Quick Start Card */}
        <TouchableOpacity
          testID="new-meeting-btn"
          style={styles.quickStartCard}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/setup');
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.quickStartLabel}>NEW MEETING</Text>
          <View style={styles.quickStartIconContainer}>
            <Ionicons name="add" size={48} color={Colors.primaryText} />
          </View>
          <Text style={styles.quickStartHint}>Tap to start</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>THIS WEEK</Text>
            <Text style={styles.statValueRed}>{formatCurrency(weekTotal)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MEETINGS</Text>
            <Text style={styles.statValue}>{weekMeetings.length}</Text>
          </View>
        </View>

        {/* Recent Meetings */}
        {recentMeetings.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionLabel}>RECENT</Text>
            {recentMeetings.map((meeting) => (
              <TouchableOpacity
                key={meeting.id}
                testID={`meeting-item-${meeting.id}`}
                style={styles.meetingRow}
                onPress={() => router.push({ pathname: '/receipt', params: { meetingId: meeting.id } })}
                onLongPress={() => handleDelete(meeting.id)}
              >
                <View style={styles.meetingLeft}>
                  <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
                </View>
                <View style={styles.meetingCenter}>
                  <Text style={styles.meetingDuration}>
                    {formatDurationShort(meeting.durationSeconds)}
                  </Text>
                  <Text style={styles.meetingPeople}>
                    {meeting.numberOfPeople} people
                  </Text>
                </View>
                <Text style={styles.meetingCost}>
                  {formatCurrency(meeting.totalCost, getCurrencySymbol(meeting.currency))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recentMeetings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={48} color={Colors.tertiaryText} />
            <Text style={styles.emptyText}>No meetings yet</Text>
            <Text style={styles.emptySubtext}>Start your first meeting to see costs</Text>
          </View>
        )}
      </ScrollView>
      <ConfirmModal
        visible={!!deleteId}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting?"
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  appTagline: {
    fontSize: 12,
    color: Colors.tertiaryText,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  quickStartLabel: {
    fontSize: 12,
    color: Colors.fireRed,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickStartIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.inputField,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickStartHint: {
    fontSize: 14,
    color: Colors.tertiaryText,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.tertiaryText,
    letterSpacing: 2,
    marginBottom: 8,
  },
  statValueRed: {
    fontFamily: 'Courier',
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.fireRed,
  },
  statValue: {
    fontFamily: 'Courier',
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    color: Colors.tertiaryText,
    letterSpacing: 2,
    marginBottom: 12,
  },
  meetingRow: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  meetingLeft: {
    width: 56,
  },
  meetingDate: {
    fontSize: 14,
    color: Colors.tertiaryText,
  },
  meetingCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  meetingDuration: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: '600',
  },
  meetingPeople: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  meetingCost: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: Colors.fireRed,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.tertiaryText,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.mutedLabel,
    marginTop: 4,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, TextInput,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { CURRENCIES } from '../src/constants/currencies';
import {
  calculateMeetingRate, formatCurrency,
  calculateCostPerPerson, calculateMonthlyImpact,
} from '../src/utils/calculator';
import { saveMeeting, getSavedMeetings, SavedMeeting } from '../src/utils/storage';
import * as Haptics from 'expo-haptics';

export default function ReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    people?: string;
    salary?: string;
    currency?: string;
    duration?: string;
    totalCost?: string;
    isNew?: string;
    meetingId?: string;
    companyName?: string;
    hostedBy?: string;
  }>();

  const [meeting, setMeeting] = useState<{
    people: number;
    salary: number;
    currency: string;
    duration: number;
    totalCost: number;
    date: string;
    companyName: string;
    hostedBy: string;
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingHosted, setEditingHosted] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [hostedBy, setHostedBy] = useState('');

  useEffect(() => {
    loadMeetingData();
  }, []);

  const loadMeetingData = async () => {
    if (params.meetingId) {
      const meetings = await getSavedMeetings();
      const found = meetings.find(m => m.id === params.meetingId);
      if (found) {
        setMeeting({
          people: found.numberOfPeople,
          salary: found.averageSalary,
          currency: found.currency,
          duration: found.durationSeconds,
          totalCost: found.totalCost,
          date: found.date,
          companyName: found.companyName || '',
          hostedBy: found.hostedBy || '',
        });
        setCompanyName(found.companyName || '');
        setHostedBy(found.hostedBy || '');
        setSaved(true);
      }
    } else if (params.isNew === 'true') {
      const cn = params.companyName || '';
      const hb = params.hostedBy || '';
      setMeeting({
        people: parseInt(params.people || '5', 10),
        salary: parseInt(params.salary || '75000', 10),
        currency: params.currency || 'USD',
        duration: parseInt(params.duration || '0', 10),
        totalCost: parseFloat(params.totalCost || '0'),
        date: new Date().toISOString(),
        companyName: cn,
        hostedBy: hb,
      });
      setCompanyName(cn);
      setHostedBy(hb);
    }
  };

  if (!meeting) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </View>
    );
  }

  const currencyObj = CURRENCIES.find(c => c.code === meeting.currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;
  const rate = calculateMeetingRate(meeting.people, meeting.salary);
  const perPerson = calculateCostPerPerson(meeting.totalCost, meeting.people);
  const monthlyImpact = calculateMonthlyImpact(meeting.totalCost);

  const meetingDate = new Date(meeting.date);
  const dateStr = meetingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const startTimeStr = meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endTime = new Date(meetingDate.getTime() + meeting.duration * 1000);
  const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const durationMin = Math.round(meeting.duration / 60);

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let receiptText = `─────────────────────────────
     🔥 MEETING RECEIPT 🔥
─────────────────────────────\n`;

    if (companyName) {
      receiptText += `\nCompany       ${companyName}`;
    }
    if (hostedBy) {
      receiptText += `\nHosted By     ${hostedBy}`;
    }
    if (companyName || hostedBy) {
      receiptText += `\n`;
    }

    receiptText += `
Date          ${dateStr}
Started       ${startTimeStr}
Ended         ${endTimeStr}

─────────────────────────────

Duration          ${durationMin} min
Attendees         ${meeting.people} people
Avg Salary        ${sym}${meeting.salary.toLocaleString()}/yr

─────────────────────────────

BURN RATE         ${sym}${rate.costPerSecond.toFixed(2)}/sec
                  ${sym}${rate.costPerMinute.toFixed(2)}/min

─────────────────────────────

💰 TOTAL COST     ${formatCurrency(meeting.totalCost, sym)}

Per Person        ${formatCurrency(perPerson, sym)}

─────────────────────────────

Monthly Impact*   ${formatCurrency(monthlyImpact, sym)}
  (if repeated weekly)

─────────────────────────────
     Powered by MeetBurn
─────────────────────────────`;

    try {
      await Share.share({ message: receiptText });
    } catch {}
  };

  const handleSave = async () => {
    if (saved) {
      router.replace('/home');
      return;
    }
    const meetingData: SavedMeeting = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      date: meeting.date,
      durationSeconds: meeting.duration,
      numberOfPeople: meeting.people,
      averageSalary: meeting.salary,
      totalCost: meeting.totalCost,
      currency: meeting.currency,
      currencySymbol: sym,
      companyName: companyName,
      hostedBy: hostedBy,
    };
    await saveMeeting(meetingData);
    setSaved(true);
    router.replace('/home');
  };

  const divider = '─────────────────────────';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Receipt Card */}
            <View style={styles.receiptCard}>
              <Text style={styles.receiptHeader}>🔥 MEETING RECEIPT 🔥</Text>
              <Text style={styles.divider}>{divider}</Text>

              {/* Company Name - Editable */}
              <TouchableOpacity
                testID="edit-company-btn"
                style={styles.editableRow}
                onPress={() => setEditingCompany(true)}
              >
                <Text style={styles.label}>Company</Text>
                {editingCompany ? (
                  <TextInput
                    testID="company-name-receipt-input"
                    style={styles.editInput}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Tap to add company"
                    placeholderTextColor={Colors.mutedLabel}
                    autoFocus
                    onBlur={() => setEditingCompany(false)}
                    onSubmitEditing={() => setEditingCompany(false)}
                    returnKeyType="done"
                  />
                ) : (
                  <View style={styles.editableValue}>
                    <Text style={companyName ? styles.value : styles.placeholderValue}>
                      {companyName || 'Tap to add'}
                    </Text>
                    <Ionicons name="pencil" size={12} color={Colors.tertiaryText} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Hosted By - Editable */}
              <TouchableOpacity
                testID="edit-hosted-btn"
                style={styles.editableRow}
                onPress={() => setEditingHosted(true)}
              >
                <Text style={styles.label}>Hosted By</Text>
                {editingHosted ? (
                  <TextInput
                    testID="hosted-by-receipt-input"
                    style={styles.editInput}
                    value={hostedBy}
                    onChangeText={setHostedBy}
                    placeholder="Tap to add host"
                    placeholderTextColor={Colors.mutedLabel}
                    autoFocus
                    onBlur={() => setEditingHosted(false)}
                    onSubmitEditing={() => setEditingHosted(false)}
                    returnKeyType="done"
                  />
                ) : (
                  <View style={styles.editableValue}>
                    <Text style={hostedBy ? styles.value : styles.placeholderValue}>
                      {hostedBy || 'Tap to add'}
                    </Text>
                    <Ionicons name="pencil" size={12} color={Colors.tertiaryText} />
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.divider}>{divider}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{dateStr}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Started</Text>
                <Text style={styles.value}>{startTimeStr}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ended</Text>
                <Text style={styles.value}>{endTimeStr}</Text>
              </View>

              <Text style={styles.divider}>{divider}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Duration</Text>
                <Text style={styles.value}>{durationMin} min</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Attendees</Text>
                <Text style={styles.value}>{meeting.people} people</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Avg Salary</Text>
                <Text style={styles.value}>{sym}{meeting.salary.toLocaleString()}/yr</Text>
              </View>

              <Text style={styles.divider}>{divider}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>BURN RATE</Text>
                <Text style={styles.value}>{sym}{rate.costPerSecond.toFixed(2)}/sec</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}> </Text>
                <Text style={styles.value}>{sym}{rate.costPerMinute.toFixed(2)}/min</Text>
              </View>

              <Text style={styles.divider}>{divider}</Text>

              {/* Total Cost - Hero */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>💰 TOTAL COST</Text>
                <Text testID="receipt-total-cost" style={styles.totalValue}>
                  {formatCurrency(meeting.totalCost, sym)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Per Person</Text>
                <Text style={styles.valueWhite}>{formatCurrency(perPerson, sym)}</Text>
              </View>

              <Text style={styles.divider}>{divider}</Text>

              <View style={styles.row}>
                <Text style={styles.labelOrange}>Monthly Impact*</Text>
                <Text style={styles.valueOrange}>{formatCurrency(monthlyImpact, sym)}</Text>
              </View>
              <Text style={styles.impactNote}>  (if repeated weekly)</Text>

              <Text style={styles.divider}>{divider}</Text>
              <Text style={styles.footer}>Powered by MeetBurn</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                testID="share-receipt-btn"
                style={styles.shareBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.shareBtnText}>Share Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="save-close-btn"
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>
                  {saved ? 'Close' : 'Save & Close'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="new-meeting-receipt-btn"
                onPress={() => router.replace('/setup')}
              >
                <Text style={styles.newMeetingText}>New Meeting</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingText: {
    color: Colors.secondaryText,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  receiptCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  receiptHeader: {
    fontFamily: 'Courier',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.fireRed,
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: Colors.disabledBg,
    textAlign: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    minHeight: 32,
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editInput: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.primaryText,
    backgroundColor: Colors.inputField,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.fireRed,
    textAlign: 'right',
  },
  placeholderValue: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.mutedLabel,
    fontStyle: 'italic',
  },
  label: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.secondaryText,
  },
  value: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  valueWhite: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.primaryText,
    fontWeight: '600',
  },
  totalRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 6,
  },
  totalValue: {
    fontFamily: 'Courier',
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.fireRed,
    fontVariant: ['tabular-nums'],
  },
  labelOrange: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.emberOrange,
  },
  valueOrange: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.emberOrange,
    fontWeight: '600',
  },
  impactNote: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: Colors.tertiaryText,
    marginTop: 2,
  },
  footer: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: Colors.mutedLabel,
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  shareBtn: {
    backgroundColor: Colors.fireRed,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primaryBg,
  },
  saveBtn: {
    backgroundColor: Colors.inputField,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  newMeetingText: {
    fontSize: 16,
    color: Colors.fireRed,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

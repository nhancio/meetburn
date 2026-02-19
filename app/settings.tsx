import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { CURRENCIES } from '../src/constants/currencies';
import { getSettings, saveSettings, clearAllMeetings, AppSettings } from '../src/utils/storage';
import ConfirmModal from '../src/components/ConfirmModal';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    defaultCurrency: 'USD',
    defaultPeopleCount: 5,
    defaultSalary: 75000,
    workingHoursPerWeek: 40,
    workingWeeksPerYear: 52,
    costUpdateSpeed: 'smooth',
    milestoneAlerts: true,
    hapticFeedback: true,
    keepScreenAwake: true,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings({ [key]: value });
  };

  const adjustValue = async (key: 'defaultPeopleCount' | 'workingHoursPerWeek' | 'workingWeeksPerYear', delta: number, min: number, max: number) => {
    const current = settings[key] as number;
    const newVal = Math.max(min, Math.min(max, current + delta));
    if (newVal !== current) {
      await updateSetting(key, newVal);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = async () => {
    await clearAllMeetings();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowClearConfirm(false);
  };

  const currencyObj = CURRENCIES.find(c => c.code === settings.defaultCurrency) || CURRENCIES[0];
  const speedOptions = [
    { key: 'smooth' as const, label: 'Smooth (10/sec)' },
    { key: 'normal' as const, label: 'Normal (4/sec)' },
    { key: 'perSecond' as const, label: 'Per Second (1/sec)' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          testID="settings-back-btn"
          onPress={() => router.back()}
          style={styles.navBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Settings</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* DEFAULTS */}
        <Text style={styles.sectionHeader}>DEFAULTS</Text>
        <View style={styles.section}>
          {/* Default Currency */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Currency</Text>
            <TouchableOpacity
              testID="default-currency-btn"
              style={styles.valueBtn}
            >
              <Text style={styles.valueText}>{currencyObj.label}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Default People */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default People</Text>
            <View style={styles.miniStepper}>
              <TouchableOpacity
                testID="default-people-minus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('defaultPeopleCount', -1, 2, 50)}
              >
                <Ionicons name="remove" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
              <Text style={styles.miniStepperValue}>{settings.defaultPeopleCount}</Text>
              <TouchableOpacity
                testID="default-people-plus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('defaultPeopleCount', 1, 2, 50)}
              >
                <Ionicons name="add" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Default Salary */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Salary</Text>
            <Text style={styles.valueText}>
              {currencyObj.symbol}{settings.defaultSalary.toLocaleString()}
            </Text>
          </View>

          <View style={styles.separator} />

          {/* Working Hours */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Hours/Week</Text>
            <View style={styles.miniStepper}>
              <TouchableOpacity
                testID="hours-minus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('workingHoursPerWeek', -1, 20, 60)}
              >
                <Ionicons name="remove" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
              <Text style={styles.miniStepperValue}>{settings.workingHoursPerWeek}</Text>
              <TouchableOpacity
                testID="hours-plus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('workingHoursPerWeek', 1, 20, 60)}
              >
                <Ionicons name="add" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Working Weeks */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Weeks/Year</Text>
            <View style={styles.miniStepper}>
              <TouchableOpacity
                testID="weeks-minus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('workingWeeksPerYear', -1, 40, 52)}
              >
                <Ionicons name="remove" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
              <Text style={styles.miniStepperValue}>{settings.workingWeeksPerYear}</Text>
              <TouchableOpacity
                testID="weeks-plus"
                style={styles.miniStepperBtn}
                onPress={() => adjustValue('workingWeeksPerYear', 1, 40, 52)}
              >
                <Ionicons name="add" size={16} color={Colors.primaryText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MEETING TIMER */}
        <Text style={styles.sectionHeader}>MEETING TIMER</Text>
        <View style={styles.section}>
          {/* Cost Update Speed */}
          <Text style={styles.settingLabel}>Cost Update Speed</Text>
          <View style={styles.speedOptions}>
            {speedOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                testID={`speed-${opt.key}`}
                style={[
                  styles.speedPill,
                  settings.costUpdateSpeed === opt.key && styles.speedPillActive,
                ]}
                onPress={() => updateSetting('costUpdateSpeed', opt.key)}
              >
                <Text
                  style={[
                    styles.speedPillText,
                    settings.costUpdateSpeed === opt.key && styles.speedPillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.separator} />

          {/* Milestone Alerts */}
          <View style={styles.toggleRow}>
            <Text style={styles.settingLabel}>Milestone Alerts</Text>
            <Switch
              testID="milestone-toggle"
              value={settings.milestoneAlerts}
              onValueChange={(v) => updateSetting('milestoneAlerts', v)}
              trackColor={{ false: Colors.disabledBg, true: Colors.fireRed }}
              thumbColor={Colors.primaryText}
            />
          </View>

          <View style={styles.separator} />

          {/* Haptic Feedback */}
          <View style={styles.toggleRow}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              testID="haptic-toggle"
              value={settings.hapticFeedback}
              onValueChange={(v) => updateSetting('hapticFeedback', v)}
              trackColor={{ false: Colors.disabledBg, true: Colors.fireRed }}
              thumbColor={Colors.primaryText}
            />
          </View>

          <View style={styles.separator} />

          {/* Keep Screen Awake */}
          <View style={styles.toggleRow}>
            <Text style={styles.settingLabel}>Keep Screen Awake</Text>
            <Switch
              testID="screen-awake-toggle"
              value={settings.keepScreenAwake}
              onValueChange={(v) => updateSetting('keepScreenAwake', v)}
              trackColor={{ false: Colors.disabledBg, true: Colors.fireRed }}
              thumbColor={Colors.primaryText}
            />
          </View>
        </View>

        {/* DATA */}
        <Text style={styles.sectionHeader}>DATA</Text>
        <View style={styles.section}>
          <TouchableOpacity
            testID="clear-history-btn"
            style={styles.settingRowBtn}
            onPress={handleClearHistory}
          >
            <Text style={styles.destructiveText}>Clear Meeting History</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.settingRowInfo}>
            <Text style={styles.infoText}>
              All data stored locally on your device. Nothing is ever sent anywhere.
            </Text>
          </View>
        </View>

        {/* ABOUT */}
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.valueText}>1.0.0</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Developer</Text>
            <Text style={styles.valueTextSmall}>VIIONR INFOTECH</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Contact</Text>
            <Text style={styles.valueTextSmall}>support@viionr.com</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      <ConfirmModal
        visible={showClearConfirm}
        title="Clear Meeting History"
        message="This will delete all saved meetings. This cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        destructive
        onConfirm={confirmClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 12,
    color: Colors.tertiaryText,
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  settingRowBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  settingRowInfo: {
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.primaryText,
  },
  valueText: {
    fontSize: 15,
    color: Colors.secondaryText,
  },
  valueTextSmall: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
  valueBtn: {
    paddingVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.subtleBorder,
    marginVertical: 8,
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inputField,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepperValue: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  speedOptions: {
    marginTop: 8,
    gap: 6,
  },
  speedPill: {
    backgroundColor: Colors.inputField,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  speedPillActive: {
    backgroundColor: Colors.fireRed,
  },
  speedPillText: {
    fontSize: 14,
    color: Colors.primaryText,
  },
  speedPillTextActive: {
    color: Colors.primaryBg,
    fontWeight: '600',
  },
  destructiveText: {
    fontSize: 15,
    color: Colors.fireRed,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    color: Colors.tertiaryText,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});

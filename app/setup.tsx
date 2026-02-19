import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { CURRENCIES, INDUSTRY_PRESETS, SALARY_PRESETS } from '../src/constants/currencies';
import { formatSalary } from '../src/utils/calculator';
import { getSettings } from '../src/utils/storage';
import * as Haptics from 'expo-haptics';

export default function SetupScreen() {
  const router = useRouter();
  const [people, setPeople] = useState(5);
  const [salary, setSalary] = useState(75000);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1); // index of 75K
  const [customSalary, setCustomSalary] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [hostedBy, setHostedBy] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');

  useEffect(() => {
    loadDefaults();
  }, []);

  const loadDefaults = async () => {
    const settings = await getSettings();
    setPeople(settings.defaultPeopleCount);
    setSalary(settings.defaultSalary);
    setCurrency(settings.defaultCurrency);

    const presetIdx = SALARY_PRESETS.indexOf(settings.defaultSalary);
    if (presetIdx >= 0) {
      setSelectedPreset(presetIdx);
    } else {
      setShowCustom(true);
      setSelectedPreset(null);
      setCustomSalary(settings.defaultSalary.toString());
    }
  };

  const adjustPeople = (delta: number) => {
    const newVal = Math.max(2, Math.min(50, people + delta));
    if (newVal !== people) {
      setPeople(newVal);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const selectSalaryPreset = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (idx === SALARY_PRESETS.length) {
      // Custom
      setShowCustom(true);
      setSelectedPreset(null);
      setSelectedIndustry(null);
    } else {
      setShowCustom(false);
      setSelectedPreset(idx);
      setSalary(SALARY_PRESETS[idx]);
      setSelectedIndustry(null);
      setCustomSalary('');
    }
  };

  const selectIndustry = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndustry(idx);
    setSalary(INDUSTRY_PRESETS[idx].salary);
    setSelectedPreset(null);
    setShowCustom(false);
    setCustomSalary('');
  };

  const handleCustomSalaryChange = (text: string) => {
    const numStr = text.replace(/[^0-9]/g, '');
    setCustomSalary(numStr);
    const num = parseInt(numStr, 10);
    if (num > 0) {
      setSalary(num);
    }
  };

  const formatCustomDisplay = (val: string) => {
    if (!val) return '';
    const num = parseInt(val, 10);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-US');
  };

  const isValid = people >= 2 && salary > 0;
  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const handleStart = async () => {
    if (!isValid) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/meeting',
      params: {
        people: people.toString(),
        salary: salary.toString(),
        currency: currency,
        companyName: companyName,
        hostedBy: hostedBy,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            testID="setup-back-btn"
            onPress={() => router.back()}
            style={styles.navBtn}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primaryText} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Setup</Text>
          <TouchableOpacity
            testID="setup-start-btn-top"
            onPress={handleStart}
            disabled={!isValid}
            style={styles.navBtn}
          >
            <Text style={[styles.navStartText, !isValid && styles.navStartDisabled]}>
              Start
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Mode Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>QUICK MODE</Text>

            {/* People count */}
            <Text style={styles.fieldLabel}>People in meeting</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                testID="people-minus-btn"
                style={styles.stepperBtn}
                onPress={() => adjustPeople(-1)}
              >
                <Ionicons name="remove" size={22} color={Colors.primaryText} />
              </TouchableOpacity>
              <Text testID="people-count" style={styles.stepperValue}>{people}</Text>
              <TouchableOpacity
                testID="people-plus-btn"
                style={styles.stepperBtn}
                onPress={() => adjustPeople(1)}
              >
                <Ionicons name="add" size={22} color={Colors.primaryText} />
              </TouchableOpacity>
            </View>

            {/* Salary presets */}
            <Text style={styles.fieldLabel}>Average annual salary</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.presetScroll}
            >
              {SALARY_PRESETS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  testID={`salary-preset-${i}`}
                  style={[
                    styles.presetPill,
                    selectedPreset === i && styles.presetPillActive,
                  ]}
                  onPress={() => selectSalaryPreset(i)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedPreset === i && styles.presetTextActive,
                    ]}
                  >
                    {formatSalary(s)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                testID="salary-custom-btn"
                style={[
                  styles.presetPill,
                  showCustom && styles.presetPillActive,
                ]}
                onPress={() => selectSalaryPreset(SALARY_PRESETS.length)}
              >
                <Text
                  style={[
                    styles.presetText,
                    showCustom && styles.presetTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Custom salary input */}
            {showCustom && (
              <View style={styles.customInputContainer}>
                <Text style={styles.currencyPrefix}>{currencyObj.symbol}</Text>
                <TextInput
                  testID="custom-salary-input"
                  style={styles.customInput}
                  value={formatCustomDisplay(customSalary)}
                  onChangeText={handleCustomSalaryChange}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.mutedLabel}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            )}

            {/* Currency */}
            <Text style={styles.fieldLabel}>Currency</Text>
            <TouchableOpacity
              testID="currency-selector"
              style={styles.currencySelector}
              onPress={() => {
                setShowCurrencyPicker(!showCurrencyPicker);
                setCurrencySearch('');
              }}
            >
              <Text style={styles.currencyText}>{currencyObj.label}</Text>
              <Ionicons
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.secondaryText}
              />
            </TouchableOpacity>

            {showCurrencyPicker && (
              <View style={styles.currencyList}>
                <TextInput
                  testID="currency-search-input"
                  style={styles.currencySearchInput}
                  placeholder="Search currency..."
                  placeholderTextColor={Colors.mutedLabel}
                  value={currencySearch}
                  onChangeText={setCurrencySearch}
                  autoCapitalize="characters"
                />
                <ScrollView style={styles.currencyScrollList} nestedScrollEnabled>
                  {CURRENCIES.filter(c =>
                    c.label.toLowerCase().includes(currencySearch.toLowerCase()) ||
                    c.code.toLowerCase().includes(currencySearch.toLowerCase())
                  ).map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      testID={`currency-option-${c.code}`}
                      style={[
                        styles.currencyOption,
                        currency === c.code && styles.currencyOptionActive,
                      ]}
                      onPress={() => {
                        setCurrency(c.code);
                        setShowCurrencyPicker(false);
                        setCurrencySearch('');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text
                        style={[
                          styles.currencyOptionText,
                          currency === c.code && styles.currencyOptionTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Company Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>MEETING DETAILS</Text>

            <Text style={styles.fieldLabel}>Company Name</Text>
            <TextInput
              testID="company-name-input"
              style={styles.textInputField}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Acme Corp"
              placeholderTextColor={Colors.mutedLabel}
              returnKeyType="next"
            />

            <Text style={styles.fieldLabel}>Hosted / Organized By</Text>
            <TextInput
              testID="hosted-by-input"
              style={styles.textInputField}
              value={hostedBy}
              onChangeText={setHostedBy}
              placeholder="e.g. John Smith, CEO"
              placeholderTextColor={Colors.mutedLabel}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>

          {/* Industry Presets */}
          <View style={styles.industrySection}>
            <Text style={styles.industryHint}>Or pick an industry average</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.industryScroll}
            >
              {INDUSTRY_PRESETS.map((ind, i) => (
                <TouchableOpacity
                  key={i}
                  testID={`industry-preset-${i}`}
                  style={[
                    styles.industryPill,
                    selectedIndustry === i && styles.industryPillActive,
                  ]}
                  onPress={() => selectIndustry(i)}
                >
                  <Text
                    style={[
                      styles.industryPillText,
                      selectedIndustry === i && styles.industryPillTextActive,
                    ]}
                  >
                    {ind.label} {formatSalary(ind.salary)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>People</Text>
              <Text style={styles.summaryValue}>{people}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Avg Salary</Text>
              <Text style={styles.summaryValue}>{currencyObj.symbol}{salary.toLocaleString()}/yr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Burn Rate</Text>
              <Text style={styles.summaryValueRed}>
                {currencyObj.symbol}{((salary / (52 * 40) * people) / 3600).toFixed(2)}/sec
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Start Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            testID="start-meeting-btn"
            style={[styles.startButton, !isValid && styles.startButtonDisabled]}
            onPress={handleStart}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.startButtonText, !isValid && styles.startButtonTextDisabled]}>
              START MEETING
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    width: 60,
    height: 44,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  navStartText: {
    fontSize: 16,
    color: Colors.fireRed,
    fontWeight: '600',
    textAlign: 'right',
  },
  navStartDisabled: {
    color: Colors.tertiaryText,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  cardLabel: {
    fontSize: 12,
    color: Colors.fireRed,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 12,
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputField,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontFamily: 'Courier',
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginHorizontal: 32,
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetPill: {
    backgroundColor: Colors.inputField,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  presetPillActive: {
    backgroundColor: Colors.fireRed,
  },
  presetText: {
    fontSize: 14,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  presetTextActive: {
    color: Colors.primaryBg,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: Colors.secondaryText,
    marginRight: 4,
  },
  customInput: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 18,
    color: Colors.primaryText,
    paddingVertical: 12,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  currencyText: {
    fontSize: 16,
    color: Colors.primaryText,
  },
  currencyList: {
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  currencySearchInput: {
    padding: 12,
    fontSize: 15,
    color: Colors.primaryText,
    borderBottomWidth: 1,
    borderBottomColor: Colors.subtleBorder,
  },
  currencyScrollList: {
    maxHeight: 200,
  },
  currencyOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.subtleBorder,
  },
  currencyOptionActive: {
    backgroundColor: Colors.fireRed,
  },
  currencyOptionText: {
    fontSize: 15,
    color: Colors.primaryText,
  },
  currencyOptionTextActive: {
    color: Colors.primaryBg,
    fontWeight: '600',
  },
  industrySection: {
    marginBottom: 20,
  },
  industryHint: {
    fontSize: 12,
    color: Colors.tertiaryText,
    marginBottom: 12,
  },
  industryScroll: {
    marginBottom: 4,
  },
  industryPill: {
    backgroundColor: Colors.inputField,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  industryPillActive: {
    backgroundColor: Colors.fireRed,
  },
  industryPillText: {
    fontSize: 13,
    color: Colors.primaryText,
  },
  industryPillTextActive: {
    color: Colors.primaryBg,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  summaryValue: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  summaryValueRed: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: Colors.fireRed,
    fontWeight: 'bold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingTop: 12,
  },
  startButton: {
    backgroundColor: Colors.fireRed,
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: Colors.disabledBg,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primaryBg,
  },
  startButtonTextDisabled: {
    color: Colors.disabledText,
  },
  textInputField: {
    backgroundColor: Colors.inputField,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.subtleBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 16,
  },
});

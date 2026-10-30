import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

// Master data fallback/defaults
const DISTRICTS = [
  { id: 1, name: 'Central Capital District', code: 'DIST-01' },
  { id: 2, name: 'Northern Heights District', code: 'DIST-02' },
  { id: 3, name: 'Southern Coastal District', code: 'DIST-03' },
];

const TALUKS: Record<number, Array<{ id: number; name: string }>> = {
  1: [
    { id: 1, name: 'Metro Central Taluk' },
    { id: 2, name: 'East Suburban Taluk' },
  ],
  2: [
    { id: 3, name: 'North Valley Taluk' },
  ],
  3: [
    { id: 4, name: 'Harbor Port Taluk' },
  ],
};

const UNITS: Record<number, Array<{ id: number; name: string }>> = {
  1: [
    { id: 1, name: 'Unit 01 - Civic Center' },
    { id: 2, name: 'Unit 02 - Green Park Community' },
  ],
  2: [
    { id: 3, name: 'Unit 03 - East Ridge Division' },
  ],
  3: [
    { id: 4, name: 'Unit 04 - North Valley Chapter' },
  ],
  4: [
    { id: 5, name: 'Unit 05 - Harbor Port Unit' },
  ],
};

const MEMBERSHIP_TYPES = [
  { id: 1, name: 'Regular Member', fee: '$10.00 / yr', desc: 'Standard annual community membership' },
  { id: 2, name: 'Life Member', fee: '$100.00 / 10 yr', desc: 'Lifetime patron with full assembly voting' },
  { id: 3, name: 'Youth Volunteer', fee: 'Free / 1 yr', desc: 'Youth community activist & volunteer' },
];

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const { registerMember, setPrefilledEmail } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [village, setVillage] = useState('');
  const [districtId, setDistrictId] = useState(1);
  const [talukId, setTalukId] = useState(1);
  const [stateName, setStateName] = useState('State Province');
  const [pincode, setPincode] = useState('');

  const [membershipTypeId, setMembershipTypeId] = useState(1);
  const [unitId, setUnitId] = useState(1);
  const [consentTerms, setConsentTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  // When district changes, update taluk and unit default
  const handleDistrictChange = (dId: number) => {
    setDistrictId(dId);
    const availableTaluks = TALUKS[dId] || TALUKS[1];
    const newTalukId = availableTaluks[0]?.id || 1;
    setTalukId(newTalukId);
    const availableUnits = UNITS[newTalukId] || UNITS[1];
    setUnitId(availableUnits[0]?.id || 1);
  };

  const handleTalukChange = (tId: number) => {
    setTalukId(tId);
    const availableUnits = UNITS[tId] || UNITS[1];
    setUnitId(availableUnits[0]?.id || 1);
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!fullName.trim()) {
        Alert.alert('Required Field', 'Please enter your Full Name.');
        return false;
      }
      if (!fatherName.trim()) {
        Alert.alert('Required Field', "Please enter Father's / Guardian's Name.");
        return false;
      }
      if (!dob.trim()) {
        Alert.alert('Required Field', 'Please enter Date of Birth (YYYY-MM-DD).');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return false;
      }
      if (!/^\d{10}$/.test(mobile.trim())) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!/^\d{12}$/.test(aadhaar.replace(/\s+/g, ''))) {
        Alert.alert('Invalid Aadhaar', 'Aadhaar must be 12 digits.');
        return false;
      }
      if (voterId.replace(/\s+/g, '').length < 6) {
        Alert.alert('Invalid Voter ID', 'Voter ID must be at least 6 characters.');
        return false;
      }
      if (!password || password.length < 8) {
        Alert.alert('Weak Password', 'Password must be at least 8 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!address1.trim()) {
        Alert.alert('Required Field', 'Please enter Address Line 1.');
        return false;
      }
      if (!village.trim()) {
        Alert.alert('Required Field', 'Please enter Village or Town.');
        return false;
      }
      if (!pincode.trim() || pincode.length < 4) {
        Alert.alert('Required Field', 'Please enter a valid postal pincode.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!consentTerms) {
        Alert.alert('Consent Required', 'You must agree to the organization terms and constitution.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.navigate('Welcome');
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    // Same field names as website POST /api/members/register
    const payload = {
      full_name: fullName.trim(),
      father_name: fatherName.trim(),
      date_of_birth: dob.trim(),
      gender,
      country_code: '+91',
      phone_number: mobile.trim(),
      email: email.trim().toLowerCase(),
      password,
      aadhaar_number: aadhaar.replace(/\s+/g, ''),
      voter_id: voterId.replace(/\s+/g, '').toUpperCase(),
      blood_group: 'O+',
      state_id: 1,
      parliament_constituency_id: 1,
      district_id: Number(districtId),
      block_id: Number(talukId),
      village_custom: village.trim(),
      address_line1: address1.trim(),
      role_id: 1,
      consent_terms: true,
    };

    try {
      const res = await registerMember(payload);
      setIsSubmitting(false);

      if (res.success) {
        setPrefilledEmail(email.trim());
        setSuccessData(res.data);
      } else {
        Alert.alert('Registration Failed', res.message || 'Could not complete registration.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    }
  };

  const handleSuccessClose = () => {
    setSuccessData(null);
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
          <Text style={styles.backButtonText}>
            {currentStep === 1 ? 'Sign In' : 'Step ' + (currentStep - 1)}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Member Registration</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.stepInfoRow}>
          <Text style={styles.stepCounterText}>
            Step {currentStep} of {totalSteps}
          </Text>
          <Text style={styles.stepTitleText}>
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Account & Security'}
            {currentStep === 3 && 'Residential Address'}
            {currentStep === 4 && 'Membership & Agreement'}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(currentStep / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={theme.colors.accentGold} />
              </View>
              <View>
                <Text style={styles.cardHeaderTitle}>Personal Identification</Text>
                <Text style={styles.cardHeaderSub}>Provide your legal personal credentials</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Alexander John"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Father's / Guardian's Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Robert John"
                  placeholderTextColor="#9CA3AF"
                  value={fatherName}
                  onChangeText={setFatherName}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Date of Birth (YYYY-MM-DD) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD (e.g. 1995-04-20)"
                  placeholderTextColor="#9CA3AF"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderRow}>
                {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, gender === g && styles.genderChipActive]}
                    onPress={() => setGender(g)}
                  >
                    <Ionicons
                      name={
                        g === 'MALE'
                          ? 'male'
                          : g === 'FEMALE'
                          ? 'female'
                          : 'transgender'
                      }
                      size={16}
                      color={gender === g ? '#FFF' : theme.colors.textDark}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.genderChipText,
                        gender === g && styles.genderChipTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: CONTACT & SECURITY */}
        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={20} color={theme.colors.accentGold} />
              </View>
              <View>
                <Text style={styles.cardHeaderTitle}>Contact & Login Access</Text>
                <Text style={styles.cardHeaderSub}>Used to sign in to mobile and web portals</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Mobile Number (10 digits) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="9876543210"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Aadhaar Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="12-digit Aadhaar"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={12}
                  value={aadhaar}
                  onChangeText={setAadhaar}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Voter ID <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="id-card-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Voter ID"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  value={voterId}
                  onChangeText={setVoterId}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Create Password (min. 8 chars) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: RESIDENTIAL ADDRESS */}
        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={20} color={theme.colors.accentGold} />
              </View>
              <View>
                <Text style={styles.cardHeaderTitle}>Regional & Address Data</Text>
                <Text style={styles.cardHeaderSub}>Connect to your localized district and taluk</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Address Line 1 <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="House / Door No., Street Name"
                  placeholderTextColor="#9CA3AF"
                  value={address1}
                  onChangeText={setAddress1}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Address Line 2 (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Apartment, Landmark, Suite"
                  placeholderTextColor="#9CA3AF"
                  value={address2}
                  onChangeText={setAddress2}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Village / Town <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Green Park Village"
                  placeholderTextColor="#9CA3AF"
                  value={village}
                  onChangeText={setVillage}
                />
              </View>
            </View>

            {/* District Selection Chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Select District <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsWrap}>
                {DISTRICTS.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.selectOptionChip, districtId === d.id && styles.selectOptionChipActive]}
                    onPress={() => handleDistrictChange(d.id)}
                  >
                    <Ionicons
                      name="business"
                      size={14}
                      color={districtId === d.id ? '#FFF' : theme.colors.primaryMaroon}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.selectOptionText,
                        districtId === d.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Taluk Selection Chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Select Taluk / Block <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsWrap}>
                {(TALUKS[districtId] || TALUKS[1]).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.selectOptionChip, talukId === t.id && styles.selectOptionChipActive]}
                    onPress={() => handleTalukChange(t.id)}
                  >
                    <Ionicons
                      name="trail-sign-outline"
                      size={14}
                      color={talukId === t.id ? '#FFF' : theme.colors.primaryMaroon}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.selectOptionText,
                        talukId === t.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>State</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={stateName}
                    onChangeText={setStateName}
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>
                  Pincode <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="600001"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: MEMBERSHIP TIER & AGREEMENT */}
        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="card" size={20} color={theme.colors.accentGold} />
              </View>
              <View>
                <Text style={styles.cardHeaderTitle}>Membership & Unit</Text>
                <Text style={styles.cardHeaderSub}>Select your membership plan and local division</Text>
              </View>
            </View>

            {/* Membership Tier Cards */}
            <Text style={styles.label}>
              Choose Membership Tier <Text style={styles.required}>*</Text>
            </Text>
            {MEMBERSHIP_TYPES.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  membershipTypeId === tier.id && styles.tierCardActive,
                ]}
                onPress={() => setMembershipTypeId(tier.id)}
              >
                <View style={styles.tierRadioRow}>
                  <Ionicons
                    name={membershipTypeId === tier.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={membershipTypeId === tier.id ? theme.colors.primaryMaroon : '#9CA3AF'}
                  />
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierFee}>{tier.fee}</Text>
                  </View>
                </View>
                <Text style={styles.tierDesc}>{tier.desc}</Text>
              </TouchableOpacity>
            ))}

            {/* Local Unit Selection */}
            <View style={[styles.fieldGroup, { marginTop: 16 }]}>
              <Text style={styles.label}>
                Assign Local Community Unit <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsWrap}>
                {(UNITS[talukId] || UNITS[1]).map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.selectOptionChip, unitId === u.id && styles.selectOptionChipActive]}
                    onPress={() => setUnitId(u.id)}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={14}
                      color={unitId === u.id ? '#FFF' : theme.colors.primaryMaroon}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.selectOptionText,
                        unitId === u.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Terms and Consent Checkbox */}
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsentTerms(!consentTerms)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={consentTerms ? 'checkbox' : 'square-outline'}
                size={24}
                color={consentTerms ? theme.colors.primaryMaroon : '#6B7280'}
              />
              <Text style={styles.consentText}>
                I solemnly affirm that I accept and adhere to the Constitution, bylaws, and community standards of the Organization. All statements given here are true and complete.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation Step Buttons */}
        <View style={styles.actionButtonsRow}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.prevBtn} onPress={handleBack} disabled={isSubmitting}>
              <Ionicons name="arrow-back" size={16} color={theme.colors.primaryMaroon} />
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, currentStep === 1 && { flex: 1 }]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {currentStep === totalSteps ? 'Submit Application' : 'Continue'}
                </Text>
                <Ionicons
                  name={currentStep === totalSteps ? 'checkmark-circle' : 'arrow-forward'}
                  size={18}
                  color="#FFF"
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Login Link */}
        <View style={styles.footerSignInWrap}>
          <Text style={styles.alreadyHaveText}>Already registered as a member?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLinkText}>Sign In to Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* REGISTRATION SUCCESS MODAL */}
      <Modal visible={!!successData} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-done" size={38} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>Application Submitted!</Text>
            <Text style={styles.modalSubtitle}>
              Your membership registration has been received and entered into the community database.
            </Text>

            <View style={styles.modalDetailsBox}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.detailLabel}>Application No:</Text>
                <Text style={styles.detailValue}>
                  {successData?.application_number || 'APP-2026-PENDING'}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.detailLabel}>Member Name:</Text>
                <Text style={styles.detailValue}>{fullName}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.detailLabel}>Approval Status:</Text>
                <Text style={[styles.detailValue, { color: '#F59E0B', fontWeight: '800' }]}>
                  PENDING VERIFICATION
                </Text>
              </View>
            </View>

            <Text style={styles.modalNote}>
              You can now sign in using your email ({email}) and password to view your application status and temporary digital profile.
            </Text>

            <TouchableOpacity style={styles.modalProceedBtn} onPress={handleSuccessClose}>
              <Text style={styles.modalProceedBtnText}>Proceed to Member Login</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  topHeader: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 60,
  },
  progressContainer: {
    backgroundColor: theme.colors.primaryMaroonDark,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCounterText: {
    color: theme.colors.accentGold,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accentGold,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryMaroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
  },
  cardHeaderSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textDark,
  },
  eyeBtn: {
    padding: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderChipActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textDark,
  },
  genderChipTextActive: {
    color: '#FFF',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  selectOptionChipActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  selectOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  selectOptionTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  rowTwoCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  tierCardActive: {
    borderColor: theme.colors.accentGold,
    backgroundColor: '#FEFCE8',
    borderWidth: 1.5,
  },
  tierRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textDark,
    marginLeft: 8,
    flex: 1,
  },
  tierBadge: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierFee: {
    color: theme.colors.accentGold,
    fontSize: 11,
    fontWeight: '800',
  },
  tierDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 28,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textDark,
    lineHeight: 18,
    marginLeft: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  prevBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryMaroon,
    backgroundColor: '#FFF',
  },
  prevBtnText: {
    color: theme.colors.primaryMaroon,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryMaroon,
    shadowColor: theme.colors.primaryMaroon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  nextBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footerSignInWrap: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  alreadyHaveText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textDark,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  modalDetailsBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: theme.colors.textDark,
    fontWeight: '700',
  },
  modalNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  modalProceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMaroon,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
  },
  modalProceedBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

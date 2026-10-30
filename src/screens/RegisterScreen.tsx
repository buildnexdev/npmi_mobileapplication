import React, { useState, useEffect, useMemo } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import {
  masterData,
  DistrictItem,
  BlockItem,
  ParliamentItem,
  AssemblyItem,
  VillageItem,
  BLOOD_GROUPS,
  COUNTRY_CODES,
  JOIN_ROLE_OPTIONS,
} from '../services/masterData';

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const { registerMember, setPrefilledEmail } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // STEP 1: Personal Identification & Photo
  const [profilePhoto, setProfilePhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // STEP 2: Contact & Identification
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [voterId, setVoterId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // STEP 3: Location & Constituencies (Dynamic Master Data)
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  const [parliaments, setParliaments] = useState<ParliamentItem[]>([]);
  const [selectedParliamentId, setSelectedParliamentId] = useState<number | null>(null);

  const [assemblies, setAssemblies] = useState<AssemblyItem[]>([]);
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<number | null>(null);

  const [villages, setVillages] = useState<VillageItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [villageCustom, setVillageCustom] = useState('');
  const [addressLine1, setAddressLine1] = useState('');

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingParliaments, setLoadingParliaments] = useState(false);
  const [loadingAssemblies, setLoadingAssemblies] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // STEP 4: Role & Agreement
  const [joinAs, setJoinAs] = useState('Primary Member');
  const [roleId, setRoleId] = useState(1);
  const [designation, setDesignation] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);

  // Submission & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Selection Modal state for large dropdowns
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    items: Array<{ id: number; label: string }>;
    onSelect: (item: { id: number; label: string }) => void;
  }>({
    visible: false,
    title: '',
    items: [],
    onSelect: () => {},
  });
  const [pickerSearch, setPickerSearch] = useState('');

  // 1. Initial Master Data Fetch: Districts & Parliaments
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setLoadingDistricts(true);
      setLoadingParliaments(true);

      const [distList, parlList] = await Promise.all([
        masterData.getDistricts(),
        masterData.getParliaments(),
      ]);

      if (!isMounted) return;

      setDistricts(distList);
      setParliaments(parlList);

      if (distList.length > 0) {
        setSelectedDistrictId(distList[0].id);
      }
      if (parlList.length > 0) {
        setSelectedParliamentId(parlList[0].id);
      }

      setLoadingDistricts(false);
      setLoadingParliaments(false);
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Blocks when District changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setBlocks([]);
      setSelectedBlockId(null);
      return;
    }

    let isMounted = true;
    setLoadingBlocks(true);

    masterData.getBlocks(selectedDistrictId).then((bList) => {
      if (!isMounted) return;
      setBlocks(bList);
      if (bList.length > 0) {
        setSelectedBlockId(bList[0].id);
      } else {
        setSelectedBlockId(null);
      }
      setLoadingBlocks(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrictId]);

  // 3. Load Assemblies when Parliament changes
  useEffect(() => {
    if (!selectedParliamentId) {
      setAssemblies([]);
      setSelectedAssemblyId(null);
      return;
    }

    let isMounted = true;
    setLoadingAssemblies(true);

    masterData.getAssemblies(selectedParliamentId).then((aList) => {
      if (!isMounted) return;
      setAssemblies(aList);
      if (aList.length > 0) {
        setSelectedAssemblyId(aList[0].id);
      } else {
        setSelectedAssemblyId(null);
      }
      setLoadingAssemblies(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedParliamentId]);

  // 4. Load Villages when Block changes
  useEffect(() => {
    if (!selectedBlockId) {
      setVillages([]);
      setSelectedVillageId(null);
      return;
    }

    let isMounted = true;
    setLoadingVillages(true);

    masterData.getVillages(selectedBlockId).then((vList) => {
      if (!isMounted) return;
      setVillages(vList);
      if (vList.length > 0) {
        setSelectedVillageId(vList[0].id);
      } else {
        setSelectedVillageId(null);
      }
      setLoadingVillages(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedBlockId]);

  // Photo Picking
  const pickPhotoFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Media library access is required to choose a profile photo.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setProfilePhoto(res.assets[0]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not pick photo');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take a profile photo.');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setProfilePhoto(res.assets[0]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not take photo');
    }
  };

  const openPicker = (
    title: string,
    items: Array<{ id: number; label: string }>,
    onSelect: (item: { id: number; label: string }) => void
  ) => {
    setPickerSearch('');
    setPickerModal({
      visible: true,
      title,
      items,
      onSelect: (it) => {
        onSelect(it);
        setPickerModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const filteredPickerItems = useMemo(() => {
    if (!pickerSearch.trim()) return pickerModal.items;
    const q = pickerSearch.trim().toLowerCase();
    return pickerModal.items.filter((it) => it.label.toLowerCase().includes(q));
  }, [pickerModal.items, pickerSearch]);

  const isAdult = (dateStr: string) => {
    if (!dateStr) return false;
    const dobDate = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(dobDate.getTime())) return false;
    const adult = new Date(dobDate);
    adult.setFullYear(dobDate.getFullYear() + 18);
    return adult <= new Date();
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!profilePhoto) {
        Alert.alert('Profile Photo Required', 'Please choose or capture a clear passport-size profile photo.');
        return false;
      }
      if (!fullName.trim() || fullName.trim().length < 2) {
        Alert.alert('Full Name Required', 'Please enter your legal full name (at least 2 letters).');
        return false;
      }
      if (!fatherName.trim()) {
        Alert.alert('Required Field', "Please enter Father's / Guardian's Name.");
        return false;
      }
      if (!dob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
        Alert.alert('Date of Birth Required', 'Please enter Date of Birth in YYYY-MM-DD format (e.g. 1995-04-20).');
        return false;
      }
      if (!isAdult(dob.trim())) {
        Alert.alert('Age Requirement', 'You must be at least 18 years old to enroll as a member.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const cleanPhone = mobile.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return false;
      }
      const cleanAadhaar = aadhaar.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        Alert.alert('Invalid Aadhaar', 'Aadhaar number must contain exactly 12 digits.');
        return false;
      }
      const cleanVoter = voterId.replace(/[^A-Za-z0-9]/g, '');
      if (cleanVoter.length < 6) {
        Alert.alert('Invalid Voter ID', 'Voter ID must be at least 6 alphanumeric characters.');
        return false;
      }
      if (!password || password.length < 8) {
        Alert.alert('Weak Password', 'Password must be at least 8 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match. Please re-enter confirm password.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!selectedDistrictId) {
        Alert.alert('District Required', 'Please select your District.');
        return false;
      }
      if (!selectedBlockId) {
        Alert.alert('Taluk / Block Required', 'Please select your Taluk or Block.');
        return false;
      }
      if (!selectedParliamentId) {
        Alert.alert('Parliament Constituency Required', 'Please select your Parliament constituency.');
        return false;
      }
      if (!addressLine1.trim()) {
        Alert.alert('Address Required', 'Please enter your Address Line 1 (Door no, Street name).');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!consentTerms) {
        Alert.alert('Agreement Required', 'You must agree to the organization constitution and terms.');
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

    const payload = {
      full_name: fullName.trim(),
      father_name: fatherName.trim(),
      date_of_birth: dob.trim(),
      gender,
      blood_group: bloodGroup,
      country_code: countryCode.trim(),
      phone_number: mobile.replace(/\D/g, ''),
      email: email.trim().toLowerCase(),
      password,
      aadhaar_number: aadhaar.replace(/\D/g, ''),
      voter_id: voterId.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
      state_id: 1,
      parliament_constituency_id: selectedParliamentId,
      assembly_constituency_id: selectedAssemblyId || undefined,
      district_id: selectedDistrictId,
      block_id: selectedBlockId,
      village_id: selectedVillageId || undefined,
      village_custom: villageCustom.trim() || undefined,
      address_line1: addressLine1.trim(),
      role_id: roleId,
      join_as: joinAs,
      designation: designation.trim() || joinAs,
      profile_image: profilePhoto
        ? {
            uri: profilePhoto.uri,
            name: profilePhoto.fileName || 'profile.jpg',
            type: profilePhoto.mimeType || 'image/jpeg',
          }
        : null,
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
      Alert.alert('Registration Error', err.message || 'An unexpected error occurred.');
    }
  };

  const selectedDistrictName = districts.find((d) => d.id === selectedDistrictId)?.name_en || 'Select District';
  const selectedBlockName = blocks.find((b) => b.id === selectedBlockId)?.name_en || (loadingBlocks ? 'Loading taluks...' : 'Select Taluk/Block');
  const selectedParlName = parliaments.find((p) => p.id === selectedParliamentId)?.name_en || 'Select Parliament';
  const selectedAssemblyName = assemblies.find((a) => a.id === selectedAssemblyId)?.name_en || 'Select Assembly (Optional)';
  const selectedVillageName = villages.find((v) => v.id === selectedVillageId)?.name_en || 'Select Village/Ward (Optional)';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
          <Text style={styles.backButtonText}>
            {currentStep === 1 ? 'Sign In' : `Step ${currentStep - 1}`}
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
            {currentStep === 2 && 'Contact & Identity'}
            {currentStep === 3 && 'Location & Constituencies'}
            {currentStep === 4 && 'Role & Agreement'}
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
        {/* ============================================================ */}
        {/* STEP 1: PERSONAL INFORMATION & PROFILE PHOTO */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={theme.colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Personal Identification</Text>
                <Text style={styles.cardHeaderSub}>Passport photo, legal name, date of birth & blood group</Text>
              </View>
            </View>

            {/* Profile Photo Picker (Required) */}
            <View style={styles.photoUploadSection}>
              <View style={styles.photoAvatarWrap}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto.uri }} style={styles.photoAvatar} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                    <Text style={styles.photoPlaceholderText}>Photo Required</Text>
                  </View>
                )}
              </View>

              <View style={styles.photoBtnCol}>
                <Text style={styles.photoLabel}>
                  Profile Photo <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.photoHint}>Required for verified Digital Member ID Card.</Text>
                <View style={styles.photoBtnRow}>
                  <TouchableOpacity
                    style={styles.photoActionBtn}
                    onPress={pickPhotoFromLibrary}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images-outline" size={16} color="#FFF" />
                    <Text style={styles.photoActionText}>Choose File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoActionBtn, styles.cameraActionBtn]}
                    onPress={takePhotoWithCamera}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={16} color={theme.colors.primaryMaroon} />
                    <Text style={styles.cameraActionText}>Camera</Text>
                  </TouchableOpacity>

                  {profilePhoto && (
                    <TouchableOpacity
                      style={styles.clearPhotoBtn}
                      onPress={() => setProfilePhoto(null)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. S. Nandhakumar"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Father's / Guardian's Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Father's / Guardian's Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. R. Shanmugam"
                  placeholderTextColor="#9CA3AF"
                  value={fatherName}
                  onChangeText={setFatherName}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Date of Birth (YYYY-MM-DD) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD (e.g. 1998-05-15)"
                  placeholderTextColor="#9CA3AF"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
              <Text style={styles.helperText}>Must be at least 18 years of age.</Text>
            </View>

            {/* Gender */}
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

            {/* Blood Group */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Blood Group</Text>
              <View style={styles.chipsWrap}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.smallChip, bloodGroup === bg && styles.smallChipActive]}
                    onPress={() => setBloodGroup(bg)}
                  >
                    <Text
                      style={[
                        styles.smallChipText,
                        bloodGroup === bg && styles.smallChipTextActive,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CONTACT & IDENTITY CARDS */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="card" size={20} color={theme.colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Contact & Identity Verification</Text>
                <Text style={styles.cardHeaderSub}>Used for login and member verification</Text>
              </View>
            </View>

            {/* Country Code & Mobile Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Mobile Number (10 digits) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.mobileRow}>
                <TouchableOpacity
                  style={styles.countryPickerBtn}
                  onPress={() =>
                    openPicker(
                      'Select Country Code',
                      COUNTRY_CODES.map((c, i) => ({ id: i, label: `${c.label} ${c.code}` })),
                      (it) => setCountryCode(COUNTRY_CODES[it.id].code)
                    )
                  }
                >
                  <Text style={styles.countryPickerText}>{countryCode}</Text>
                  <Ionicons name="chevron-down" size={14} color="#6B7280" />
                </TouchableOpacity>

                <View style={[styles.inputWrapper, { flex: 1 }]}>
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
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="member@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Aadhaar Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Aadhaar Number (12 digits) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="id-card-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="12-digit Aadhaar number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={12}
                  value={aadhaar}
                  onChangeText={setAadhaar}
                />
              </View>
            </View>

            {/* Voter ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Voter ID / EPIC <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. TN/01/001/000000"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  value={voterId}
                  onChangeText={setVoterId}
                />
              </View>
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
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

        {/* ============================================================ */}
        {/* STEP 3: LOCATION & CONSTITUENCIES (LIVE MASTER DATA) */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={20} color={theme.colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Regional & Administrative Details</Text>
                <Text style={styles.cardHeaderSub}>Live Tamil Nadu districts, taluks & constituencies</Text>
              </View>
            </View>

            {/* District Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                District <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() =>
                  openPicker(
                    'Select District',
                    districts.map((d) => ({
                      id: d.id,
                      label: d.name_ta ? `${d.name_en} (${d.name_ta})` : d.name_en,
                    })),
                    (it) => setSelectedDistrictId(it.id)
                  )
                }
              >
                <Text style={[styles.selectButtonText, !selectedDistrictId && styles.placeholderText]}>
                  {selectedDistrictName}
                </Text>
                {loadingDistricts ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryMaroon} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Taluk / Block Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Taluk / Block <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  if (blocks.length === 0) {
                    Alert.alert('Notice', 'Please select a District first.');
                    return;
                  }
                  openPicker(
                    'Select Taluk / Block',
                    blocks.map((b) => ({
                      id: b.id,
                      label: b.name_ta ? `${b.name_en} (${b.name_ta})` : b.name_en,
                    })),
                    (it) => setSelectedBlockId(it.id)
                  );
                }}
              >
                <Text style={[styles.selectButtonText, !selectedBlockId && styles.placeholderText]}>
                  {selectedBlockName}
                </Text>
                {loadingBlocks ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryMaroon} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Parliament Constituency Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Parliament Constituency <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() =>
                  openPicker(
                    'Select Parliament Constituency',
                    parliaments.map((p) => ({
                      id: p.id,
                      label: p.name_ta ? `${p.name_en} (${p.name_ta})` : p.name_en,
                    })),
                    (it) => setSelectedParliamentId(it.id)
                  )
                }
              >
                <Text style={[styles.selectButtonText, !selectedParliamentId && styles.placeholderText]}>
                  {selectedParlName}
                </Text>
                {loadingParliaments ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryMaroon} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Assembly Constituency Selector (Optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Assembly Constituency (Optional)</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  if (assemblies.length === 0) {
                    Alert.alert('Notice', 'No assemblies loaded for this parliament constituency.');
                    return;
                  }
                  openPicker(
                    'Select Assembly Constituency',
                    assemblies.map((a) => ({
                      id: a.id,
                      label: a.name_ta ? `${a.name_en} (${a.name_ta})` : a.name_en,
                    })),
                    (it) => setSelectedAssemblyId(it.id)
                  );
                }}
              >
                <Text style={[styles.selectButtonText, !selectedAssemblyId && styles.placeholderText]}>
                  {selectedAssemblyName}
                </Text>
                {loadingAssemblies ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryMaroon} />
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Village / Ward (Dropdown from Master Data or Custom Input) */}
            {villages.length > 0 && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Village / Ward Unit (From Master Data)</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() =>
                    openPicker(
                      'Select Village / Ward',
                      villages.map((v) => ({
                        id: v.id,
                        label: v.name_ta ? `${v.name_en} (${v.name_ta})` : v.name_en,
                      })),
                      (it) => setSelectedVillageId(it.id)
                    )
                  }
                >
                  <Text style={[styles.selectButtonText, !selectedVillageId && styles.placeholderText]}>
                    {selectedVillageName}
                  </Text>
                  {loadingVillages ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryMaroon} />
                  ) : (
                    <Ionicons name="chevron-down" size={18} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Village Custom Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Village / Ward Name (Custom / Local)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Gandhi Nagar Ward 4"
                  placeholderTextColor="#9CA3AF"
                  value={villageCustom}
                  onChangeText={setVillageCustom}
                />
              </View>
            </View>

            {/* Address Line 1 */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Address Line 1 <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Door No., Street / Road Name"
                  placeholderTextColor="#9CA3AF"
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                />
              </View>
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 4: ROLE & MEMBERSHIP DECLARATION */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="ribbon" size={20} color={theme.colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Role & Declaration</Text>
                <Text style={styles.cardHeaderSub}>Review details and agree to NMPI membership terms</Text>
              </View>
            </View>

            {/* Role Options */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Join As <Text style={styles.required}>*</Text>
              </Text>
              {JOIN_ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleOptionCard, roleId === r.id && styles.roleOptionCardActive]}
                  onPress={() => {
                    setRoleId(r.id);
                    setJoinAs(r.name);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleRadio}>
                    {roleId === r.id && <View style={styles.roleRadioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleTitle, roleId === r.id && styles.roleTitleActive]}>
                      {r.name}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Designation (Optional) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Designation / Padhavi (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="briefcase-outline" size={18} color="#9CA3AF" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Unit Coordinator, Youth Organizer"
                  placeholderTextColor="#9CA3AF"
                  value={designation}
                  onChangeText={setDesignation}
                />
              </View>
            </View>

            {/* Quick Summary Review Box */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Application Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Applicant:</Text>
                <Text style={styles.summaryVal}>{fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mobile:</Text>
                <Text style={styles.summaryVal}>{countryCode} {mobile}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>District:</Text>
                <Text style={styles.summaryVal}>{selectedDistrictName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taluk / Block:</Text>
                <Text style={styles.summaryVal}>{selectedBlockName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Parliament:</Text>
                <Text style={styles.summaryVal}>{selectedParlName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Photo:</Text>
                <Text style={[styles.summaryVal, { color: '#059669', fontWeight: '800' }]}>
                  {profilePhoto ? '✓ Photo Attached' : '✗ Missing'}
                </Text>
              </View>
            </View>

            {/* Consent Terms Checkbox */}
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setConsentTerms(!consentTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, consentTerms && styles.checkboxActive]}>
                {consentTerms && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={styles.consentText}>
                I hereby declare that the details provided are true and correct. I agree to abide by the constitution, values and rules of Netaji Makkal Pathukappu Iyakkam (NMPI).
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation Buttons (Back & Next/Submit) */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.navBackBtn} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color="#4B5563" />
            <Text style={styles.navBackText}>
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navNextBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.navNextText}>
                  {currentStep === totalSteps ? 'Complete Enrollment' : 'Continue'}
                </Text>
                <Ionicons
                  name={currentStep === totalSteps ? 'checkmark-circle' : 'chevron-forward'}
                  size={18}
                  color="#FFF"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Generic Item Picker Modal (Districts, Taluks, Parliaments, etc.) */}
      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModal((p) => ({ ...p, visible: false }))}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerSheetTitle}>{pickerModal.title}</Text>
              <TouchableOpacity
                onPress={() => setPickerModal((p) => ({ ...p, visible: false }))}
                style={styles.pickerCloseBtn}
              >
                <Ionicons name="close" size={22} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Search Input in Picker */}
            <View style={styles.pickerSearchWrap}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoCorrect={false}
              />
              {pickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPickerSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {filteredPickerItems.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No matches found.</Text>
                </View>
              ) : (
                filteredPickerItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.pickerItemRow}
                    onPress={() => pickerModal.onSelect(item)}
                  >
                    <Text style={styles.pickerItemLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Dialog Modal */}
      <Modal visible={!!successData} transparent animationType="fade">
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark-done" size={38} color="#FFF" />
            </View>
            <Text style={styles.successTitle}>Welcome to NMPI!</Text>
            <Text style={styles.successSub}>
              Your member application has been registered successfully.
            </Text>

            {successData && (
              <View style={styles.successDetailsBox}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Member ID</Text>
                  <Text style={styles.successValBadge}>{successData.member_id || 'Generating...'}</Text>
                </View>
                {successData.application_number && (
                  <View style={styles.successRow}>
                    <Text style={styles.successLabel}>Application No</Text>
                    <Text style={styles.successVal}>{successData.application_number}</Text>
                  </View>
                )}
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Registered Email</Text>
                  <Text style={styles.successVal}>{email}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => {
                setSuccessData(null);
                navigation.navigate('Login');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.successDoneText}>Proceed to Sign In</Text>
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
    backgroundColor: '#F9FAFB',
  },
  topHeader: {
    backgroundColor: theme.colors.primaryMaroon,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  placeholder: { width: 40 },
  progressContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
    textTransform: 'uppercase',
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accentGold,
    borderRadius: 3,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryMaroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  photoUploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  photoAvatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.accentGold,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  photoAvatar: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 2,
  },
  photoBtnCol: { flex: 1 },
  photoLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  photoHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  photoBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryMaroon,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  photoActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraActionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.primaryMaroon,
  },
  cameraActionText: {
    color: theme.colors.primaryMaroon,
    fontSize: 12,
    fontWeight: '700',
  },
  clearPhotoBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
    fontWeight: '800',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  eyeBtn: {
    padding: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  genderChipActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  genderChipTextActive: {
    color: '#FFF',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  smallChipActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  smallChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  smallChipTextActive: {
    color: '#FFF',
  },
  mobileRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#F9FAFB',
  },
  countryPickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  roleOptionCardActive: {
    borderColor: theme.colors.primaryMaroon,
    backgroundColor: '#FFF9F9',
  },
  roleRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primaryMaroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  roleRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryMaroon,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  roleTitleActive: {
    color: theme.colors.primaryMaroon,
  },
  roleDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: theme.colors.primaryMaroon,
    borderColor: theme.colors.primaryMaroon,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navBackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  navBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  navNextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryMaroon,
  },
  navNextText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pickerSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  pickerItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  successDetailsBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  successVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  successValBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primaryMaroon,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  successDoneBtn: {
    width: '100%',
    backgroundColor: theme.colors.primaryMaroon,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  successDoneText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

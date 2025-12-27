
export enum HealthCategory {
  CANCER_RISK = 'Cancer Risk Markers',
  METABOLIC = 'Diabetes & Metabolic',
  RESPIRATORY = 'Respiratory & Circulatory',
  LIVER = 'Liver Function',
  KIDNEY = 'Kidney Function',
  GENERAL = 'General Wellness',
  DERMATOLOGY = 'Dermatology / Skin',
  MENTAL_HEALTH = 'Mental Health'
}

export enum RecordType {
  LAB_RESULT = 'LAB_RESULT',
  VITAL_SIGN = 'VITAL_SIGN',
  SYMPTOM = 'SYMPTOM',
  DERMA_SCAN = 'DERMA_SCAN'
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'vendor' | 'vht' | 'diaspora' | 'super_admin';

// NEW: Multi-Tenancy Support
export interface Institution {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'NGO' | 'Corporate';
  logoUrl?: string;
  primaryColor?: string; // For white-label branding
  subscriptionStatus: 'Active' | 'Trial' | 'Suspended' | 'Pending_Approval';
  patientCount: number;
  doctorCount: number;
  revenue: number;
  // Registration Details
  licenseNumber?: string;
  certificateUrl?: string;
  contactPhone?: string;
  address?: string;
  adminEmail?: string;
  registrationDate?: string;
  contactPerson?: string;
  websiteUrl?: string;
  tinNumber?: string; // Tax Identification Number
  facilityLevel?: 'National Referral' | 'Regional Referral' | 'General Hospital' | 'Health Centre IV' | 'Health Centre III' | 'Clinic';
}

export interface CallLog {
    id: string;
    callerId: string;
    callerName: string;
    receiverId: string; // 'AI' or Doctor ID
    receiverName: string;
    startTime: string;
    durationSeconds: number;
    status: 'Completed' | 'Missed' | 'Dropped';
    cost: number;
    purpose?: string; // e.g. "Symptom Triage", "General Inquiry"
    aiSummary?: string; // The conversational report
    recordingUrl?: string; 
    type?: 'audio' | 'video';
}

// AI Training & Protocols
export interface DiseaseProtocol {
    id: string;
    condition: string;
    symptoms: string[];
    questions: string[]; // Specific questions the AI should ask
    redFlags: string[];
    recommendedLabs: string[]; // Tests to order if threshold met
    activationThreshold: number; // e.g., 80% likelihood
    triageInstruction: string;
}

export interface AiConfig {
    pricingModel: 'Per_Question' | 'Per_Session';
    pricePerUnit: number; // e.g., 1000 UGX per question or 10000 per session
    welcomeMessage: string;
    isEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  institutionId?: string; 
  
  location?: string; 
  district?: string; 
  coordinates?: { lat: number; lng: number }; 
  phone?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  specialization?: string; 
  licenseNumber?: string;
  nationalIdUrl?: string; // Verification
  certificateUrl?: string; // Verification
  documents?: { name: string, url: string }[]; // Array of uploaded credentials
  hospital?: string; // Added hospital for doctor
  clinicName?: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Family';
  beneficiaries?: string[]; 
  activeChallenges?: string[];
  groups?: string[]; 
  
  // Gamification & Rewards
  wellnessPoints?: number;
  referralPoints?: number; // Points for doctors referring patients
  
  // Verification Status
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected';

  // AI Assistant Config (For Doctors)
  aiConfig?: AiConfig;

  // Diaspora
  isDiaspora?: boolean; // Flag for sponsors
  sponsoredPatients?: string[]; // IDs of patients they fund
  lockedHealthBalance?: number; // Funds restricted to medical use
}

export interface HealthRecord {
  id: string;
  institutionId?: string;
  date: string;
  type: RecordType;
  title: string; 
  value?: string | number; 
  unit?: string;
  category: HealthCategory | string;
  status?: 'Normal' | 'Attention' | 'Critical';
  doctorNote?: string; 
  patientId?: string; 
  attachmentUrl?: string; 
}

export type StoryType = 'Patient Interview' | 'Expert Webinar' | 'Article' | 'Podcast';

export interface HealthStory {
  id: string;
  title: string;
  author: string; 
  type: StoryType;
  category: HealthCategory | string;
  thumbnail: string;
  duration?: string;
  language: 'English' | 'Luganda' | 'Swahili' | 'Luo' | 'Runyankole';
}

export interface SystemAction {
    type: 'PRESCRIPTION' | 'LAB_REQUEST' | 'REFERRAL' | 'CASE_STUDY' | 'CONNECT_SPECIALIST' | 'BOOK_APPOINTMENT' | 'CALL_AMBULANCE' | 'RECEIPT' | 'REPORT';
    data: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isPaid?: boolean;
  cost?: number;
  attachment?: {
      type: 'image' | 'file' | 'audio';
      url: string; 
      name: string;
      mimeType?: string;
  };
  systemAction?: SystemAction; // For structured AI outputs
}

export interface HealthSummary {
  healthScore: number;
  nextCheckup: string;
  alerts: number;
  vitalTrends: { date: string; sys: number; dia: number; glucose: number }[];
  recentRecords: HealthRecord[];
  walletBalance: number; 
  lockedBalance?: number; 
  recommendations?: string[];
}

export interface FamilyCondition {
  name: string;
  nature: 'Genetic' | 'Acquired';
  note?: string;
  diagnosisAge?: string;
  management?: 'Managed' | 'Untreated' | 'Unknown';
  severity?: 'Mild' | 'Moderate' | 'Severe';
}

export interface FamilyMember {
  id: string;
  relation: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Grandparent' | 'Child';
  age?: number;
  conditions: FamilyCondition[];
  status: 'Living' | 'Deceased';
}

export interface GeneticRiskProfile {
  riskLevel: 'Low' | 'Moderate' | 'High';
  summary: string;
  identifiedRisks: { condition: string; probability: string; reason: string }[];
  recommendedAddOns: string[];
}

export interface Appointment {
  id: string;
  institutionId?: string; 
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Video Consultation' | 'Clinic Visit' | 'Home Sample Collection' | 'Lab Test';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  sampleTrackingId?: string; 
  location?: string;
}

export interface WalletTransaction {
  id: string;
  date: string;
  type: 'Deposit' | 'Call_Deduction' | 'Subscription' | 'Transfer_Out' | 'Transfer_In' | 'Sponsorship_Received' | 'Product_Purchase' | 'Donation' | 'AI_Consultation';
  amount: number;
  description: string;
  isLockedFund?: boolean;
  status: 'Success' | 'Failed';
  failureReason?: string;
}

export interface CommunityPost {
  id: string;
  institutionId?: string; 
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  topic: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; 
  frequency: string; 
  takenToday: boolean;
  refillDue?: string;
  prescribedBy?: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: 'Fitness' | 'Diet' | 'Mental' | 'Hydration';
  duration: string; 
  participants: number;
  progress: number; 
  reward: string; 
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'support' | 'case_review';
  members: number;
  isPrivate: boolean;
  lastActive: string;
  activeCall?: boolean; 
}

export interface CaseDiscussion {
  id: string;
  institutionId?: string; 
  patientId: string;
  patientName: string;
  title: string; 
  participants: string[]; 
  status: 'Open' | 'Resolved';
  activeCall?: boolean;
}

export interface Product {
    id: string;
    name: string;
    category: 'Pharmacy' | 'Equipment' | 'Supplements' | 'Devices';
    price: number;
    originalPrice?: number;
    vendor: string; 
    image: string;
    prescriptionRequired: boolean;
    rating: number;
    description: string;
    stock?: number;
}

export interface CareCase {
    id: string;
    patientName: string;
    patientAvatar: string;
    age: number;
    location: string;
    title: string;
    summary: string;
    fullStory: string;
    familyBackground: string;
    condition: string;
    hospital: string;
    treatingDoctor: {
        name: string;
        avatar: string;
        specialization: string;
        verified: boolean;
    };
    caseImages: string[];
    amountNeeded: number;
    amountRaised: number;
    donorsCount: number;
    endDate: string;
    verified: boolean;
}

export interface Beneficiary {
    id: string;
    name: string;
    relation: 'Parent' | 'Child' | 'Sibling' | 'Friend' | 'Spouse';
    avatar: string;
    location: string;
    phone: string;
    healthPlan: 'Basic' | 'Pro' | 'Family';
    healthWalletBalance: number; // Locked funds
    lastCheckup: string;
    status: 'Healthy' | 'Attention' | 'Critical';
    pendingPrescriptions?: number;
}

// NEW: Social Health & VHT
export interface WellnessStatus {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'VITAL_UPDATE' | 'WORKOUT' | 'MEDICATION' | 'MILESTONE';
    content: string;
    image?: string;
    cheers: number;
    timestamp: string;
    verified: boolean; // Verified by AI or Device
}

export type SpecialistType = 'General' | 'Radiologist' | 'Cardiologist' | 'Pediatrician' | 'Gynecologist' | 'Dermatologist' | 'Oncologist' | 'Neurologist' | 'Psychiatrist' | 'Surgeon' | 'Emergency Medicine';

export interface LabFacility {
    id: string;
    name: string;
    location: string;
    isApproved: boolean;
    specialties: string[];
    contact: string;
}

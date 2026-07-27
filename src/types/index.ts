/* ═══════════════════════════════════════════════════════════
   SHOHOY — TypeScript Domain Types & Data Models
   ═══════════════════════════════════════════════════════════ */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL CLEAR';

export type VerificationStatus = 'Government Verified' | 'Partner Verified' | 'Unverified';

export type UserRole = 'public' | 'volunteer' | 'admin';

/* ── Flood Alert ── */
export interface FloodAlert {
  id: string;
  severity: SeverityLevel;
  type: string; // e.g. "Flash Flood", "River Level Warning", "Road Closure"
  title: string;
  description: string;
  affectedAreas: string[];
  issuedAt: string;
  verificationStatus: VerificationStatus;
}

/* ── Shelter ── */
export type ShelterStatus = 'Open' | 'Nearly Full' | 'Full' | 'Unverified';
export type RouteStatus = 'Route OK' | 'Caution' | 'Blocked';
export type ShelterCategory = 'Education Institution' | 'Cyclone Shelter' | 'Sports Facility' | 'School' | 'Government Building';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  upazila: string;
  district: string;
  occupancy: number;
  capacity: number;
  status: ShelterStatus;
  routeStatus: RouteStatus;
  category: ShelterCategory;
  amenities: {
    drinkingWater: boolean;
    toilets: boolean;
    womenToilets: boolean;
    electricity: boolean;
    generator: boolean;
    food: boolean;
    medicalSupport: boolean;
  };
}

/* ── Relief Campaign ── */
export interface ReliefCampaign {
  id: string;
  title: string;
  organization: string;
  district: string;
  coverageAreas: string[];
  targetAmount: number;
  raisedAmount: number;
  householdsTarget: number;
  householdsReached: number;
  verificationStatus: VerificationStatus;
}

/* ── Emergency Contact ── */
export type ContactCategory =
  | 'National Emergency'
  | 'Fire Service'
  | 'Medical'
  | 'Disaster Management'
  | 'District Control Room'
  | 'Protection'
  | 'Platform Hotline'
  | 'Rescue'
  | 'Hospital';

export interface EmergencyContact {
  id: string;
  title: string;
  category: ContactCategory;
  district?: string;
  phone: string;
  description: string;
  availability: string;
  isTollFree?: boolean;
  isVerified?: boolean;
  notes?: string;
  lastVerified: string;
}

/* ── Assistance Request (Multi-step Form) ── */
export type AssistanceType =
  | 'rescue'
  | 'shelter'
  | 'food'
  | 'water'
  | 'medicine'
  | 'medical_emergency'
  | 'maternal'
  | 'child_welfare'
  | 'disability'
  | 'hygiene'
  | 'missing_person'
  | 'evacuation'
  | 'other';

export interface AssistanceRequestPayload {
  types: AssistanceType[];
  householdSize: number;
  vulnerableCount: {
    children: number;
    elderly: number;
    pregnant: number;
    disabled: number;
  };
  location: {
    district: string;
    upazila: string;
    union: string;
    address: string;
    landmark?: string;
    gpsCoords?: string;
  };
  contact: {
    name: string;
    phone: string;
    altPhone?: string;
    isAnonymous: boolean;
  };
  notes?: string;
}

export interface AssistanceRequestRecord extends AssistanceRequestPayload {
  id: string;
  trackingId: string; // e.g. SHY-2024-89211
  status: 'Pending' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';
  createdAt: string;
}

/* ── Volunteer ── */
export interface VolunteerAssignment {
  id: string;
  title: string;
  location: string;
  district: string;
  durationHours: number;
  teamSize: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'Available' | 'Assigned' | 'In Progress' | 'Completed';
}

export interface VolunteerProfile {
  id: string;
  name: string;
  code: string; // VOL-2024-DEMO
  district: string;
  joinDate: string;
  isAvailable: boolean;
  hoursLogged: number;
  tasksCompleted: number;
  rating: number;
  currentAssignment?: VolunteerAssignment;
  skills: string[];
}

/* ── Warehouse & Inventory ── */
export type InventoryCategory = 'Food' | 'Water' | 'Medicine' | 'Hygiene' | 'Rescue Equipment' | 'Shelter';
export type InventoryStatus = 'OK' | 'LOW' | 'CAUTION' | 'EXPIRED';

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  availableCount: number;
  unit: string;
  reservedCount: number;
  minStockThreshold: number;
  status: InventoryStatus;
  expiryDate?: string;
  warehouseName: string;
  lastCountDate: string;
}

/* ── User Auth State ── */
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

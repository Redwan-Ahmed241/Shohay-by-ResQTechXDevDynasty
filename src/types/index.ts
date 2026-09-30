/* ═══════════════════════════════════════════════════════════
  SHOHAY — TypeScript Domain Types & Data Models
   ═══════════════════════════════════════════════════════════ */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL CLEAR';

export type VerificationStatus = 'Government Verified' | 'Partner Verified' | 'Unverified';

export type UserRole = 'public' | 'volunteer' | 'fieldworker' | 'admin';

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

export type RequestStatus = 'Pending' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';

export interface AssistanceRequestRecord extends AssistanceRequestPayload {
  id: string;
  trackingId: string; // e.g. SHY-2026-7KQ4XM
  status: RequestStatus;
  createdAt: string;
  /** Volunteer task dispatched for this request (coordinator view only) */
  task?: { id: string; status: VolunteerAssignment['status']; assignedVolunteerName?: string | null } | null;
}

/** What the public tracker returns: progress only, no names, phones or addresses */
export interface RequestTracking {
  trackingId: string;
  types: AssistanceType[];
  status: RequestStatus;
  district: string;
  upazila: string;
  createdAt: string;
  taskStatus?: VolunteerAssignment['status'] | null;
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
  status: 'Available' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled' | 'Declined';
  requestId?: string | null;
  assignedVolunteerId?: string | null;
  assignedVolunteerName?: string | null;
}

export type DutyStatus = 'Off Duty' | 'On Duty' | 'Paused';

export interface VolunteerProfile {
  id: string;
  name: string;
  code: string; // VOL-1A2B3C4D
  district: string;
  joinDate: string;
  isAvailable: boolean;
  hoursLogged: number;
  tasksCompleted: number;
  rating: number;
  currentAssignment?: VolunteerAssignment | null;
  skills: string[];
  dutyStatus: DutyStatus;
  checkedInAt?: string | null;
}

/** A field volunteer as the coordinator's directory shows them */
export interface VolunteerDirectoryEntry {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  email?: string | null;
  skills: string[];
  equipment: string[];
  verification_status?: string;
  district?: string | null;
  dutyStatus: DutyStatus;
  isAvailable: boolean;
  currentAssignment?: VolunteerAssignment | null;
  hoursLogged: number;
  tasksCompleted: number;
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

export interface StockMovement {
  id: string;
  itemId: string;
  item: string;
  type: 'INBOUND' | 'DISPATCH';
  quantity: number;
  qty: string;
  fromTo: string;
  ref: string;
  notes?: string | null;
  date: string;
}

/* ── UAV (drone) monitoring ── */
export interface UavDrone {
  id: string;
  name: string;
  registrationId: string;
  district?: string | null;
  streamUrl?: string | null;
  lastHeartbeat?: string | null;
  isOnline: boolean;
  latitude?: number | null;
  longitude?: number | null;
  batteryPct?: number | null;
  createdAt?: string | null;
}

export type UavDetectionStatus = 'New' | 'Acknowledged' | 'Rescue Requested' | 'Dismissed';

export interface UavDetection {
  id: string;
  droneId: string;
  droneName: string;
  detectedAt?: string | null;
  latitude: number;
  longitude: number;
  detectionType: 'human' | 'animal';
  confidence: number;
  boundingBox?: { x: number; y: number; w: number; h: number } | null;
  imageUrl?: string | null;
  status: UavDetectionStatus;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  requestId?: string | null;
  createdAt?: string | null;
}

export interface UavRescuerAssignment {
  id: string;
  userId: string;
  rescuerName: string;
  droneId: string;
  droneName: string;
  createdAt?: string | null;
}

export interface UavLogEntry {
  id: string;
  eventType: string;
  message: string;
  actorId?: string | null;
  droneId?: string | null;
  detectionId?: string | null;
  createdAt?: string | null;
}

/* ── User Auth State ── */
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  avatar?: string;
  gender?: string;
  skills?: string[];
  equipment?: string[];
  nid_number?: string;
  address?: string;
  dob?: string;
  experience_certificate?: string;
  verification_status?: string;
  created_at?: string;
}

import { Shelter } from '../types';

export const MOCK_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Sunamganj Government College Shelter',
    address: 'Sunamganj Sadar, Sunamganj',
    upazila: 'Sunamganj Sadar',
    district: 'Sunamganj',
    occupancy: 847,
    capacity: 1200,
    status: 'Open',
    routeStatus: 'Caution',
    category: 'Education Institution',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: true,
      electricity: true,
      generator: true,
      food: true,
      medicalSupport: true
    }
  },
  {
    id: 'shelter-2',
    name: 'Tahirpur Cyclone Shelter',
    address: 'Tahirpur, Sunamganj',
    upazila: 'Tahirpur',
    district: 'Sunamganj',
    occupancy: 487,
    capacity: 500,
    status: 'Nearly Full',
    routeStatus: 'Blocked',
    category: 'Cyclone Shelter',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: true,
      electricity: true,
      generator: false,
      food: true,
      medicalSupport: true
    }
  },
  {
    id: 'shelter-3',
    name: 'Sirajganj Stadium Emergency Shelter',
    address: 'Sirajganj Sadar, Sirajganj',
    upazila: 'Sirajganj Sadar',
    district: 'Sirajganj',
    occupancy: 1340,
    capacity: 2000,
    status: 'Open',
    routeStatus: 'Route OK',
    category: 'Sports Facility',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: true,
      electricity: true,
      generator: true,
      food: true,
      medicalSupport: true
    }
  },
  {
    id: 'shelter-4',
    name: 'Chauhali Primary School Relief Centre',
    address: 'Chauhali, Sirajganj',
    upazila: 'Chauhali',
    district: 'Sirajganj',
    occupancy: 400,
    capacity: 400,
    status: 'Full',
    routeStatus: 'Blocked',
    category: 'School',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: false,
      electricity: true,
      generator: false,
      food: true,
      medicalSupport: false
    }
  },
  {
    id: 'shelter-5',
    name: 'Kurigram DC Office Hall',
    address: 'Kurigram Sadar, Kurigram',
    upazila: 'Kurigram Sadar',
    district: 'Kurigram',
    occupancy: 312,
    capacity: 800,
    status: 'Open',
    routeStatus: 'Route OK',
    category: 'Government Building',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: true,
      electricity: true,
      generator: true,
      food: true,
      medicalSupport: true
    }
  },
  {
    id: 'shelter-6',
    name: 'Feni Government High School Shelter',
    address: 'Feni Sadar, Feni',
    upazila: 'Feni Sadar',
    district: 'Feni',
    occupancy: 620,
    capacity: 900,
    status: 'Open',
    routeStatus: 'Caution',
    category: 'School',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: true,
      electricity: true,
      generator: true,
      food: true,
      medicalSupport: true
    }
  },
  {
    id: 'shelter-7',
    name: 'Gaibandha Zila Parishad Hall',
    address: 'Gaibandha Sadar, Gaibandha',
    upazila: 'Gaibandha Sadar',
    district: 'Gaibandha',
    occupancy: 0,
    capacity: 700,
    status: 'Unverified',
    routeStatus: 'Caution',
    category: 'Government Building',
    amenities: {
      drinkingWater: true,
      toilets: true,
      womenToilets: false,
      electricity: true,
      generator: false,
      food: false,
      medicalSupport: false
    }
  }
];

/* ═══════════════════════════════════════════════════════════
   SHOHAY Strict Schema Validation Layer
   Enforces type, length, and format across all user inputs.
   Rejects invalid data immediately before submission.
   ═══════════════════════════════════════════════════════════ */

import { z } from 'zod';
import { BD_UPAZILAS } from '../data/upazilas';
import { AssistanceType } from '../types';

export const BD_DISTRICT_NAMES = BD_UPAZILAS.map((d) => d.district);

// ── Primitive Field Schemas ──

export const bdPhoneSchema = z
  .string()
  .trim()
  .min(11, 'Phone number must be at least 11 digits (e.g. 01712345678)')
  .max(14, 'Phone number must not exceed 14 characters')
  .regex(/^(?:\+?8801|01)[3-9]\d{8}$/, 'Must be a valid Bangladeshi mobile number (e.g. 01712345678 or +8801712345678)');

export const emailSchema = z
  .string()
  .trim()
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must not exceed 100 characters')
  .email('Must be a valid email format (e.g. user@example.com)')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email must have a valid domain extension');

export const otpCodeSchema = z
  .string()
  .trim()
  .min(6, 'Verification code must be at least 6 digits')
  .max(10, 'Verification code cannot exceed 10 digits')
  .regex(/^\d{6,10}$/, 'Verification code must contain numeric digits only');

export const personNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name cannot exceed 80 characters')
  .regex(/^[a-zA-Z\u0980-\u09FF\s.'-]+$/, 'Name must contain only alphabetic or Bengali characters');

export const districtSchema = z
  .string()
  .trim()
  .min(2, 'District must be selected')
  .refine((val) => BD_DISTRICT_NAMES.some((d) => d.toLowerCase() === val.toLowerCase()), {
    message: 'Selected district is not recognized. Please choose from the official list.'
  });

export const upazilaSchema = z
  .string()
  .trim()
  .min(2, 'Upazila must be selected')
  .max(80, 'Upazila name cannot exceed 80 characters');

export const trackingIdSchema = z
  .string()
  .trim()
  .min(4, 'Tracking ID must be at least 4 characters')
  .max(30, 'Tracking ID must not exceed 30 characters')
  .regex(/^[A-Za-z0-9_-]+$/, 'Tracking ID must contain only alphanumeric characters, dashes, or underscores');

export const assistanceTypesEnum = z.enum([
  'rescue',
  'shelter',
  'food',
  'water',
  'medicine',
  'medical_emergency',
  'maternal',
  'child_welfare',
  'disability',
  'hygiene',
  'missing_person',
  'evacuation',
  'other'
] as [AssistanceType, ...AssistanceType[]]);

// ── Compound Entity Schemas ──

export const locationSchema = z
  .object({
    district: districtSchema,
    upazila: upazilaSchema,
    union: z.string().max(100, 'Union/Ward cannot exceed 100 characters').default(''),
    address: z.string().max(300, 'Address cannot exceed 300 characters'),
    landmark: z.string().max(150, 'Landmark cannot exceed 150 characters').optional(),
    gpsCoords: z
      .string()
      .regex(/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/, 'GPS coordinates must be in format lat,lng (e.g. 24.8949,91.8687)')
      .optional()
  })
  .refine(
    (loc) => (loc.address && loc.address.trim().length >= 3) || Boolean(loc.gpsCoords),
    {
      message: 'Please provide either a detailed village/address (at least 3 characters) or share your GPS coordinates.',
      path: ['address']
    }
  );

export const contactSchema = z
  .object({
    name: z.string().max(80, 'Name cannot exceed 80 characters'),
    phone: bdPhoneSchema,
    altPhone: z
      .string()
      .max(20)
      .optional()
      .refine(
        (val) => !val || val.trim() === '' || bdPhoneSchema.safeParse(val).success,
        { message: 'Alternative phone must be a valid Bangladeshi mobile number' }
      ),
    isAnonymous: z.boolean().default(false)
  })
  .refine(
    (c) => c.isAnonymous || (c.name && c.name.trim().length >= 2),
    {
      message: 'Name is required (at least 2 characters) unless requesting anonymously.',
      path: ['name']
    }
  );

export const assistanceRequestSchema = z
  .object({
    types: z
      .array(assistanceTypesEnum)
      .min(1, 'Please select at least one type of emergency assistance')
      .max(13, 'Cannot select more than 13 assistance types'),
    householdSize: z
      .number()
      .int('Household size must be a whole integer')
      .min(1, 'Household size must be at least 1 person')
      .max(200, 'Household size cannot exceed 200 people'),
    vulnerableCount: z.object({
      children: z
        .number()
        .int('Children count must be an integer')
        .min(0, 'Children count cannot be negative')
        .max(100, 'Children count cannot exceed 100'),
      elderly: z
        .number()
        .int('Elderly count must be an integer')
        .min(0, 'Elderly count cannot be negative')
        .max(100, 'Elderly count cannot exceed 100'),
      pregnant: z
        .number()
        .int('Pregnant count must be an integer')
        .min(0, 'Pregnant count cannot be negative')
        .max(50, 'Pregnant count cannot exceed 50'),
      disabled: z
        .number()
        .int('Special care count must be an integer')
        .min(0, 'Special care count cannot be negative')
        .max(100, 'Special care count cannot exceed 100')
    }),
    location: locationSchema,
    contact: contactSchema
  })
  .refine(
    (data) => {
      const vSum =
        data.vulnerableCount.children +
        data.vulnerableCount.elderly +
        data.vulnerableCount.pregnant +
        data.vulnerableCount.disabled;
      return vSum <= data.householdSize;
    },
    {
      message: 'Total household members cannot be less than the sum of vulnerable breakdown members.',
      path: ['householdSize']
    }
  );

export const volunteerSignupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\u0980-\u09FF\s.'-]+$/, 'First name must only contain letters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\u0980-\u09FF\s.'-]+$/, 'Last name must only contain letters'),
  mobile: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === '' || bdPhoneSchema.safeParse(val).success, {
      message: 'Mobile number must be a valid Bangladeshi mobile (e.g. 01712345678)'
    }),
  district: districtSchema.optional(),
  skills: z.array(z.string().min(1)).min(1, 'Please select at least one skill'),
  equipment: z.array(z.string()).default([])
});

export const donationPayloadSchema = z.object({
  campaignId: z.string().trim().min(1, 'Campaign ID is required'),
  amount: z
    .number()
    .int('Amount must be a whole number in BDT')
    .min(10, 'Minimum donation amount is ৳10')
    .max(500000, 'Maximum single donation is ৳500,000'),
  donorName: personNameSchema,
  donorEmail: emailSchema,
  donorPhone: z
    .string()
    .trim()
    .min(6, 'Mobile number must be at least 6 digits')
    .max(20, 'Mobile number cannot exceed 20 characters')
    .regex(/^[+]?[0-9\s-]{6,20}$/, 'Must be a valid phone number')
});

// ── Validation Helpers ──

/** Formats the first Zod error message into user-friendly text */
export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return 'Invalid input provided.';
  return first.message;
}

/** Strictly validates data against a schema, returning either typed data or formatted error message */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }
  return { success: true, data: result.data };
}

/** Throws an ApiError or Error if data does not match the strict schema */
export function assertValid<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const res = validateWithSchema(schema, data);
  if (!res.success) {
    throw new Error(res.error);
  }
  return res.data;
}

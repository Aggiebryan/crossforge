/**
 * Demo dataset. Lets every screen and enforced gate be exercised in this
 * environment without a live Supabase project. In production these shapes are
 * returned by RLS-scoped Supabase queries; the UI components don't care which.
 */
import type { BuyerRecord } from "@/domain/engines/buyers";
import type { LeadStage } from "@/domain/constants";

export interface DemoLead {
  id: string;
  property_address: string;
  street: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  owner_name: string;
  phone_1: string;
  occupancy_status: string;
  property_type: string;
  beds: number;
  baths: number;
  square_feet: number;
  year_built: number;
  reason_for_selling: string;
  seller_timeline: string;
  seller_asking_price_cents: number;
  access_available: string;
  who_must_sign: string | null;
  lead_rating: string;
  next_action: string | null;
  follow_up_date: string | null;
  next_touch_date: string | null;
  stage: LeadStage;
  is_incomplete: boolean;
  lead_source: string;
  flag_limited_access: boolean;
  flag_utilities_off: boolean;
  flag_vacancy_over_12mo: boolean;
  flag_seller_evasive: boolean;
  date_created: string;
  contract_signed_at?: string | null;
  buyer_placed_at?: string | null;
  closed_at?: string | null;
}

export const DEMO_LEADS: DemoLead[] = [
  {
    id: "L-1001",
    property_address: "123 Main St, Conroe, TX 77301",
    street: "123 Main St",
    city: "Conroe",
    county: "Montgomery",
    state: "TX",
    zip: "77301",
    owner_name: "Dolores Ramirez",
    phone_1: "936-555-0142",
    occupancy_status: "vacant",
    property_type: "single_family",
    beds: 3,
    baths: 2,
    square_feet: 1520,
    year_built: 1978,
    reason_for_selling:
      "My mother passed and I live out of state. I just want it gone, I don't want to deal with it anymore.",
    seller_timeline: "30 days, sooner is better",
    seller_asking_price_cents: 165_000_00,
    access_available: "yes",
    who_must_sign: "Estate — myself and my brother as co-heirs",
    lead_rating: "strong",
    next_action: "Confirm heirs and schedule walkthrough",
    follow_up_date: "2026-07-21",
    next_touch_date: "2026-07-21",
    stage: "under_contract",
    is_incomplete: false,
    lead_source: "Direct mail — absentee",
    flag_limited_access: false,
    flag_utilities_off: true,
    flag_vacancy_over_12mo: true,
    flag_seller_evasive: false,
    date_created: "2026-06-30",
    contract_signed_at: "2026-07-14",
  },
  {
    id: "L-1002",
    property_address: "88 Oakbend Dr, Spring, TX 77380",
    street: "88 Oakbend Dr",
    city: "Spring",
    county: "Montgomery",
    state: "TX",
    zip: "77380",
    owner_name: "Curtis Boone",
    phone_1: "281-555-0199",
    occupancy_status: "owner_occupied",
    property_type: "single_family",
    beds: 4,
    baths: 2,
    square_feet: 2100,
    year_built: 1995,
    reason_for_selling: "Relocating for work, need to sell fast.",
    seller_timeline: "45 days",
    seller_asking_price_cents: 240_000_00,
    access_available: "yes",
    who_must_sign: "Self",
    lead_rating: "medium",
    next_action: "Prepare offer band",
    follow_up_date: "2026-07-20",
    next_touch_date: "2026-07-20",
    stage: "offer_pending",
    is_incomplete: false,
    lead_source: "PPC — Google",
    flag_limited_access: false,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: false,
    flag_seller_evasive: false,
    date_created: "2026-07-10",
  },
  {
    id: "L-1003",
    property_address: "4501 Timber Ln, Willis, TX 77378",
    street: "4501 Timber Ln",
    city: "Willis",
    county: "Montgomery",
    state: "TX",
    zip: "77378",
    owner_name: "(unknown)",
    phone_1: "936-555-0170",
    occupancy_status: "unknown",
    property_type: "single_family",
    beds: 0,
    baths: 0,
    square_feet: 0,
    year_built: 0,
    reason_for_selling: "Behind on payments, wants out before foreclosure.",
    seller_timeline: "ASAP",
    seller_asking_price_cents: 0,
    access_available: "limited",
    who_must_sign: null,
    lead_rating: "weak",
    next_action: "Complete full lead sheet",
    follow_up_date: "2026-07-20",
    next_touch_date: "2026-07-20",
    stage: "contact_made",
    is_incomplete: true,
    lead_source: "Cold call",
    flag_limited_access: true,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: false,
    flag_seller_evasive: true,
    date_created: "2026-07-18",
  },
  {
    id: "L-1004",
    property_address: "919 Pecan St, Montgomery, TX 77356",
    street: "919 Pecan St",
    city: "Montgomery",
    county: "Montgomery",
    state: "TX",
    zip: "77356",
    owner_name: "Wanda Fitzgerald",
    phone_1: "936-555-0121",
    occupancy_status: "tenant",
    property_type: "duplex",
    beds: 4,
    baths: 2,
    square_feet: 1800,
    year_built: 1985,
    reason_for_selling: "Tired landlord, tenants are a headache.",
    seller_timeline: "Flexible, 60-90 days",
    seller_asking_price_cents: 210_000_00,
    access_available: "limited",
    who_must_sign: "Self",
    lead_rating: "medium",
    next_action: "Re-engage, verify tenant situation",
    follow_up_date: null,
    next_touch_date: null,
    stage: "long_term_nurture",
    is_incomplete: false,
    lead_source: "Direct mail — absentee",
    flag_limited_access: true,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: false,
    flag_seller_evasive: false,
    date_created: "2026-05-22",
  },
  {
    id: "L-1005",
    property_address: "77 Cypress Bend, Conroe, TX 77301",
    street: "77 Cypress Bend",
    city: "Conroe",
    county: "Montgomery",
    state: "TX",
    zip: "77301",
    owner_name: "Earl Whitfield",
    phone_1: "936-555-0188",
    occupancy_status: "vacant",
    property_type: "single_family",
    beds: 3,
    baths: 1,
    square_feet: 1340,
    year_built: 1968,
    reason_for_selling: "Inherited, no interest in fixing it up.",
    seller_timeline: "No rush",
    seller_asking_price_cents: 120_000_00,
    access_available: "yes",
    who_must_sign: "Self",
    lead_rating: "strong",
    next_action: "Underwrite and present offer",
    follow_up_date: "2026-07-20",
    next_touch_date: "2026-07-20",
    stage: "qualified",
    is_incomplete: false,
    lead_source: "Referral",
    flag_limited_access: false,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: true,
    flag_seller_evasive: false,
    date_created: "2026-07-12",
  },
  {
    id: "L-1006",
    property_address: "220 Rivershade, Spring, TX 77386",
    street: "220 Rivershade",
    city: "Spring",
    county: "Montgomery",
    state: "TX",
    zip: "77386",
    owner_name: "Priya Anand",
    phone_1: "281-555-0133",
    occupancy_status: "owner_occupied",
    property_type: "single_family",
    beds: 3,
    baths: 2,
    square_feet: 1650,
    year_built: 2002,
    reason_for_selling: "Divorce, both parties want a clean quick sale.",
    seller_timeline: "30 days",
    seller_asking_price_cents: 255_000_00,
    access_available: "yes",
    who_must_sign: "Both spouses",
    lead_rating: "strong",
    next_action: "Assign to buyer",
    follow_up_date: "2026-07-20",
    next_touch_date: "2026-07-20",
    stage: "disposition_active",
    is_incomplete: false,
    lead_source: "Referral",
    flag_limited_access: false,
    flag_utilities_off: false,
    flag_vacancy_over_12mo: false,
    flag_seller_evasive: false,
    date_created: "2026-06-25",
    contract_signed_at: "2026-07-08",
  },
];

export interface DemoBuyer extends BuyerRecord {
  name: string;
  company: string | null;
  phone: string;
  buyerType: string;
}

const noDq = [false, false, false, false, false, false, false, false];

export const DEMO_BUYERS: DemoBuyer[] = [
  {
    id: "B-201",
    name: "Hollowpoint Capital",
    company: "Hollowpoint Capital LLC",
    phone: "832-555-0300",
    buyerType: "flipper",
    grade: "A",
    pofStatus: "received",
    pofDate: "2026-07-10",
    targetZips: ["77301", "77378", "77356"],
    targetCounties: ["Montgomery"],
    priceRangeLowCents: 80_000_00,
    priceRangeHighCents: 180_000_00,
    exitStrategies: ["flip", "wholetail"],
    rehabTolerance: "heavy",
    disqualifiers: noDq,
    lastMeaningfulContact: "2026-07-16",
    closingsWithOperator: 4,
    verifiedOutsideClosings: 6,
    avgResponseHours: 3,
    questionQuality: 3,
    earnestMoneyWillingness: 3,
    communicationQuality: 3,
  },
  {
    id: "B-202",
    name: "Rosalind Vane",
    company: null,
    phone: "713-555-0311",
    buyerType: "landlord",
    grade: "A",
    pofStatus: "received",
    pofDate: "2026-06-28",
    targetZips: ["77380", "77386", "77301"],
    targetCounties: ["Montgomery", "Harris"],
    priceRangeLowCents: 120_000_00,
    priceRangeHighCents: 280_000_00,
    exitStrategies: ["rental"],
    rehabTolerance: "moderate",
    disqualifiers: noDq,
    lastMeaningfulContact: "2026-07-12",
    closingsWithOperator: 2,
    verifiedOutsideClosings: 3,
    avgResponseHours: 10,
    questionQuality: 2,
    earnestMoneyWillingness: 3,
    communicationQuality: 2,
  },
  {
    id: "B-203",
    name: "Grover Ash",
    company: "Ash Homes",
    phone: "936-555-0322",
    buyerType: "flipper",
    grade: "A",
    pofStatus: "received",
    pofDate: "2026-04-01",
    // 91+ days of silence — the nightly decay job should downgrade this buyer.
    targetZips: ["77301", "77356"],
    targetCounties: ["Montgomery"],
    priceRangeLowCents: 90_000_00,
    priceRangeHighCents: 200_000_00,
    exitStrategies: ["flip"],
    rehabTolerance: "heavy",
    disqualifiers: noDq,
    lastMeaningfulContact: "2026-04-05",
    closingsWithOperator: 1,
    verifiedOutsideClosings: 2,
    avgResponseHours: 20,
    questionQuality: 2,
    earnestMoneyWillingness: 2,
    communicationQuality: 2,
  },
  {
    id: "B-204",
    name: "Tobias Krull",
    company: null,
    phone: "281-555-0333",
    buyerType: "wholetail",
    grade: "B",
    pofStatus: "pending",
    pofDate: null,
    targetZips: ["77386", "77380"],
    targetCounties: ["Montgomery"],
    priceRangeLowCents: 150_000_00,
    priceRangeHighCents: 320_000_00,
    exitStrategies: ["wholetail", "flip"],
    rehabTolerance: "light",
    disqualifiers: noDq,
    lastMeaningfulContact: "2026-07-05",
    closingsWithOperator: 0,
    verifiedOutsideClosings: 1,
    avgResponseHours: 30,
    questionQuality: 1,
    earnestMoneyWillingness: 2,
    communicationQuality: 2,
  },
  {
    id: "B-205",
    name: "Marnie Prewitt",
    company: null,
    phone: "713-555-0344",
    buyerType: "other",
    grade: "C",
    pofStatus: "none",
    pofDate: null,
    targetZips: ["77301"],
    targetCounties: [],
    priceRangeLowCents: 0,
    priceRangeHighCents: 500_000_00,
    exitStrategies: [],
    rehabTolerance: "light",
    // disqualified: no POF and no lender ref + repeated info requests
    disqualifiers: [false, false, true, false, false, true, false, false],
    lastMeaningfulContact: "2026-07-01",
    closingsWithOperator: 0,
    verifiedOutsideClosings: 0,
    avgResponseHours: 60,
    questionQuality: 0,
    earnestMoneyWillingness: 0,
    communicationQuality: 1,
  },
];

export function getLead(id: string): DemoLead | undefined {
  return DEMO_LEADS.find((l) => l.id === id);
}

export function getBuyer(id: string): DemoBuyer | undefined {
  return DEMO_BUYERS.find((b) => b.id === id);
}

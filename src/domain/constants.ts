/**
 * CrossForge domain vocabulary — the fixed, prescriptive constants from the
 * Contract Wholesaling Startup Guidebook. These are the single source of truth
 * shared by the UI and the database seed. Stage names, grade letters, repair
 * line items, folder names, and checklist items are NOT to be renamed or
 * reordered. Admins may rename display labels in the DB; the codes are frozen.
 */

// ---------------------------------------------------------------------------
// 3.2 Lead stages — fixed enum, exact names, exact order (18 stages).
// ---------------------------------------------------------------------------
export const LEAD_STAGES = [
  "new",
  "skip_traced",
  "attempting_contact",
  "contact_made",
  "follow_up",
  "qualified",
  "offer_pending",
  "offer_made",
  "negotiating",
  "contract_sent",
  "under_contract",
  "title_opened",
  "disposition_active",
  "assigned",
  "double_close_pending",
  "closed",
  "dead",
  "long_term_nurture",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  skip_traced: "Skip traced",
  attempting_contact: "Attempting contact",
  contact_made: "Contact made",
  follow_up: "Follow-up",
  qualified: "Qualified",
  offer_pending: "Offer pending",
  offer_made: "Offer made",
  negotiating: "Negotiating",
  contract_sent: "Contract sent",
  under_contract: "Under contract",
  title_opened: "Title opened",
  disposition_active: "Disposition active",
  assigned: "Assigned",
  double_close_pending: "Double-close pending",
  closed: "Closed",
  dead: "Dead",
  long_term_nurture: "Long-term nurture",
};

/** Index of a stage in the canonical order (used for advancement checks). */
export function stageIndex(stage: LeadStage): number {
  return LEAD_STAGES.indexOf(stage);
}

// ---------------------------------------------------------------------------
// 3.1 seller_leads enums
// ---------------------------------------------------------------------------
export const OCCUPANCY_STATUS = ["owner_occupied", "tenant", "vacant", "unknown"] as const;
export type OccupancyStatus = (typeof OCCUPANCY_STATUS)[number];

export const PROPERTY_TYPE = ["single_family", "duplex", "townhome", "other"] as const;
export type PropertyType = (typeof PROPERTY_TYPE)[number];

export const ACCESS_AVAILABLE = ["yes", "no", "limited"] as const;
export type AccessAvailable = (typeof ACCESS_AVAILABLE)[number];

export const LEAD_RATING = ["strong", "medium", "weak"] as const;
export type LeadRating = (typeof LEAD_RATING)[number];

/**
 * Required lead-sheet fields (No-cross rule #1: no contract without a completed
 * lead sheet). A lead with any of these blank is `is_incomplete` and cannot
 * advance past `contact_made`.
 */
export const REQUIRED_LEAD_FIELDS = [
  "lead_source_id",
  "property_address",
  "owner_name",
  "occupancy_status",
  "property_type",
  "reason_for_selling",
  "seller_timeline",
  "seller_asking_price",
  "access_available",
  "who_must_sign",
  "next_action",
  "follow_up_date",
] as const;

// ---------------------------------------------------------------------------
// 3.3 qualification — five pillars + red flags + question buckets
// ---------------------------------------------------------------------------
export const QUALIFICATION_PILLARS = [
  "motivation",
  "timeline",
  "authority",
  "condition",
  "price_flexibility",
] as const;
export type QualificationPillar = (typeof QUALIFICATION_PILLARS)[number];

export const QUESTION_BUCKETS = [
  "property_facts",
  "occupancy_and_access",
  "ownership_and_title",
  "debt_and_equity",
  "motivation",
  "pricing",
] as const;
export type QuestionBucket = (typeof QUESTION_BUCKETS)[number];

/** Red flag checklist — order is fixed; index is stored in a boolean array. */
export const RED_FLAGS = [
  "Seller wants top dollar on a one-week timeline",
  "Possible unidentified heirs",
  "No interior access before contract",
  'Difficult tenant described as "fine"',
  '"No issues at all" claimed on a visibly distressed property',
  "Seller demands large nonrefundable earnest money immediately",
  "Seller refuses last name or ownership confirmation",
  "Seller cannot identify trust or estate status",
  "Asking price exceeds recent renovated retail comps",
] as const;

// ---------------------------------------------------------------------------
// 3.5 repair_estimate — line items in fixed order (Total is derived).
// ---------------------------------------------------------------------------
export const REPAIR_LINE_ITEMS = [
  "roof",
  "foundation",
  "hvac",
  "electrical",
  "plumbing",
  "water_heater",
  "windows_doors",
  "kitchen",
  "bathrooms",
  "flooring",
  "paint_drywall",
  "fixtures_trim_lighting",
  "exterior_siding_masonry",
  "driveway_flatwork_drainage",
  "fence_landscaping_cleanup",
  "trashout_odor_pest",
] as const;
export type RepairLineItem = (typeof REPAIR_LINE_ITEMS)[number];

export const REPAIR_LINE_LABELS: Record<RepairLineItem, string> = {
  roof: "Roof",
  foundation: "Foundation",
  hvac: "HVAC",
  electrical: "Electrical",
  plumbing: "Plumbing",
  water_heater: "Water heater",
  windows_doors: "Windows and doors",
  kitchen: "Kitchen",
  bathrooms: "Bathrooms",
  flooring: "Flooring",
  paint_drywall: "Paint and drywall",
  fixtures_trim_lighting: "Fixtures / trim / lighting",
  exterior_siding_masonry: "Exterior / siding / masonry",
  driveway_flatwork_drainage: "Driveway / flatwork / drainage",
  fence_landscaping_cleanup: "Fence / landscaping / cleanup",
  trashout_odor_pest: "Trash-out / odor / pest",
};

export const REPAIR_TIERS = ["light_cosmetic", "moderate", "heavy"] as const;
export type RepairTier = (typeof REPAIR_TIERS)[number];

export const REPAIR_TIER_LABELS: Record<RepairTier, string> = {
  light_cosmetic: "Light cosmetic ($10k–$25k)",
  moderate: "Moderate ($25k–$55k)",
  heavy: "Heavy ($55k+)",
};

// ---------------------------------------------------------------------------
// 3.7 buyers
// ---------------------------------------------------------------------------
export const BUYER_GRADES = ["A", "B", "C"] as const;
export type BuyerGrade = (typeof BUYER_GRADES)[number];

export const POF_STATUS = ["received", "pending", "none"] as const;
export type PofStatus = (typeof POF_STATUS)[number];

export const EXIT_STRATEGY = ["rental", "flip", "wholetail", "new_build", "specialty"] as const;
export type ExitStrategy = (typeof EXIT_STRATEGY)[number];

export const REHAB_TOLERANCE = ["light", "moderate", "heavy"] as const;
export type RehabTolerance = (typeof REHAB_TOLERANCE)[number];

/** Buyer types — landlord, flipper, wholetail + remaining Chapter 5 types. */
export const BUYER_TYPES = [
  "landlord",
  "flipper",
  "wholetail",
  "builder_developer",
  "buy_and_hold_fund",
  "owner_occupant_investor",
  "note_buyer",
  "other",
] as const;
export type BuyerType = (typeof BUYER_TYPES)[number];

/** Disqualifier checklist — index stored in a boolean array. A buyer with ANY
 * flag is excluded from list counts and buyer-pool depth. */
export const BUYER_DISQUALIFIERS = [
  "No direct contact information",
  "No stated buy box",
  "No proof of funds and no credible lender reference",
  "No understanding of assignment, double close, or earnest money mechanics",
  "No prior close in the relevant market or asset type",
  "Repeated information requests without offers",
  "Retrade history",
  "Refusal to post earnest money in line with the deal",
] as const;

// ---------------------------------------------------------------------------
// 3.13 deal_folders — fixed subfolder structure. No custom folders.
// ---------------------------------------------------------------------------
export const DEAL_FOLDERS = [
  "01 Lead Intake",
  "02 Underwriting",
  "03 Contract",
  "04 Title",
  "05 Buyer Docs",
  "06 Closing",
  "07 Photos",
  "08 Communications",
] as const;
export type DealFolder = (typeof DEAL_FOLDERS)[number];

/** Controlled vocabulary of document types, each mapped to its target folder.
 * The app builds the filename; manual filenames are not accepted. */
export const DOCUMENT_TYPES: Record<string, { label: string; folder: DealFolder }> = {
  SellerLeadSheet: { label: "Seller Lead Sheet", folder: "01 Lead Intake" },
  SkipTraceResult: { label: "Skip Trace Result", folder: "01 Lead Intake" },
  DealAnalysis: { label: "Deal Analysis Sheet", folder: "02 Underwriting" },
  CompsPackage: { label: "Comps Package", folder: "02 Underwriting" },
  RepairEstimate: { label: "Repair Estimate", folder: "02 Underwriting" },
  ExecutedContract: { label: "Executed Contract", folder: "03 Contract" },
  EquitableInterestDisclosure: { label: "Equitable-Interest Disclosure", folder: "03 Contract" },
  AssignmentAgreement: { label: "Assignment Agreement", folder: "03 Contract" },
  EarnestMoneyInstructions: { label: "Earnest Money Instructions", folder: "03 Contract" },
  InspectionAddendum: { label: "Inspection / Due-Diligence Addendum", folder: "03 Contract" },
  AccessAuthorization: { label: "Access Authorization", folder: "03 Contract" },
  CancellationRelease: { label: "Cancellation / Mutual Release", folder: "03 Contract" },
  TitleCommitment: { label: "Title Commitment", folder: "04 Title" },
  TitleOpeningEmail: { label: "Title Opening Email", folder: "04 Title" },
  TitleCommunication: { label: "Title Communication", folder: "04 Title" },
  BuyerProofOfFunds: { label: "Buyer Proof of Funds", folder: "05 Buyer Docs" },
  BuyerAgreement: { label: "Buyer Agreement", folder: "05 Buyer Docs" },
  ClosingStatement: { label: "Closing / Settlement Statement", folder: "06 Closing" },
  PropertyPhoto: { label: "Property Photo", folder: "07 Photos" },
  CommunicationThread: { label: "Key Text / Email Thread", folder: "08 Communications" },
};

/** Save-everything completion meter checklist (3.13). */
export const SAVE_EVERYTHING_CHECKLIST = [
  "seller_lead_sheet",
  "deal_analysis_sheet",
  "signed_contract",
  "title_communications",
  "buyer_proof_of_funds",
  "buyer_agreement",
  "closing_statement",
  "key_threads",
  "property_photos",
] as const;

// ---------------------------------------------------------------------------
// 3.8 contract packet — seven documents.
// ---------------------------------------------------------------------------
export const CONTRACT_PACKET_DOCS = [
  "purchase_contract",
  "equitable_interest_disclosure",
  "assignment_agreement",
  "earnest_money_instructions",
  "inspection_addendum",
  "access_authorization",
  "cancellation_release",
] as const;
export type ContractPacketDoc = (typeof CONTRACT_PACKET_DOCS)[number];

export const CONTRACT_PACKET_LABELS: Record<ContractPacketDoc, string> = {
  purchase_contract: "Purchase contract",
  equitable_interest_disclosure: "Equitable-interest disclosure acknowledgment",
  assignment_agreement: "Assignment agreement",
  earnest_money_instructions: "Earnest money instructions",
  inspection_addendum: "Inspection / due-diligence addendum",
  access_authorization: "Access authorization",
  cancellation_release: "Cancellation / mutual release form",
};

// ---------------------------------------------------------------------------
// 4.2 Master checklist — 19 items, fixed order. A deal is not "Closed" until
// all nineteen are checked.
// ---------------------------------------------------------------------------
export const MASTER_CHECKLIST = [
  "lead_entered",
  "contact_attempted",
  "seller_qualified",
  "property_reviewed",
  "deal_sheet_completed",
  "offer_band_approved",
  "contract_signed",
  "deadlines_calendared",
  "title_opened",
  "buyer_type_identified",
  "deal_package_completed",
  "buyers_contacted",
  "proof_of_funds_received",
  "buyer_selected",
  "closing_coordinated",
  "deal_funded",
  "tax_reserve_moved",
  "kpi_updated",
  "post_close_review_completed",
] as const;
export type MasterChecklistItem = (typeof MASTER_CHECKLIST)[number];

export const MASTER_CHECKLIST_LABELS: Record<MasterChecklistItem, string> = {
  lead_entered: "Lead entered",
  contact_attempted: "Contact attempted",
  seller_qualified: "Seller qualified",
  property_reviewed: "Property reviewed",
  deal_sheet_completed: "Deal sheet completed",
  offer_band_approved: "Offer band approved",
  contract_signed: "Contract signed",
  deadlines_calendared: "Deadlines calendared",
  title_opened: "Title opened",
  buyer_type_identified: "Buyer type identified",
  deal_package_completed: "Deal package completed",
  buyers_contacted: "Buyers contacted",
  proof_of_funds_received: "Proof of funds received",
  buyer_selected: "Buyer selected",
  closing_coordinated: "Closing coordinated",
  deal_funded: "Deal funded",
  tax_reserve_moved: "Tax reserve moved",
  kpi_updated: "KPI updated",
  post_close_review_completed: "Post-close review completed",
};

// ---------------------------------------------------------------------------
// 4.3 Follow-up cadence — offsets in days from lead creation.
// ---------------------------------------------------------------------------
export const FOLLOWUP_CADENCE: { dayOffset: number; label: string; channel: string }[] = [
  { dayOffset: 0, label: "Initial contact and lead sheet capture", channel: "call" },
  { dayOffset: 1, label: "Confirmation message or callback", channel: "text" },
  { dayOffset: 3, label: "Condition or pricing follow-up", channel: "email" },
  { dayOffset: 7, label: "Schedule property visit or advance negotiation", channel: "call" },
  { dayOffset: 14, label: "Re-engagement", channel: "text" },
  { dayOffset: 21, label: "Final close attempt before nurture", channel: "call" },
];

// ---------------------------------------------------------------------------
// 7. Roles
// ---------------------------------------------------------------------------
export const ROLES = [
  "owner_operator",
  "acquisitions",
  "dispositions",
  "transaction_coordinator",
  "virtual_assistant",
  "bookkeeper",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner_operator: "Owner / Operator",
  acquisitions: "Acquisitions",
  dispositions: "Dispositions",
  transaction_coordinator: "Transaction Coordinator",
  virtual_assistant: "Virtual Assistant",
  bookkeeper: "Bookkeeper",
};

/** Roles allowed to see pricing / financials. Used by the app and mirrored by
 * RLS. VA and (for pricing) TC are excluded. */
export const ROLES_WITH_PRICING: Role[] = [
  "owner_operator",
  "acquisitions",
  "dispositions",
];
export const ROLES_WITH_FINANCIALS: Role[] = ["owner_operator", "bookkeeper"];
export const ROLES_CAN_DELETE: Role[] = ["owner_operator"];

export const BUY_PERCENTAGE_PRESETS = [
  { label: "Slow submarket", value: 65 },
  { label: "Standard", value: 70 },
  { label: "Heated", value: 75 },
] as const;

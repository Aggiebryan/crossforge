export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          org_id: string
        }
        Insert: {
          action: string
          actor?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          org_id: string
        }
        Update: {
          action?: string
          actor?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_interest: {
        Row: {
          buyer_id: string | null
          certainty_score: number | null
          channel: string | null
          chk_backup_identified: boolean
          chk_communication_prompt: boolean
          chk_criteria_match: boolean
          chk_em_acceptable: boolean
          chk_no_retrade_signs: boolean
          chk_pof_received: boolean
          chk_understands_structure: boolean
          created_at: string
          created_by: string | null
          date_contacted: string | null
          deleted_at: string | null
          disposition_id: string
          id: string
          interest_level: Database["public"]["Enums"]["interest_level"] | null
          notes: string | null
          offer_amount_cents: number | null
          org_id: string
          pof_received: boolean
          response_received: boolean
          selection_status:
            | Database["public"]["Enums"]["selection_status"]
            | null
          terms: string | null
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          certainty_score?: number | null
          channel?: string | null
          chk_backup_identified?: boolean
          chk_communication_prompt?: boolean
          chk_criteria_match?: boolean
          chk_em_acceptable?: boolean
          chk_no_retrade_signs?: boolean
          chk_pof_received?: boolean
          chk_understands_structure?: boolean
          created_at?: string
          created_by?: string | null
          date_contacted?: string | null
          deleted_at?: string | null
          disposition_id: string
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"] | null
          notes?: string | null
          offer_amount_cents?: number | null
          org_id: string
          pof_received?: boolean
          response_received?: boolean
          selection_status?:
            | Database["public"]["Enums"]["selection_status"]
            | null
          terms?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          certainty_score?: number | null
          channel?: string | null
          chk_backup_identified?: boolean
          chk_communication_prompt?: boolean
          chk_criteria_match?: boolean
          chk_em_acceptable?: boolean
          chk_no_retrade_signs?: boolean
          chk_pof_received?: boolean
          chk_understands_structure?: boolean
          created_at?: string
          created_by?: string | null
          date_contacted?: string | null
          deleted_at?: string | null
          disposition_id?: string
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"] | null
          notes?: string | null
          offer_amount_cents?: number | null
          org_id?: string
          pof_received?: boolean
          response_received?: boolean
          selection_status?:
            | Database["public"]["Enums"]["selection_status"]
            | null
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_interest_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_interest_disposition_id_fkey"
            columns: ["disposition_id"]
            isOneToOne: false
            referencedRelation: "dispositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_interest_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_notes: {
        Row: {
          body: string
          buyer_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          note_date: string
          org_id: string
          reconfirms_buy_box: boolean
          updated_at: string
        }
        Insert: {
          body: string
          buyer_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note_date?: string
          org_id: string
          reconfirms_buy_box?: boolean
          updated_at?: string
        }
        Update: {
          body?: string
          buyer_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note_date?: string
          org_id?: string
          reconfirms_buy_box?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_notes_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          asset_class: string | null
          buyer_grade: Database["public"]["Enums"]["buyer_grade"]
          buyer_name: string
          buyer_type: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          disqualifiers: boolean[]
          email: string | null
          exit_strategies: Database["public"]["Enums"]["exit_strategy"][]
          id: string
          last_meaningful_contact: string | null
          needs_reverify: boolean
          notes: string | null
          org_id: string
          phone: string | null
          preferred_close_timeline: string | null
          preferred_contact_method: string | null
          preferred_title_company: string | null
          price_range_high_cents: number | null
          price_range_low_cents: number | null
          proof_of_funds_date: string | null
          proof_of_funds_path: string | null
          proof_of_funds_source: string | null
          proof_of_funds_status: Database["public"]["Enums"]["pof_status"]
          property_types: string[]
          rehab_tolerance: Database["public"]["Enums"]["rehab_tolerance"] | null
          structure_assignment:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_direct_purchase:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_double_close:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          target_counties: string[]
          target_zips: string[]
          updated_at: string
        }
        Insert: {
          asset_class?: string | null
          buyer_grade?: Database["public"]["Enums"]["buyer_grade"]
          buyer_name: string
          buyer_type?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          disqualifiers?: boolean[]
          email?: string | null
          exit_strategies?: Database["public"]["Enums"]["exit_strategy"][]
          id?: string
          last_meaningful_contact?: string | null
          needs_reverify?: boolean
          notes?: string | null
          org_id: string
          phone?: string | null
          preferred_close_timeline?: string | null
          preferred_contact_method?: string | null
          preferred_title_company?: string | null
          price_range_high_cents?: number | null
          price_range_low_cents?: number | null
          proof_of_funds_date?: string | null
          proof_of_funds_path?: string | null
          proof_of_funds_source?: string | null
          proof_of_funds_status?: Database["public"]["Enums"]["pof_status"]
          property_types?: string[]
          rehab_tolerance?:
            | Database["public"]["Enums"]["rehab_tolerance"]
            | null
          structure_assignment?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_direct_purchase?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_double_close?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          target_counties?: string[]
          target_zips?: string[]
          updated_at?: string
        }
        Update: {
          asset_class?: string | null
          buyer_grade?: Database["public"]["Enums"]["buyer_grade"]
          buyer_name?: string
          buyer_type?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          disqualifiers?: boolean[]
          email?: string | null
          exit_strategies?: Database["public"]["Enums"]["exit_strategy"][]
          id?: string
          last_meaningful_contact?: string | null
          needs_reverify?: boolean
          notes?: string | null
          org_id?: string
          phone?: string | null
          preferred_close_timeline?: string | null
          preferred_contact_method?: string | null
          preferred_title_company?: string | null
          price_range_high_cents?: number | null
          price_range_low_cents?: number | null
          proof_of_funds_date?: string | null
          proof_of_funds_path?: string | null
          proof_of_funds_source?: string | null
          proof_of_funds_status?: Database["public"]["Enums"]["pof_status"]
          property_types?: string[]
          rehab_tolerance?:
            | Database["public"]["Enums"]["rehab_tolerance"]
            | null
          structure_assignment?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_direct_purchase?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_double_close?:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          target_counties?: string[]
          target_zips?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      closings: {
        Row: {
          assignment_fee_documented: boolean
          buyer_id: string | null
          complete: boolean
          contract_id: string | null
          created_at: string
          created_by: string | null
          day_of: Json
          deleted_at: string | null
          direct_expenses_cents: number | null
          funding_confirmed: boolean
          funding_confirmed_at: string | null
          gross_fee_cents: number | null
          id: string
          org_id: string
          post_close: Json
          preclose: Json
          review_completed_at: string | null
          review_what_nearly_failed: string | null
          review_what_to_change: string | null
          seller_disclosure_documented: boolean
          seller_lead_id: string
          settlement_statement_path: string | null
          tax_reserve_cents: number | null
          tax_reserve_task_open: boolean
          updated_at: string
        }
        Insert: {
          assignment_fee_documented?: boolean
          buyer_id?: string | null
          complete?: boolean
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of?: Json
          deleted_at?: string | null
          direct_expenses_cents?: number | null
          funding_confirmed?: boolean
          funding_confirmed_at?: string | null
          gross_fee_cents?: number | null
          id?: string
          org_id: string
          post_close?: Json
          preclose?: Json
          review_completed_at?: string | null
          review_what_nearly_failed?: string | null
          review_what_to_change?: string | null
          seller_disclosure_documented?: boolean
          seller_lead_id: string
          settlement_statement_path?: string | null
          tax_reserve_cents?: number | null
          tax_reserve_task_open?: boolean
          updated_at?: string
        }
        Update: {
          assignment_fee_documented?: boolean
          buyer_id?: string | null
          complete?: boolean
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of?: Json
          deleted_at?: string | null
          direct_expenses_cents?: number | null
          funding_confirmed?: boolean
          funding_confirmed_at?: string | null
          gross_fee_cents?: number | null
          id?: string
          org_id?: string
          post_close?: Json
          preclose?: Json
          review_completed_at?: string | null
          review_what_nearly_failed?: string | null
          review_what_to_change?: string | null
          seller_disclosure_documented?: boolean
          seller_lead_id?: string
          settlement_statement_path?: string | null
          tax_reserve_cents?: number | null
          tax_reserve_task_open?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "closings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closings_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closings_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      comps: {
        Row: {
          address: string | null
          adjustment_notes: string | null
          condition: string | null
          created_at: string
          created_by: string | null
          deal_analysis_id: string
          deleted_at: string | null
          distance_miles: number | null
          id: string
          org_id: string
          price_cents: number | null
          sale_date: string | null
          sqft: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          adjustment_notes?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          deal_analysis_id: string
          deleted_at?: string | null
          distance_miles?: number | null
          id?: string
          org_id: string
          price_cents?: number | null
          sale_date?: string | null
          sqft?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          adjustment_notes?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          deal_analysis_id?: string
          deleted_at?: string | null
          distance_miles?: number | null
          id?: string
          org_id?: string
          price_cents?: number | null
          sale_date?: string | null
          sqft?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comps_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comps_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_deadlines: {
        Row: {
          advance_alert_date: string
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_date: string
          id: string
          kind: Database["public"]["Enums"]["deadline_kind"]
          missed_flag: boolean
          missed_note: string | null
          org_id: string
          seller_lead_id: string
          updated_at: string
        }
        Insert: {
          advance_alert_date: string
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date: string
          id?: string
          kind: Database["public"]["Enums"]["deadline_kind"]
          missed_flag?: boolean
          missed_note?: string | null
          org_id: string
          seller_lead_id: string
          updated_at?: string
        }
        Update: {
          advance_alert_date?: string
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["deadline_kind"]
          missed_flag?: boolean
          missed_note?: string | null
          org_id?: string
          seller_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_deadlines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_deadlines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_deadlines_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_packet_docs: {
        Row: {
          attached_at: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          doc_code: string
          id: string
          org_id: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          attached_at?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_code: string
          id?: string
          org_id: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          attached_at?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_code?: string
          id?: string
          org_id?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_packet_docs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_packet_docs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          access_for_designees_confirmed: boolean
          as_is_language_confirmed: boolean
          assignability_confirmed: boolean
          closing_cost_allocation: string | null
          closing_date: string | null
          contract_signed_date: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          earnest_money_amount_cents: number | null
          earnest_money_confirmation_path: string | null
          earnest_money_deposited_date: string | null
          earnest_money_due_date: string | null
          equitable_interest_disclosure_path: string | null
          equitable_interest_disclosure_signed: boolean
          escrow_instructions_path: string | null
          extension_clause_terms: string | null
          id: string
          inspection_deadline: string | null
          inspection_period_days: number | null
          org_id: string
          purchase_price_cents: number | null
          seller_lead_id: string
          status: Database["public"]["Enums"]["contract_status"]
          target_buyer_placement_deadline: string | null
          title_objection_deadline: string | null
          updated_at: string
          verified_title_contact: boolean
          wire_verified_by_phone: boolean
        }
        Insert: {
          access_for_designees_confirmed?: boolean
          as_is_language_confirmed?: boolean
          assignability_confirmed?: boolean
          closing_cost_allocation?: string | null
          closing_date?: string | null
          contract_signed_date?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          earnest_money_amount_cents?: number | null
          earnest_money_confirmation_path?: string | null
          earnest_money_deposited_date?: string | null
          earnest_money_due_date?: string | null
          equitable_interest_disclosure_path?: string | null
          equitable_interest_disclosure_signed?: boolean
          escrow_instructions_path?: string | null
          extension_clause_terms?: string | null
          id?: string
          inspection_deadline?: string | null
          inspection_period_days?: number | null
          org_id: string
          purchase_price_cents?: number | null
          seller_lead_id: string
          status?: Database["public"]["Enums"]["contract_status"]
          target_buyer_placement_deadline?: string | null
          title_objection_deadline?: string | null
          updated_at?: string
          verified_title_contact?: boolean
          wire_verified_by_phone?: boolean
        }
        Update: {
          access_for_designees_confirmed?: boolean
          as_is_language_confirmed?: boolean
          assignability_confirmed?: boolean
          closing_cost_allocation?: string | null
          closing_date?: string | null
          contract_signed_date?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          earnest_money_amount_cents?: number | null
          earnest_money_confirmation_path?: string | null
          earnest_money_deposited_date?: string | null
          earnest_money_due_date?: string | null
          equitable_interest_disclosure_path?: string | null
          equitable_interest_disclosure_signed?: boolean
          escrow_instructions_path?: string | null
          extension_clause_terms?: string | null
          id?: string
          inspection_deadline?: string | null
          inspection_period_days?: number | null
          org_id?: string
          purchase_price_cents?: number | null
          seller_lead_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          target_buyer_placement_deadline?: string | null
          title_objection_deadline?: string | null
          updated_at?: string
          verified_title_contact?: boolean
          wire_verified_by_phone?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          eod_buyer_commitments: number | null
          eod_contracts_signed: number | null
          eod_new_leads: number | null
          eod_offers_made: number | null
          eod_problems: string | null
          eod_seller_convos: number | null
          id: string
          log_date: string
          nn_buyer_touchpoint: boolean
          nn_lead_followup: boolean
          nn_pipeline_review: boolean
          nn_underwriting_decision: boolean
          org_id: string
          process_weakness: string | null
          top_priorities: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          eod_buyer_commitments?: number | null
          eod_contracts_signed?: number | null
          eod_new_leads?: number | null
          eod_offers_made?: number | null
          eod_problems?: string | null
          eod_seller_convos?: number | null
          id?: string
          log_date?: string
          nn_buyer_touchpoint?: boolean
          nn_lead_followup?: boolean
          nn_pipeline_review?: boolean
          nn_underwriting_decision?: boolean
          org_id: string
          process_weakness?: string | null
          top_priorities?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          eod_buyer_commitments?: number | null
          eod_contracts_signed?: number | null
          eod_new_leads?: number | null
          eod_offers_made?: number | null
          eod_problems?: string | null
          eod_seller_convos?: number | null
          id?: string
          log_date?: string
          nn_buyer_touchpoint?: boolean
          nn_lead_followup?: boolean
          nn_pipeline_review?: boolean
          nn_underwriting_decision?: boolean
          org_id?: string
          process_weakness?: string | null
          top_priorities?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_analysis: {
        Row: {
          acceptable_offer_cents: number | null
          arv_conservative_cents: number | null
          arv_likely_cents: number | null
          arv_optimistic_cents: number | null
          beds_baths_sqft: string | null
          buy_percentage: number
          county: string | null
          created_at: string
          created_by: string | null
          decision: Database["public"]["Enums"]["deal_decision"] | null
          deleted_at: string | null
          estimated_buyer_costs_cents: number | null
          id: string
          ideal_offer_cents: number | null
          known_occupancy_risks: string | null
          known_title_risks: string | null
          likely_buyer_type:
            | Database["public"]["Enums"]["likely_buyer_type"]
            | null
          neighborhood_notes: string | null
          occupancy: Database["public"]["Enums"]["occupancy_status"] | null
          offer_band_approved_at: string | null
          org_id: string
          property_address: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          repair_high_cents: number | null
          repair_likely_cents: number | null
          repair_low_cents: number | null
          risk_comments: string | null
          selected_repair_tier:
            | Database["public"]["Enums"]["repair_tier"]
            | null
          seller_lead_id: string
          target_fee_high_cents: number | null
          target_fee_low_cents: number | null
          updated_at: string
          walk_away_number_cents: number | null
          wholesaler_fee_cents: number
          zip: string | null
        }
        Insert: {
          acceptable_offer_cents?: number | null
          arv_conservative_cents?: number | null
          arv_likely_cents?: number | null
          arv_optimistic_cents?: number | null
          beds_baths_sqft?: string | null
          buy_percentage?: number
          county?: string | null
          created_at?: string
          created_by?: string | null
          decision?: Database["public"]["Enums"]["deal_decision"] | null
          deleted_at?: string | null
          estimated_buyer_costs_cents?: number | null
          id?: string
          ideal_offer_cents?: number | null
          known_occupancy_risks?: string | null
          known_title_risks?: string | null
          likely_buyer_type?:
            | Database["public"]["Enums"]["likely_buyer_type"]
            | null
          neighborhood_notes?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"] | null
          offer_band_approved_at?: string | null
          org_id: string
          property_address?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          repair_high_cents?: number | null
          repair_likely_cents?: number | null
          repair_low_cents?: number | null
          risk_comments?: string | null
          selected_repair_tier?:
            | Database["public"]["Enums"]["repair_tier"]
            | null
          seller_lead_id: string
          target_fee_high_cents?: number | null
          target_fee_low_cents?: number | null
          updated_at?: string
          walk_away_number_cents?: number | null
          wholesaler_fee_cents?: number
          zip?: string | null
        }
        Update: {
          acceptable_offer_cents?: number | null
          arv_conservative_cents?: number | null
          arv_likely_cents?: number | null
          arv_optimistic_cents?: number | null
          beds_baths_sqft?: string | null
          buy_percentage?: number
          county?: string | null
          created_at?: string
          created_by?: string | null
          decision?: Database["public"]["Enums"]["deal_decision"] | null
          deleted_at?: string | null
          estimated_buyer_costs_cents?: number | null
          id?: string
          ideal_offer_cents?: number | null
          known_occupancy_risks?: string | null
          known_title_risks?: string | null
          likely_buyer_type?:
            | Database["public"]["Enums"]["likely_buyer_type"]
            | null
          neighborhood_notes?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"] | null
          offer_band_approved_at?: string | null
          org_id?: string
          property_address?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          repair_high_cents?: number | null
          repair_likely_cents?: number | null
          repair_low_cents?: number | null
          risk_comments?: string | null
          selected_repair_tier?:
            | Database["public"]["Enums"]["repair_tier"]
            | null
          seller_lead_id?: string
          target_fee_high_cents?: number | null
          target_fee_low_cents?: number | null
          updated_at?: string
          walk_away_number_cents?: number | null
          wholesaler_fee_cents?: number
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_analysis_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_analysis_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_checklist: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          item_code: string
          org_id: string
          seller_lead_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          item_code: string
          org_id: string
          seller_lead_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          item_code?: string
          org_id?: string
          seller_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_checklist_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_checklist_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_documents: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_type: string
          filename: string
          folder: string
          id: string
          org_id: string
          seller_lead_id: string
          storage_path: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type: string
          filename: string
          folder: string
          id?: string
          org_id: string
          seller_lead_id: string
          storage_path: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type?: string
          filename?: string
          folder?: string
          id?: string
          org_id?: string
          seller_lead_id?: string
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_documents_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_folders: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          org_id: string
          seller_lead_id: string
          storage_prefix: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id: string
          seller_lead_id: string
          storage_prefix: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id?: string
          seller_lead_id?: string
          storage_prefix?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_folders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_folders_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dispositions: {
        Row: {
          a_tier_sent_at: string | null
          b_tier_unlock_hours: number
          blast_body: string | null
          certainty_notice_sent: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          org_id: string
          seller_lead_id: string
          structure_decision: string | null
          structure_reason: string | null
          updated_at: string
          went_live_at: string | null
        }
        Insert: {
          a_tier_sent_at?: string | null
          b_tier_unlock_hours?: number
          blast_body?: string | null
          certainty_notice_sent?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id: string
          seller_lead_id: string
          structure_decision?: string | null
          structure_reason?: string | null
          updated_at?: string
          went_live_at?: string | null
        }
        Update: {
          a_tier_sent_at?: string | null
          b_tier_unlock_hours?: number
          blast_body?: string | null
          certainty_notice_sent?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id?: string
          seller_lead_id?: string
          structure_decision?: string | null
          structure_reason?: string | null
          updated_at?: string
          went_live_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispositions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispositions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispositions_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      failure_log: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          failure_type: string
          id: string
          org_id: string
          related_sop_task_type: string | null
          seller_lead_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failure_type: string
          id?: string
          org_id: string
          related_sop_task_type?: string | null
          seller_lead_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          failure_type?: string
          id?: string
          org_id?: string
          related_sop_task_type?: string | null
          seller_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failure_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failure_log_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          amount_cents: number
          closing_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          org_id: string
          recognized_at: string
        }
        Insert: {
          amount_cents: number
          closing_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id: string
          recognized_at?: string
        }
        Update: {
          amount_cents?: number
          closing_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id?: string
          recognized_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_entries_closing_id_fkey"
            columns: ["closing_id"]
            isOneToOne: false
            referencedRelation: "closings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_months: {
        Row: {
          contracts_signed: number
          created_at: string
          created_by: string | null
          deals_closed: number
          deleted_at: string | null
          gross_fees_cents: number
          id: string
          lead_source_id: string
          leads_generated: number
          month: string
          org_id: string
          qualified_leads: number
          spend_cents: number
          tier: string | null
          updated_at: string
          verdict: string | null
        }
        Insert: {
          contracts_signed?: number
          created_at?: string
          created_by?: string | null
          deals_closed?: number
          deleted_at?: string | null
          gross_fees_cents?: number
          id?: string
          lead_source_id: string
          leads_generated?: number
          month: string
          org_id: string
          qualified_leads?: number
          spend_cents?: number
          tier?: string | null
          updated_at?: string
          verdict?: string | null
        }
        Update: {
          contracts_signed?: number
          created_at?: string
          created_by?: string | null
          deals_closed?: number
          deleted_at?: string | null
          gross_fees_cents?: number
          id?: string
          lead_source_id?: string
          leads_generated?: number
          month?: string
          org_id?: string
          qualified_leads?: number
          spend_cents?: number
          tier?: string | null
          updated_at?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_source_months_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_source_months_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          active: boolean
          channel: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          channel?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          channel?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_stages: {
        Row: {
          code: Database["public"]["Enums"]["lead_stage"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          label: string
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["lead_stage"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label: string
          org_id: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["lead_stage"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label?: string
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_touches: {
        Row: {
          channel: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_date: string
          id: string
          label: string | null
          next_touch_date: string | null
          org_id: string
          outcome: string | null
          seller_lead_id: string
          updated_at: string
        }
        Insert: {
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date: string
          id?: string
          label?: string | null
          next_touch_date?: string | null
          org_id: string
          outcome?: string | null
          seller_lead_id: string
          updated_at?: string
        }
        Update: {
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string
          id?: string
          label?: string | null
          next_touch_date?: string | null
          org_id?: string
          outcome?: string | null
          seller_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_touches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_touches_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      mao_adjustments: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          deal_analysis_id: string
          deleted_at: string | null
          id: string
          org_id: string
          reason: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          deal_analysis_id: string
          deleted_at?: string | null
          id?: string
          org_id: string
          reason: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          deal_analysis_id?: string
          deleted_at?: string | null
          id?: string
          org_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "mao_adjustments_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: false
            referencedRelation: "deal_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mao_adjustments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          org_id: string
          role: Database["public"]["Enums"]["role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          business_tz: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          em_reserve_threshold_cents: number
          id: string
          name: string
          packet_legal_review_date: string | null
          tax_reserve_pct: number
          updated_at: string
        }
        Insert: {
          business_tz?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          em_reserve_threshold_cents?: number
          id?: string
          name: string
          packet_legal_review_date?: string | null
          tax_reserve_pct?: number
          updated_at?: string
        }
        Update: {
          business_tz?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          em_reserve_threshold_cents?: number
          id?: string
          name?: string
          packet_legal_review_date?: string | null
          tax_reserve_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      qualifications: {
        Row: {
          bucket_debt_equity: Json | null
          bucket_motivation: Json | null
          bucket_occupancy_access: Json | null
          bucket_ownership_title: Json | null
          bucket_pricing: Json | null
          bucket_property_facts: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          note_authority: string | null
          note_condition: string | null
          note_motivation: string | null
          note_price_flexibility: string | null
          note_timeline: string | null
          org_id: string
          red_flag_override: string | null
          red_flags: boolean[]
          score_authority: number | null
          score_condition: number | null
          score_motivation: number | null
          score_price_flexibility: number | null
          score_timeline: number | null
          seller_lead_id: string
          updated_at: string
        }
        Insert: {
          bucket_debt_equity?: Json | null
          bucket_motivation?: Json | null
          bucket_occupancy_access?: Json | null
          bucket_ownership_title?: Json | null
          bucket_pricing?: Json | null
          bucket_property_facts?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note_authority?: string | null
          note_condition?: string | null
          note_motivation?: string | null
          note_price_flexibility?: string | null
          note_timeline?: string | null
          org_id: string
          red_flag_override?: string | null
          red_flags?: boolean[]
          score_authority?: number | null
          score_condition?: number | null
          score_motivation?: number | null
          score_price_flexibility?: number | null
          score_timeline?: number | null
          seller_lead_id: string
          updated_at?: string
        }
        Update: {
          bucket_debt_equity?: Json | null
          bucket_motivation?: Json | null
          bucket_occupancy_access?: Json | null
          bucket_ownership_title?: Json | null
          bucket_pricing?: Json | null
          bucket_property_facts?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          note_authority?: string | null
          note_condition?: string | null
          note_motivation?: string | null
          note_price_flexibility?: string | null
          note_timeline?: string | null
          org_id?: string
          red_flag_override?: string | null
          red_flags?: boolean[]
          score_authority?: number | null
          score_condition?: number | null
          score_motivation?: number | null
          score_price_flexibility?: number | null
          score_timeline?: number | null
          seller_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualifications_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_estimates: {
        Row: {
          computed_tier: Database["public"]["Enums"]["repair_tier"] | null
          contingency_high_cents: number | null
          contingency_likely_cents: number | null
          contingency_low_cents: number | null
          contingency_pct: number
          created_at: string
          created_by: string | null
          deal_analysis_id: string
          deleted_at: string | null
          id: string
          lines: Json
          org_id: string
          subtotal_high_cents: number | null
          subtotal_likely_cents: number | null
          subtotal_low_cents: number | null
          total_high_cents: number | null
          total_likely_cents: number | null
          total_low_cents: number | null
          updated_at: string
        }
        Insert: {
          computed_tier?: Database["public"]["Enums"]["repair_tier"] | null
          contingency_high_cents?: number | null
          contingency_likely_cents?: number | null
          contingency_low_cents?: number | null
          contingency_pct?: number
          created_at?: string
          created_by?: string | null
          deal_analysis_id: string
          deleted_at?: string | null
          id?: string
          lines?: Json
          org_id: string
          subtotal_high_cents?: number | null
          subtotal_likely_cents?: number | null
          subtotal_low_cents?: number | null
          total_high_cents?: number | null
          total_likely_cents?: number | null
          total_low_cents?: number | null
          updated_at?: string
        }
        Update: {
          computed_tier?: Database["public"]["Enums"]["repair_tier"] | null
          contingency_high_cents?: number | null
          contingency_likely_cents?: number | null
          contingency_low_cents?: number | null
          contingency_pct?: number
          created_at?: string
          created_by?: string | null
          deal_analysis_id?: string
          deleted_at?: string | null
          id?: string
          lines?: Json
          org_id?: string
          subtotal_high_cents?: number | null
          subtotal_likely_cents?: number | null
          subtotal_low_cents?: number | null
          total_high_cents?: number | null
          total_likely_cents?: number | null
          total_low_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_estimates_deal_analysis_id_fkey"
            columns: ["deal_analysis_id"]
            isOneToOne: true
            referencedRelation: "deal_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_estimates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      review_gates: {
        Row: {
          checklist: Json
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          gate_key: string
          id: string
          org_id: string
          seller_lead_id: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          gate_key: string
          id?: string
          org_id: string
          seller_lead_id: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          gate_key?: string
          id?: string
          org_id?: string
          seller_lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_gates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_gates_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_leads: {
        Row: {
          access_available:
            | Database["public"]["Enums"]["access_available"]
            | null
          assigned_to: string | null
          baths: number | null
          beds: number | null
          buyer_placed_at: string | null
          city: string | null
          closed_at: string | null
          condition_notes: string | null
          contract_signed_at: string | null
          county: string | null
          created_at: string
          created_by: string | null
          date_created: string
          deleted_at: string | null
          email: string | null
          flag_limited_access: boolean
          flag_seller_evasive: boolean
          flag_utilities_off: boolean
          flag_vacancy_over_12mo: boolean
          follow_up_date: string | null
          foundation_notes: string | null
          how_seller_arrived_at_price: string | null
          hvac_notes: string | null
          id: string
          is_incomplete: boolean
          lead_rating: Database["public"]["Enums"]["lead_rating"] | null
          lead_source_id: string | null
          lot_notes: string | null
          mailing_address: string | null
          major_damage_notes: string | null
          mortgage_payoff_estimate_cents: number | null
          next_action: string | null
          next_touch_date: string | null
          occupancy_status:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          org_id: string
          owner_name: string | null
          phone_1: string | null
          phone_2: string | null
          plumbing_electrical_notes: string | null
          property_address: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          reason_for_selling: string | null
          roof_notes: string | null
          seller_asking_price_cents: number | null
          seller_timeline: string | null
          square_feet: number | null
          stage: Database["public"]["Enums"]["lead_stage"]
          state: string | null
          street: string | null
          taxes_liens_hoa_notes: string | null
          updated_at: string
          who_must_sign: string | null
          year_built: number | null
          zip: string | null
        }
        Insert: {
          access_available?:
            | Database["public"]["Enums"]["access_available"]
            | null
          assigned_to?: string | null
          baths?: number | null
          beds?: number | null
          buyer_placed_at?: string | null
          city?: string | null
          closed_at?: string | null
          condition_notes?: string | null
          contract_signed_at?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          date_created?: string
          deleted_at?: string | null
          email?: string | null
          flag_limited_access?: boolean
          flag_seller_evasive?: boolean
          flag_utilities_off?: boolean
          flag_vacancy_over_12mo?: boolean
          follow_up_date?: string | null
          foundation_notes?: string | null
          how_seller_arrived_at_price?: string | null
          hvac_notes?: string | null
          id?: string
          is_incomplete?: boolean
          lead_rating?: Database["public"]["Enums"]["lead_rating"] | null
          lead_source_id?: string | null
          lot_notes?: string | null
          mailing_address?: string | null
          major_damage_notes?: string | null
          mortgage_payoff_estimate_cents?: number | null
          next_action?: string | null
          next_touch_date?: string | null
          occupancy_status?:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          org_id: string
          owner_name?: string | null
          phone_1?: string | null
          phone_2?: string | null
          plumbing_electrical_notes?: string | null
          property_address?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reason_for_selling?: string | null
          roof_notes?: string | null
          seller_asking_price_cents?: number | null
          seller_timeline?: string | null
          square_feet?: number | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          state?: string | null
          street?: string | null
          taxes_liens_hoa_notes?: string | null
          updated_at?: string
          who_must_sign?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Update: {
          access_available?:
            | Database["public"]["Enums"]["access_available"]
            | null
          assigned_to?: string | null
          baths?: number | null
          beds?: number | null
          buyer_placed_at?: string | null
          city?: string | null
          closed_at?: string | null
          condition_notes?: string | null
          contract_signed_at?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          date_created?: string
          deleted_at?: string | null
          email?: string | null
          flag_limited_access?: boolean
          flag_seller_evasive?: boolean
          flag_utilities_off?: boolean
          flag_vacancy_over_12mo?: boolean
          follow_up_date?: string | null
          foundation_notes?: string | null
          how_seller_arrived_at_price?: string | null
          hvac_notes?: string | null
          id?: string
          is_incomplete?: boolean
          lead_rating?: Database["public"]["Enums"]["lead_rating"] | null
          lead_source_id?: string | null
          lot_notes?: string | null
          mailing_address?: string | null
          major_damage_notes?: string | null
          mortgage_payoff_estimate_cents?: number | null
          next_action?: string | null
          next_touch_date?: string | null
          occupancy_status?:
            | Database["public"]["Enums"]["occupancy_status"]
            | null
          org_id?: string
          owner_name?: string | null
          phone_1?: string | null
          phone_2?: string | null
          plumbing_electrical_notes?: string | null
          property_address?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reason_for_selling?: string | null
          roof_notes?: string | null
          seller_asking_price_cents?: number | null
          seller_timeline?: string | null
          square_feet?: number | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          state?: string | null
          street?: string | null
          taxes_liens_hoa_notes?: string | null
          updated_at?: string
          who_must_sign?: string | null
          year_built?: number | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_leads_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_acknowledgements: {
        Row: {
          acknowledged_at: string
          id: string
          org_id: string
          sop_id: string
          sop_version: number
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          id?: string
          org_id: string
          sop_id: string
          sop_version: number
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          id?: string
          org_id?: string
          sop_id?: string
          sop_version?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_acknowledgements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_defect_tickets: {
        Row: {
          created_at: string
          failure_type: string
          framing: string
          id: string
          incident_ids: string[]
          org_id: string
          related_sop_task_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          failure_type: string
          framing?: string
          id?: string
          incident_ids?: string[]
          org_id: string
          related_sop_task_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          failure_type?: string
          framing?: string
          id?: string
          incident_ids?: string[]
          org_id?: string
          related_sop_task_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_defect_tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          escalation: string | null
          id: string
          org_id: string
          purpose: string | null
          quality_checks: string | null
          required_fields: string | null
          steps: string | null
          task_type: string
          title: string
          trigger: string | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          escalation?: string | null
          id?: string
          org_id: string
          purpose?: string | null
          quality_checks?: string | null
          required_fields?: string | null
          steps?: string | null
          task_type: string
          title: string
          trigger?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          escalation?: string | null
          id?: string
          org_id?: string
          purpose?: string | null
          quality_checks?: string | null
          required_fields?: string | null
          steps?: string | null
          task_type?: string
          title?: string
          trigger?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "sops_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      state_rules: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          disclosure_requirements: string | null
          id: string
          licensing_notes: string | null
          org_id: string
          registration_requirements: string | null
          state_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          disclosure_requirements?: string | null
          id?: string
          licensing_notes?: string | null
          org_id: string
          registration_requirements?: string | null
          state_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          disclosure_requirements?: string | null
          id?: string
          licensing_notes?: string | null
          org_id?: string
          registration_requirements?: string | null
          state_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          key: string
          org_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          key: string
          org_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          key?: string
          org_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      title_files: {
        Row: {
          closer_contact: string | null
          commitment_path: string | null
          commitment_received_date: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          file_tier: Database["public"]["Enums"]["title_tier"]
          id: string
          lens_liens: Database["public"]["Enums"]["title_tier"]
          lens_ownership: Database["public"]["Enums"]["title_tier"]
          lens_property_specific: Database["public"]["Enums"]["title_tier"]
          opened_date: string | null
          opening_variance_flag: boolean
          org_id: string
          seller_lead_id: string
          title_company: string | null
          updated_at: string
        }
        Insert: {
          closer_contact?: string | null
          commitment_path?: string | null
          commitment_received_date?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_tier?: Database["public"]["Enums"]["title_tier"]
          id?: string
          lens_liens?: Database["public"]["Enums"]["title_tier"]
          lens_ownership?: Database["public"]["Enums"]["title_tier"]
          lens_property_specific?: Database["public"]["Enums"]["title_tier"]
          opened_date?: string | null
          opening_variance_flag?: boolean
          org_id: string
          seller_lead_id: string
          title_company?: string | null
          updated_at?: string
        }
        Update: {
          closer_contact?: string | null
          commitment_path?: string | null
          commitment_received_date?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_tier?: Database["public"]["Enums"]["title_tier"]
          id?: string
          lens_liens?: Database["public"]["Enums"]["title_tier"]
          lens_ownership?: Database["public"]["Enums"]["title_tier"]
          lens_property_specific?: Database["public"]["Enums"]["title_tier"]
          opened_date?: string | null
          opening_variance_flag?: boolean
          org_id?: string
          seller_lead_id?: string
          title_company?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_files_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_files_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_files_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: true
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      title_issues: {
        Row: {
          buyer_will_still_perform: boolean | null
          category: Database["public"]["Enums"]["title_lens"]
          created_at: string
          created_by: string | null
          cure_realistic_in_window: boolean | null
          deleted_at: string | null
          estimated_cure_timeline: string | null
          id: string
          issue: string
          org_id: string
          resolution: string | null
          severity: Database["public"]["Enums"]["title_tier"]
          title_file_id: string
          updated_at: string
          who_must_fix: string | null
        }
        Insert: {
          buyer_will_still_perform?: boolean | null
          category: Database["public"]["Enums"]["title_lens"]
          created_at?: string
          created_by?: string | null
          cure_realistic_in_window?: boolean | null
          deleted_at?: string | null
          estimated_cure_timeline?: string | null
          id?: string
          issue: string
          org_id: string
          resolution?: string | null
          severity?: Database["public"]["Enums"]["title_tier"]
          title_file_id: string
          updated_at?: string
          who_must_fix?: string | null
        }
        Update: {
          buyer_will_still_perform?: boolean | null
          category?: Database["public"]["Enums"]["title_lens"]
          created_at?: string
          created_by?: string | null
          cure_realistic_in_window?: boolean | null
          deleted_at?: string | null
          estimated_cure_timeline?: string | null
          id?: string
          issue?: string
          org_id?: string
          resolution?: string | null
          severity?: Database["public"]["Enums"]["title_tier"]
          title_file_id?: string
          updated_at?: string
          who_must_fix?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "title_issues_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_issues_title_file_id_fkey"
            columns: ["title_file_id"]
            isOneToOne: false
            referencedRelation: "title_files"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_away_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          justification: string
          offer_cents: number
          org_id: string
          seller_lead_id: string
          walk_away_cents: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          justification: string
          offer_cents: number
          org_id: string
          seller_lead_id: string
          walk_away_cents: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          justification?: string
          offer_cents?: number
          org_id?: string
          seller_lead_id?: string
          walk_away_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "walk_away_overrides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_away_overrides_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          created_at: string
          delivered: boolean
          event_type: string
          id: string
          org_id: string
          payload: Json
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered?: boolean
          event_type: string
          id?: string
          org_id: string
          payload: Json
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered?: boolean
          event_type?: string
          id?: string
          org_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          events: string[]
          id: string
          org_id: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          events?: string[]
          id?: string
          org_id: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          events?: string[]
          id?: string
          org_id?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_delete: { Args: { target_org: string }; Returns: boolean }
      current_role_in: {
        Args: { target_org: string }
        Returns: Database["public"]["Enums"]["role"]
      }
      has_financials_access: { Args: { target_org: string }; Returns: boolean }
      has_pricing_access: { Args: { target_org: string }; Returns: boolean }
      is_member: { Args: { target_org: string }; Returns: boolean }
      job_buyer_grade_decay: { Args: never; Returns: number }
      job_deadline_alerts: { Args: never; Returns: number }
      job_escalate_stale_yellow: { Args: never; Returns: number }
      match_buyers: {
        Args: {
          p_county: string
          p_org: string
          p_price_cents: number
          p_zip: string
        }
        Returns: {
          asset_class: string | null
          buyer_grade: Database["public"]["Enums"]["buyer_grade"]
          buyer_name: string
          buyer_type: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          disqualifiers: boolean[]
          email: string | null
          exit_strategies: Database["public"]["Enums"]["exit_strategy"][]
          id: string
          last_meaningful_contact: string | null
          needs_reverify: boolean
          notes: string | null
          org_id: string
          phone: string | null
          preferred_close_timeline: string | null
          preferred_contact_method: string | null
          preferred_title_company: string | null
          price_range_high_cents: number | null
          price_range_low_cents: number | null
          proof_of_funds_date: string | null
          proof_of_funds_path: string | null
          proof_of_funds_source: string | null
          proof_of_funds_status: Database["public"]["Enums"]["pof_status"]
          property_types: string[]
          rehab_tolerance: Database["public"]["Enums"]["rehab_tolerance"] | null
          structure_assignment:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_direct_purchase:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          structure_double_close:
            | Database["public"]["Enums"]["structure_pref"]
            | null
          target_counties: string[]
          target_zips: string[]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "buyers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rank_to_tier: {
        Args: { r: number }
        Returns: Database["public"]["Enums"]["title_tier"]
      }
      recompute_title_tier: {
        Args: { p_title_file: string }
        Returns: undefined
      }
      seed_org: { Args: { p_actor: string; p_org: string }; Returns: undefined }
      va_task_allowed: {
        Args: { p_org: string; p_task_type: string; p_user: string }
        Returns: boolean
      }
    }
    Enums: {
      access_available: "yes" | "no" | "limited"
      buyer_grade: "A" | "B" | "C"
      contract_status: "active" | "terminated" | "closed"
      deadline_kind:
        | "earnest_money_due"
        | "inspection_deadline"
        | "title_objection_deadline"
        | "buyer_marketing_start"
        | "final_buyer_selection_deadline"
        | "closing_date"
      deal_decision: "offer" | "do_not_offer" | "follow_up_for_more_info"
      exit_strategy: "rental" | "flip" | "wholetail" | "new_build" | "specialty"
      interest_level: "hot" | "warm" | "cold" | "no"
      lead_rating: "strong" | "medium" | "weak"
      lead_stage:
        | "new"
        | "skip_traced"
        | "attempting_contact"
        | "contact_made"
        | "follow_up"
        | "qualified"
        | "offer_pending"
        | "offer_made"
        | "negotiating"
        | "contract_sent"
        | "under_contract"
        | "title_opened"
        | "disposition_active"
        | "assigned"
        | "double_close_pending"
        | "closed"
        | "dead"
        | "long_term_nurture"
      likely_buyer_type:
        | "flipper"
        | "landlord"
        | "wholetail"
        | "builder"
        | "other"
      occupancy_status: "owner_occupied" | "tenant" | "vacant" | "unknown"
      pof_status: "received" | "pending" | "none"
      property_type: "single_family" | "duplex" | "townhome" | "other"
      rehab_tolerance: "light" | "moderate" | "heavy"
      repair_tier: "light_cosmetic" | "moderate" | "heavy"
      role:
        | "owner_operator"
        | "acquisitions"
        | "dispositions"
        | "transaction_coordinator"
        | "virtual_assistant"
        | "bookkeeper"
      selection_status: "primary" | "backup" | "passed"
      structure_pref: "yes" | "no" | "sometimes"
      title_lens: "ownership" | "lien" | "property_specific"
      title_tier: "green" | "yellow" | "red"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_available: ["yes", "no", "limited"],
      buyer_grade: ["A", "B", "C"],
      contract_status: ["active", "terminated", "closed"],
      deadline_kind: [
        "earnest_money_due",
        "inspection_deadline",
        "title_objection_deadline",
        "buyer_marketing_start",
        "final_buyer_selection_deadline",
        "closing_date",
      ],
      deal_decision: ["offer", "do_not_offer", "follow_up_for_more_info"],
      exit_strategy: ["rental", "flip", "wholetail", "new_build", "specialty"],
      interest_level: ["hot", "warm", "cold", "no"],
      lead_rating: ["strong", "medium", "weak"],
      lead_stage: [
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
      ],
      likely_buyer_type: [
        "flipper",
        "landlord",
        "wholetail",
        "builder",
        "other",
      ],
      occupancy_status: ["owner_occupied", "tenant", "vacant", "unknown"],
      pof_status: ["received", "pending", "none"],
      property_type: ["single_family", "duplex", "townhome", "other"],
      rehab_tolerance: ["light", "moderate", "heavy"],
      repair_tier: ["light_cosmetic", "moderate", "heavy"],
      role: [
        "owner_operator",
        "acquisitions",
        "dispositions",
        "transaction_coordinator",
        "virtual_assistant",
        "bookkeeper",
      ],
      selection_status: ["primary", "backup", "passed"],
      structure_pref: ["yes", "no", "sometimes"],
      title_lens: ["ownership", "lien", "property_specific"],
      title_tier: ["green", "yellow", "red"],
    },
  },
} as const

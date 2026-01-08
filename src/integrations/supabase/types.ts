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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          commission_rate: number | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nationality: string | null
          passport_no: string | null
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nationality?: string | null
          passport_no?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nationality?: string | null
          passport_no?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      entry_tickets: {
        Row: {
          adult_rate: number | null
          child_rate: number | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          adult_rate?: number | null
          child_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          adult_rate?: number | null
          child_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotel_rate_periods: {
        Row: {
          created_at: string
          end_date: string
          hotel_id: string
          id: string
          meal_plan: string
          rate: number
          room_type: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          hotel_id: string
          id?: string
          meal_plan: string
          rate: number
          room_type: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          hotel_id?: string
          id?: string
          meal_plan?: string
          rate?: number
          room_type?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rate_periods_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          category: string
          child_with_bed: number | null
          child_without_bed: number | null
          child_without_bed_3to5: number | null
          child_without_bed_5to11: number | null
          created_at: string
          double_room: number | null
          extra_bed: number | null
          id: string
          infant: number | null
          location: string
          meal_plan: string | null
          name: string
          quad_room: number | null
          single_room: number | null
          six_room: number | null
          status: string | null
          triple_room: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          child_with_bed?: number | null
          child_without_bed?: number | null
          child_without_bed_3to5?: number | null
          child_without_bed_5to11?: number | null
          created_at?: string
          double_room?: number | null
          extra_bed?: number | null
          id?: string
          infant?: number | null
          location?: string
          meal_plan?: string | null
          name: string
          quad_room?: number | null
          single_room?: number | null
          six_room?: number | null
          status?: string | null
          triple_room?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          child_with_bed?: number | null
          child_without_bed?: number | null
          child_without_bed_3to5?: number | null
          child_without_bed_5to11?: number | null
          created_at?: string
          double_room?: number | null
          extra_bed?: number | null
          id?: string
          infant?: number | null
          location?: string
          meal_plan?: string | null
          name?: string
          quad_room?: number | null
          single_room?: number | null
          six_room?: number | null
          status?: string | null
          triple_room?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string
          cuisine: string | null
          description: string | null
          id: string
          meal_type: string
          name: string
          rate: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuisine?: string | null
          description?: string | null
          id?: string
          meal_type?: string
          name: string
          rate?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuisine?: string | null
          description?: string | null
          id?: string
          meal_type?: string
          name?: string
          rate?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          item_type: string
          quantity: number | null
          quotation_id: string
          rate: number | null
          total: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          item_type: string
          quantity?: number | null
          quotation_id: string
          rate?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          item_type?: string
          quantity?: number | null
          quotation_id?: string
          rate?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          adults: number | null
          agent_id: string | null
          arrival_date: string
          children: number | null
          created_at: string
          customer_id: string | null
          departure_date: string
          grand_total: number | null
          hotel_id: string | null
          hotel_total: number | null
          id: string
          infants: number | null
          meal_plan: string | null
          meal_total: number | null
          notes: string | null
          per_person_cost: number | null
          quotation_number: string
          room_type: string | null
          sightseeing_total: number | null
          status: string | null
          transfer_total: number | null
          updated_at: string
          visa_total: number | null
        }
        Insert: {
          adults?: number | null
          agent_id?: string | null
          arrival_date: string
          children?: number | null
          created_at?: string
          customer_id?: string | null
          departure_date: string
          grand_total?: number | null
          hotel_id?: string | null
          hotel_total?: number | null
          id?: string
          infants?: number | null
          meal_plan?: string | null
          meal_total?: number | null
          notes?: string | null
          per_person_cost?: number | null
          quotation_number: string
          room_type?: string | null
          sightseeing_total?: number | null
          status?: string | null
          transfer_total?: number | null
          updated_at?: string
          visa_total?: number | null
        }
        Update: {
          adults?: number | null
          agent_id?: string | null
          arrival_date?: string
          children?: number | null
          created_at?: string
          customer_id?: string | null
          departure_date?: string
          grand_total?: number | null
          hotel_id?: string | null
          hotel_total?: number | null
          id?: string
          infants?: number | null
          meal_plan?: string | null
          meal_total?: number | null
          notes?: string | null
          per_person_cost?: number | null
          quotation_number?: string
          room_type?: string | null
          sightseeing_total?: number | null
          status?: string | null
          transfer_total?: number | null
          updated_at?: string
          visa_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      sightseeing: {
        Row: {
          adult_rate: number | null
          child_rate: number | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          location: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          adult_rate?: number | null
          child_rate?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          location?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          adult_rate?: number | null
          child_rate?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          location?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          rate: number | null
          status: string | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          rate?: number | null
          status?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          rate?: number | null
          status?: string | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      visas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          processing_time: string | null
          rate: number | null
          status: string | null
          updated_at: string
          visa_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          processing_time?: string | null
          rate?: number | null
          status?: string | null
          updated_at?: string
          visa_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          processing_time?: string | null
          rate?: number | null
          status?: string | null
          updated_at?: string
          visa_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

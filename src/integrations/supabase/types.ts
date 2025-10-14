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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      markets: {
        Row: {
          created_at: string
          dex_source: string
          id: string
          is_wax_pair: boolean | null
          last_price_int: number | null
          last_side: string | null
          last_updated: string
          pair_key: string
          price: number | null
          token0_contract: string
          token0_symbol: string
          token1_contract: string
          token1_symbol: string
        }
        Insert: {
          created_at?: string
          dex_source: string
          id?: string
          is_wax_pair?: boolean | null
          last_price_int?: number | null
          last_side?: string | null
          last_updated?: string
          pair_key: string
          price?: number | null
          token0_contract: string
          token0_symbol: string
          token1_contract: string
          token1_symbol: string
        }
        Update: {
          created_at?: string
          dex_source?: string
          id?: string
          is_wax_pair?: boolean | null
          last_price_int?: number | null
          last_side?: string | null
          last_updated?: string
          pair_key?: string
          price?: number | null
          token0_contract?: string
          token0_symbol?: string
          token1_contract?: string
          token1_symbol?: string
        }
        Relationships: []
      }
      pool_metrics: {
        Row: {
          id: string
          pool_id: string
          price: number | null
          recorded_at: string
          tvl_usd: number | null
          volume_24h_usd: number | null
        }
        Insert: {
          id?: string
          pool_id: string
          price?: number | null
          recorded_at?: string
          tvl_usd?: number | null
          volume_24h_usd?: number | null
        }
        Update: {
          id?: string
          pool_id?: string
          price?: number | null
          recorded_at?: string
          tvl_usd?: number | null
          volume_24h_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_metrics_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string
          dex_source: string
          has_arbitrage: boolean | null
          id: string
          is_wax_pair: boolean | null
          last_updated: string
          pair_key: string
          price: number | null
          price_change_24h: number | null
          reserve0: number | null
          reserve1: number | null
          token0_contract: string
          token0_symbol: string
          token1_contract: string
          token1_symbol: string
          tvl_usd: number | null
          volume_24h_usd: number | null
        }
        Insert: {
          created_at?: string
          dex_source: string
          has_arbitrage?: boolean | null
          id?: string
          is_wax_pair?: boolean | null
          last_updated?: string
          pair_key: string
          price?: number | null
          price_change_24h?: number | null
          reserve0?: number | null
          reserve1?: number | null
          token0_contract: string
          token0_symbol: string
          token1_contract: string
          token1_symbol: string
          tvl_usd?: number | null
          volume_24h_usd?: number | null
        }
        Update: {
          created_at?: string
          dex_source?: string
          has_arbitrage?: boolean | null
          id?: string
          is_wax_pair?: boolean | null
          last_updated?: string
          pair_key?: string
          price?: number | null
          price_change_24h?: number | null
          reserve0?: number | null
          reserve1?: number | null
          token0_contract?: string
          token0_symbol?: string
          token1_contract?: string
          token1_symbol?: string
          tvl_usd?: number | null
          volume_24h_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pools_token0_contract_fkey"
            columns: ["token0_contract"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["contract"]
          },
          {
            foreignKeyName: "pools_token1_contract_fkey"
            columns: ["token1_contract"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["contract"]
          },
        ]
      }
      tokens: {
        Row: {
          contract: string
          created_at: string
          id: string
          is_wax: boolean | null
          logo_url: string | null
          occurrences: number | null
          precision: number | null
          symbol: string
          updated_at: string
        }
        Insert: {
          contract: string
          created_at?: string
          id?: string
          is_wax?: boolean | null
          logo_url?: string | null
          occurrences?: number | null
          precision?: number | null
          symbol: string
          updated_at?: string
        }
        Update: {
          contract?: string
          created_at?: string
          id?: string
          is_wax?: boolean | null
          logo_url?: string | null
          occurrences?: number | null
          precision?: number | null
          symbol?: string
          updated_at?: string
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

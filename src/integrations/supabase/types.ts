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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          level: string
          starts_at: string
          title: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          level?: string
          starts_at?: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          level?: string
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          duration_minutes: number
          email: string
          id: string
          name: string
          notes: string | null
          scheduled_for: string
          status: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          email: string
          id?: string
          name: string
          notes?: string | null
          scheduled_for: string
          status?: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          email?: string
          id?: string
          name?: string
          notes?: string | null
          scheduled_for?: string
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          rollout_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          rollout_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          rollout_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      run_history: {
        Row: {
          created_at: string
          id: string
          language: string
          output: string | null
          source: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          output?: string | null
          source: string
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          output?: string | null
          source?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      snippet_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          snippet_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          snippet_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          snippet_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "snippet_comments_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippet_favorites: {
        Row: {
          created_at: string
          id: string
          snippet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          snippet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          snippet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "snippet_favorites_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippet_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          snippet_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          snippet_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          snippet_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "snippet_ratings_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      snippets: {
        Row: {
          created_at: string
          forked_from: string | null
          id: string
          language: string
          owner_id: string
          source: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          forked_from?: string | null
          id?: string
          language?: string
          owner_id: string
          source?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          forked_from?: string | null
          id?: string
          language?: string
          owner_id?: string
          source?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "snippets_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_featured: boolean
          name: string
          price_monthly_cents: number
          price_yearly_cents: number
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_featured?: boolean
          name: string
          price_monthly_cents: number
          price_yearly_cents: number
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_featured?: boolean
          name?: string
          price_monthly_cents?: number
          price_yearly_cents?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          id: string
          plan_slug: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_slug?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_slug?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

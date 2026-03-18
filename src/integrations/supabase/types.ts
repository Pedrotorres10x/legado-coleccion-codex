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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          category_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_name?: string
          category_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_name?: string
          category_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_cache: {
        Row: {
          ai_analysis: string | null
          id: string
          image_score: number
          property_data: Json
          property_id: string
          refreshed_at: string
        }
        Insert: {
          ai_analysis?: string | null
          id?: string
          image_score?: number
          property_data: Json
          property_id: string
          refreshed_at?: string
        }
        Update: {
          ai_analysis?: string | null
          id?: string
          image_score?: number
          property_data?: Json
          property_id?: string
          refreshed_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          gdpr_accepted_at: string | null
          id: string
          metadata: Json | null
          message: string | null
          name: string
          phone: string | null
          property_id: string | null
          property_title: string | null
          source: string | null
          synced_to_crm: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          gdpr_accepted_at?: string | null
          id?: string
          metadata?: Json | null
          message?: string | null
          name: string
          phone?: string | null
          property_id?: string | null
          property_title?: string | null
          source?: string | null
          synced_to_crm?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          gdpr_accepted_at?: string | null
          id?: string
          metadata?: Json | null
          message?: string | null
          name?: string
          phone?: string | null
          property_id?: string | null
          property_title?: string | null
          source?: string | null
          synced_to_crm?: boolean | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          language: string | null
          name: string | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          metadata: Json | null
          path: string
          property_id: string | null
          property_title: string | null
          referrer: string | null
          screen_width: number | null
          session_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          path: string
          property_id?: string | null
          property_title?: string | null
          referrer?: string | null
          screen_width?: number | null
          session_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          path?: string
          property_id?: string | null
          property_title?: string | null
          referrer?: string | null
          screen_width?: number | null
          session_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_m2: number
          bathrooms: number
          bedrooms: number
          built_area: number | null
          city: string | null
          commission: number | null
          created_at: string
          crm_reference: string | null
          description: string | null
          energy_cert: string | null
          features: string[] | null
          floor: number | null
          has_elevator: boolean | null
          has_garage: boolean | null
          has_garden: boolean | null
          has_pool: boolean | null
          has_terrace: boolean | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          location: string
          operation: string | null
          owner_price: number | null
          portal_token: string | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          status: Database["public"]["Enums"]["property_status"]
          surface_area: number | null
          title: string
          updated_at: string
          videos: string[] | null
          virtual_tour_url: string | null
          year_built: number | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          area_m2?: number
          bathrooms?: number
          bedrooms?: number
          built_area?: number | null
          city?: string | null
          commission?: number | null
          created_at?: string
          crm_reference?: string | null
          description?: string | null
          energy_cert?: string | null
          features?: string[] | null
          floor?: number | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          has_terrace?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location: string
          operation?: string | null
          owner_price?: number | null
          portal_token?: string | null
          price: number
          property_type?: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["property_status"]
          surface_area?: number | null
          title: string
          updated_at?: string
          videos?: string[] | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          area_m2?: number
          bathrooms?: number
          bedrooms?: number
          built_area?: number | null
          city?: string | null
          commission?: number | null
          created_at?: string
          crm_reference?: string | null
          description?: string | null
          energy_cert?: string | null
          features?: string[] | null
          floor?: number | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          has_terrace?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          location?: string
          operation?: string | null
          owner_price?: number | null
          portal_token?: string | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          status?: Database["public"]["Enums"]["property_status"]
          surface_area?: number | null
          title?: string
          updated_at?: string
          videos?: string[] | null
          virtual_tour_url?: string | null
          year_built?: number | null
          zone?: string | null
        }
        Relationships: []
      }
      property_slugs: {
        Row: {
          city: string | null
          created_at: string
          property_id: string
          slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          property_id: string
          slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          property_id?: string
          slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_notification_log: {
        Row: {
          body: string
          id: string
          metadata: Json | null
          notification_type: string
          sent_at: string
          title: string
          total_sent: number | null
          url: string | null
        }
        Insert: {
          body: string
          id?: string
          metadata?: Json | null
          notification_type: string
          sent_at?: string
          title: string
          total_sent?: number | null
          url?: string | null
        }
        Update: {
          body?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          sent_at?: string
          title?: string
          total_sent?: number | null
          url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          metadata: Json | null
          p256dh: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          metadata?: Json | null
          p256dh: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          metadata?: Json | null
          p256dh?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      increment_blog_views: { Args: { post_slug: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      property_status: "disponible" | "reservado" | "vendido"
      property_type:
        | "piso"
        | "casa"
        | "villa"
        | "atico"
        | "duplex"
        | "chalet"
        | "estudio"
        | "local"
        | "otro"
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
      property_status: ["disponible", "reservado", "vendido"],
      property_type: [
        "piso",
        "casa",
        "villa",
        "atico",
        "duplex",
        "chalet",
        "estudio",
        "local",
        "otro",
      ],
    },
  },
} as const

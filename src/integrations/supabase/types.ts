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
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_requirement: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_requirement?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_requirement?: number | null
        }
        Relationships: []
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string | null
          profile_id: string
          role: string | null
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string | null
          profile_id: string
          role?: string | null
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string | null
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_skills: string[] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_skills?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_skills?: string[] | null
        }
        Relationships: []
      }
      department_notes: {
        Row: {
          content: string
          created_at: string | null
          department: string
          id: string
          profile_id: string
          subject: string | null
          title: string
          year: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          department: string
          id?: string
          profile_id: string
          subject?: string | null
          title: string
          year?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          department?: string
          id?: string
          profile_id?: string
          subject?: string | null
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "department_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_responses: {
        Row: {
          created_at: string | null
          doubt_id: string
          id: string
          is_ai: boolean | null
          profile_id: string | null
          response_text: string
        }
        Insert: {
          created_at?: string | null
          doubt_id: string
          id?: string
          is_ai?: boolean | null
          profile_id?: string | null
          response_text: string
        }
        Update: {
          created_at?: string | null
          doubt_id?: string
          id?: string
          is_ai?: boolean | null
          profile_id?: string | null
          response_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubt_responses_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubt_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          question: string
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          question: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          question?: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          department: string
          id: string
          profile_id: string
          replies_count: number | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          department: string
          id?: string
          profile_id: string
          replies_count?: number | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          department?: string
          id?: string
          profile_id?: string
          replies_count?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          similarity_score: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          similarity_score?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          similarity_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          department: string
          id: string
          name: string
          resume_url: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department: string
          id?: string
          name: string
          resume_url?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string
          id?: string
          name?: string
          resume_url?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      research_applications: {
        Row: {
          applied_at: string | null
          id: string
          profile_id: string
          project_id: string
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          id?: string
          profile_id: string
          project_id: string
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          id?: string
          profile_id?: string
          project_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          faculty: string
          id: string
          open_positions: number | null
          required_skills: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          department: string
          description?: string | null
          faculty: string
          id?: string
          open_positions?: number | null
          required_skills?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          faculty?: string
          id?: string
          open_positions?: number | null
          required_skills?: string[] | null
          title?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          embedding: number[]
          id: string
          profile_id: string
          skill_name: string
        }
        Insert: {
          created_at?: string
          embedding: number[]
          id?: string
          profile_id: string
          skill_name: string
        }
        Update: {
          created_at?: string
          embedding?: number[]
          id?: string
          profile_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          profile_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          profile_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          profile_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          required_skills: string[]
          team_size: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          required_skills: string[]
          team_size: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          required_skills?: string[]
          team_size?: number
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          level: number | null
          profile_id: string
          rank: number | null
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          level?: number | null
          profile_id: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          level?: number | null
          profile_id?: string
          rank?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_xp_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_rooms: {
        Row: {
          created_at: string | null
          host_profile_id: string
          id: string
          is_active: boolean | null
          participants: string[] | null
          room_id: string
        }
        Insert: {
          created_at?: string | null
          host_profile_id: string
          id?: string
          is_active?: boolean | null
          participants?: string[] | null
          room_id: string
        }
        Update: {
          created_at?: string | null
          host_profile_id?: string
          id?: string
          is_active?: boolean | null
          participants?: string[] | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_rooms_host_profile_id_fkey"
            columns: ["host_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

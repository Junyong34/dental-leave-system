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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      leave_balances: {
        Row: {
          created_at: string | null
          expire_at: string
          remain: number
          total: number
          updated_at: string | null
          used: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          expire_at: string
          remain?: number
          total?: number
          updated_at?: string | null
          used?: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          expire_at?: string
          remain?: number
          total?: number
          updated_at?: string | null
          used?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'leave_balances_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      leave_history: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: number
          session: string | null
          source_year: number
          type: string
          used_at: string | null
          user_id: string
          weekday: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          id?: number
          session?: string | null
          source_year: number
          type: string
          used_at?: string | null
          user_id: string
          weekday: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: number
          session?: string | null
          source_year?: number
          type?: string
          used_at?: string | null
          user_id?: string
          weekday?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leave_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      leave_reservations: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: number
          session: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          id?: number
          session?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: number
          session?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leave_reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          group_id: string
          join_date: string
          name: string
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          join_date: string
          name: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          join_date?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leave_balances_display: {
        Row: {
          created_at: string | null
          expire_at: string | null
          remain: number | null
          total: number | null
          updated_at: string | null
          used: number | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          expire_at?: string | null
          remain?: never
          total?: never
          updated_at?: string | null
          used?: never
          user_id?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          expire_at?: string | null
          remain?: never
          total?: never
          updated_at?: string | null
          used?: never
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'leave_balances_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      leave_history_display: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string | null
          id: number | null
          session: string | null
          source_year: number | null
          type: string | null
          used_at: string | null
          user_id: string | null
          weekday: string | null
        }
        Insert: {
          amount?: never
          created_at?: string | null
          date?: string | null
          id?: number | null
          session?: string | null
          source_year?: number | null
          type?: string | null
          used_at?: string | null
          user_id?: string | null
          weekday?: string | null
        }
        Update: {
          amount?: never
          created_at?: string | null
          date?: string | null
          id?: number | null
          session?: string | null
          source_year?: number | null
          type?: string | null
          used_at?: string | null
          user_id?: string | null
          weekday?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'leave_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
      leave_reservations_display: {
        Row: {
          amount: number | null
          created_at: string | null
          date: string | null
          id: number | null
          session: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: never
          created_at?: string | null
          date?: string | null
          id?: number | null
          session?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: never
          created_at?: string | null
          date?: string | null
          id?: number | null
          session?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'leave_reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['user_id']
          },
        ]
      }
    }
    Functions: {
      cancel_leave: {
        Args: {
          p_reservation_id: number
        }
        Returns: {
          success: boolean
          message: string
        }
      }
      cancel_leave_by_reservation: {
        Args: {
          p_reservation_id: number
        }
        Returns: {
          success: boolean
          message: string
        }
      }
      cancel_leave_history: {
        Args: {
          p_history_id: number
        }
        Returns: {
          success: boolean
          message: string
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_user: { Args: never; Returns: boolean }
      is_view: { Args: never; Returns: boolean }
      reserve_leave: {
        Args: {
          p_user_id: string
          p_date: string
          p_type: string
          p_session: string | null
        }
        Returns: {
          success: boolean
          message: string
          reservation_id?: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

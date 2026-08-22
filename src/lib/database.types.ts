export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface PlaybackCue {
  startMs: number
  endMs?: number
  text: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      song_playback: {
        Row: {
          song_id: string
          audio_url: string
          audio_source: string
          audio_authorized: boolean
          duration_seconds: number
          synced_lyrics: Json
          updated_at: string
          created_by: string | null
        }
        Insert: {
          song_id: string
          audio_url: string
          audio_source?: string
          audio_authorized?: boolean
          duration_seconds: number
          synced_lyrics?: Json
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          song_id?: string
          audio_url?: string
          audio_source?: string
          audio_authorized?: boolean
          duration_seconds?: number
          synced_lyrics?: Json
          updated_at?: string
          created_by?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          album: string | null
          release_date: string | null
          thumbnail_url: string | null
          language: string
          language_code: string
          lyrics_status: string
          rights_status: string
          rights_holder: string | null
          license_reference: string | null
          verified: boolean
          updated_at: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          album?: string | null
          release_date?: string | null
          thumbnail_url?: string | null
          language?: string
          language_code?: string
          lyrics_status?: string
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          verified?: boolean
          updated_at?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          album?: string | null
          release_date?: string | null
          thumbnail_url?: string | null
          language?: string
          language_code?: string
          lyrics_status?: string
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          verified?: boolean
          updated_at?: string
          created_at?: string
          created_by?: string
        }
      }
      test_catalog_assets: {
        Row: {
          id: string
          song_id: string
          language: string
          bucket_id: string
          storage_path: string
          content_type: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          language: string
          bucket_id?: string
          storage_path: string
          content_type?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          language?: string
          bucket_id?: string
          storage_path?: string
          content_type?: string
          created_by?: string
          created_at?: string
        }
      }
      lyrics: {
        Row: {
          id: string
          song_id: string
          content: string
          language_code: string
          source_type: string
          rights_status: string
          rights_holder: string | null
          license_reference: string | null
          allowed_display: boolean
          allowed_translation: boolean
          allowed_synchronization: boolean
          status: string
          verified: boolean
          updated_at: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          song_id: string
          content: string
          language_code?: string
          source_type?: string
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          allowed_display?: boolean
          allowed_translation?: boolean
          allowed_synchronization?: boolean
          status?: string
          verified?: boolean
          updated_at?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          song_id?: string
          content?: string
          language_code?: string
          source_type?: string
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          allowed_display?: boolean
          allowed_translation?: boolean
          allowed_synchronization?: boolean
          status?: string
          verified?: boolean
          updated_at?: string
          created_at?: string
          created_by?: string
        }
      }
      translations: {
        Row: {
          id: string
          lyrics_id: string
          language_code: string
          translated_text: string
          submitted_by: string | null
          status: string
          verified: boolean
          rights_status: string
          rights_holder: string | null
          license_reference: string | null
          allowed_display: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lyrics_id: string
          language_code: string
          translated_text: string
          submitted_by?: string | null
          status?: string
          verified?: boolean
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          allowed_display?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lyrics_id?: string
          language_code?: string
          translated_text?: string
          submitted_by?: string | null
          status?: string
          verified?: boolean
          rights_status?: string
          rights_holder?: string | null
          license_reference?: string | null
          allowed_display?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          song_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          song_id: string
          user_id: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          user_id: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          user_id?: string
          score?: number
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
          added_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          song_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          created_at?: string
        }
      }
      generated_lyrics: {
        Row: {
          id: string
          title: string
          content: string
          settings: Json
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          settings: Json
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          settings?: Json
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
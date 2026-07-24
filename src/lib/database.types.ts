export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          album: string | null
          release_date: string | null
          thumbnail_url: string | null
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
          created_at?: string
          created_by?: string
        }
      }
      lyrics: {
        Row: {
          id: string
          song_id: string
          content: string
          verified: boolean
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          song_id: string
          content: string
          verified?: boolean
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          song_id?: string
          content?: string
          verified?: boolean
          created_at?: string
          created_by?: string
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
/*
  # MotionManga AI Database Schema

  1. New Tables
    - `comics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional for now - can be null for anonymous users)
      - `story_idea` (text, the original user input)
      - `script_json` (jsonb, stores the 4-panel script)
      - `master_character_url` (text, URL of Panel 1 image for character consistency)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `panels`
      - `id` (uuid, primary key)
      - `comic_id` (uuid, foreign key to comics)
      - `panel_number` (integer, 1-4)
      - `visual_prompt` (text, description for image generation)
      - `dialogue` (text, character dialogue)
      - `character_emotion` (text, emotion for voice acting)
      - `camera_movement` (text, cinematic camera instruction)
      - `image_url` (text, generated image URL)
      - `video_url` (text, generated video URL)
      - `audio_url` (text, generated audio URL)
      - `status` (text, current generation status)
      - `generation_timestamp` (timestamptz)
      - `created_at` (timestamptz)
    
    - `user_credits`
      - `user_id` (uuid, primary key for now)
      - `video_credits_remaining` (integer, default 3)
      - `total_videos_generated` (integer, default 0)
      - `created_at` (timestamptz)
      - `last_updated` (timestamptz)
    
    - `generation_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional)
      - `operation_type` (text, e.g., 'script', 'image', 'speech', 'video')
      - `api_endpoint` (text, which edge function was called)
      - `status` (text, 'success' or 'error')
      - `error_message` (text, optional error details)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - For now, allow anonymous access (public policies)
    - In future, these can be restricted to authenticated users
*/

-- Create comics table
CREATE TABLE IF NOT EXISTS comics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  story_idea text NOT NULL,
  script_json jsonb,
  master_character_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create panels table
CREATE TABLE IF NOT EXISTS panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comic_id uuid REFERENCES comics(id) ON DELETE CASCADE,
  panel_number integer NOT NULL CHECK (panel_number >= 1 AND panel_number <= 4),
  visual_prompt text NOT NULL,
  dialogue text,
  character_emotion text DEFAULT 'neutral',
  camera_movement text DEFAULT 'static',
  image_url text,
  video_url text,
  audio_url text,
  status text DEFAULT 'pending',
  generation_timestamp timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_credits_remaining integer DEFAULT 3,
  total_videos_generated integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Create generation_logs table
CREATE TABLE IF NOT EXISTS generation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  operation_type text NOT NULL,
  api_endpoint text NOT NULL,
  status text NOT NULL,
  error_message text,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_panels_comic_id ON panels(comic_id);
CREATE INDEX IF NOT EXISTS idx_panels_panel_number ON panels(panel_number);
CREATE INDEX IF NOT EXISTS idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_timestamp ON generation_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anonymous users can create and read their own data)
-- Comics policies
CREATE POLICY "Anyone can insert comics"
  ON comics FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view comics"
  ON comics FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update comics"
  ON comics FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Panels policies
CREATE POLICY "Anyone can insert panels"
  ON panels FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view panels"
  ON panels FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update panels"
  ON panels FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- User credits policies
CREATE POLICY "Anyone can insert credits"
  ON user_credits FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view credits"
  ON user_credits FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update credits"
  ON user_credits FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Generation logs policies
CREATE POLICY "Anyone can insert logs"
  ON generation_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view logs"
  ON generation_logs FOR SELECT
  TO anon
  USING (true);
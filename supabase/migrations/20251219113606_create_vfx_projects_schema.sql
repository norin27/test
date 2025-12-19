/*
  # VFX Tracker Pro Database Schema

  ## Overview
  Creates the database structure for VFX Tracker Pro app to store projects,
  recordings, and tracking data.

  ## New Tables
  
  ### `projects`
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `save_path` (text) - Storage path for project files
  - `created_at` (timestamptz) - Project creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `user_id` (uuid) - Reference to auth.users
  - `settings` (jsonb) - Project settings (resolution, codec, etc.)

  ### `recordings`
  - `id` (uuid, primary key) - Unique recording identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `filename` (text) - Video filename
  - `duration` (real) - Recording duration in seconds
  - `resolution` (text) - Video resolution (1080p, 4K)
  - `fps` (integer) - Frames per second
  - `codec` (text) - Video codec used (H264, HEVC)
  - `created_at` (timestamptz) - Recording timestamp
  - `file_size` (bigint) - File size in bytes
  - `has_depth_map` (boolean) - Whether depth map was recorded

  ### `tracking_data`
  - `id` (uuid, primary key) - Unique tracking data identifier
  - `recording_id` (uuid, foreign key) - Reference to recordings table
  - `timestamp` (real) - Frame timestamp in seconds
  - `position_x` (real) - Camera position X
  - `position_y` (real) - Camera position Y
  - `position_z` (real) - Camera position Z
  - `rotation_x` (real) - Camera rotation X (pitch)
  - `rotation_y` (real) - Camera rotation Y (yaw)
  - `rotation_z` (real) - Camera rotation Z (roll)
  - `focal_length` (real) - Camera focal length
  - `sensor_width` (real) - Sensor width
  - `sensor_height` (real) - Sensor height
  - `principal_point_x` (real) - Principal point X
  - `principal_point_y` (real) - Principal point Y

  ## Security
  - Enable RLS on all tables
  - Users can only access their own projects and recordings
  - Authenticated access required for all operations
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  save_path text DEFAULT '/vfx-projects',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{"resolution": "1080p", "fps": 30, "codec": "H264"}'::jsonb
);

CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  duration real DEFAULT 0,
  resolution text DEFAULT '1080p',
  fps integer DEFAULT 30,
  codec text DEFAULT 'H264',
  created_at timestamptz DEFAULT now(),
  file_size bigint DEFAULT 0,
  has_depth_map boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS tracking_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid REFERENCES recordings(id) ON DELETE CASCADE NOT NULL,
  timestamp real NOT NULL,
  position_x real DEFAULT 0,
  position_y real DEFAULT 0,
  position_z real DEFAULT 0,
  rotation_x real DEFAULT 0,
  rotation_y real DEFAULT 0,
  rotation_z real DEFAULT 0,
  focal_length real DEFAULT 24,
  sensor_width real DEFAULT 36,
  sensor_height real DEFAULT 24,
  principal_point_x real DEFAULT 0.5,
  principal_point_y real DEFAULT 0.5
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_project_id ON recordings(project_id);
CREATE INDEX IF NOT EXISTS idx_tracking_data_recording_id ON tracking_data(recording_id);
CREATE INDEX IF NOT EXISTS idx_tracking_data_timestamp ON tracking_data(recording_id, timestamp);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recordings"
  ON recordings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own tracking data"
  ON tracking_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recordings
      JOIN projects ON projects.id = recordings.project_id
      WHERE recordings.id = tracking_data.recording_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tracking data"
  ON tracking_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recordings
      JOIN projects ON projects.id = recordings.project_id
      WHERE recordings.id = tracking_data.recording_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tracking data"
  ON tracking_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recordings
      JOIN projects ON projects.id = recordings.project_id
      WHERE recordings.id = tracking_data.recording_id
      AND projects.user_id = auth.uid()
    )
  );

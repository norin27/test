import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ProjectSetup() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [savePath, setSavePath] = useState('/vfx-projects');
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [codec, setCodec] = useState('H264');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
      }

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          save_path: savePath,
          settings: {
            resolution,
            fps,
            codec
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/camera/${data.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-accent-blue hover:text-blue-400 flex items-center gap-2"
        >
          <span>←</span> Back
        </button>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">New Project Setup</h1>
          <p className="text-gray-400">Configure your VFX tracking project</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Save Path
            </label>
            <input
              type="text"
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              placeholder="/vfx-projects"
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
              >
                <option value="1080p">1080p (HD)</option>
                <option value="4K">4K (UHD)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                FPS
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
              >
                <option value={24}>24</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Codec
            </label>
            <select
              value={codec}
              onChange={(e) => setCodec(e.target.value)}
              className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option value="H264">H.264 (Recommended)</option>
              <option value="HEVC">HEVC (H.265)</option>
            </select>
          </div>

          {error && (
            <div className="bg-accent-red bg-opacity-20 border border-accent-red rounded-lg p-3 text-accent-red text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateProject}
            disabled={loading}
            className="w-full bg-accent-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Creating...' : 'Start Recording'}
          </button>
        </div>

        <div className="glass-effect rounded-lg p-4 space-y-2 text-sm text-gray-400">
          <p className="font-semibold text-white">Project Features:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>6DOF Camera Tracking (Position + Rotation)</li>
            <li>Camera Intrinsics Recording</li>
            <li>Real-time Sensor Fusion</li>
            <li>Export to USDA/FBX formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProjectSetup;

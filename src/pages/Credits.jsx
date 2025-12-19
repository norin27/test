import { useNavigate } from 'react-router-dom';

function Credits() {
  const navigate = useNavigate();

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

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-glow">VFX TRACKER PRO</h1>
            <p className="text-xl text-gray-400">
              Professional Camera Tracking for VFX
            </p>
          </div>

          <div className="glass-effect border border-gray-700 rounded-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Copyright & Credits</h2>
              <div className="h-px bg-gradient-to-r from-transparent via-accent-blue to-transparent"></div>
            </div>

            <div className="space-y-6 text-center">
              <div>
                <p className="text-gray-400 mb-2">Copyright</p>
                <p className="text-lg font-semibold">
                  © 2024-2025 by Bentami Touhami Noruioine
                </p>
              </div>

              <div className="h-px bg-gray-700"></div>

              <div className="space-y-3">
                <p className="text-gray-400 mb-2">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-500">Phone:</span>
                    <a href="tel:+1234567890" className="text-accent-blue hover:text-blue-400">
                      +1 (234) 567-890
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-500">Email:</span>
                    <a href="mailto:contact@vfxtrackerpro.com" className="text-accent-blue hover:text-blue-400">
                      contact@vfxtrackerpro.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-effect border border-gray-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-center">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400">Frontend Framework</p>
                <p className="font-medium">React + Vite</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Styling</p>
                <p className="font-medium">Tailwind CSS</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">3D/AR Tracking</p>
                <p className="font-medium">Three.js + WebXR</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Database</p>
                <p className="font-medium">Supabase</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Sensor APIs</p>
                <p className="font-medium">Device Orientation & Motion</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Export Formats</p>
                <p className="font-medium">USDA, FBX</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>Version 1.0.0</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Credits;

import { useNavigate } from 'react-router-dom';

function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20"></div>

      <div className="relative z-10 text-center space-y-12 w-full max-w-md">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-glow">
            VFX TRACKER PRO
          </h1>
          <p className="text-gray-400 text-lg">
            Professional Camera Tracking for VFX
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/setup')}
            className="w-full bg-accent-blue hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            New Project
          </button>

          <button
            onClick={() => navigate('/projects')}
            className="w-full glass-effect border border-gray-700 hover:border-accent-blue text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200"
          >
            Project List
          </button>

          <button
            onClick={() => navigate('/credits')}
            className="w-full glass-effect border border-gray-700 hover:border-gray-600 text-gray-400 font-medium py-3 px-8 rounded-lg transition-all duration-200"
          >
            Credits
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>6DOF Camera Tracking</p>
          <p>USDA/FBX Export Support</p>
          <p>Real-time Sensor Fusion</p>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;

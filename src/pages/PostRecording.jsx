import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateUSDA, generateFBX, downloadFile } from '../utils/exportFormats';

function PostRecording() {
  const { recordingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);

  const [recording, setRecording] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [cameraIntrinsics, setCameraIntrinsics] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [exportFormat, setExportFormat] = useState('USDA');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadRecording();

    if (location.state?.chunks) {
      const blob = new Blob(location.state.chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    }

    if (location.state?.trackingData) {
      setTrackingData(location.state.trackingData);
    }

    if (location.state?.intrinsics) {
      setCameraIntrinsics(location.state.intrinsics);
    }

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [recordingId]);

  const loadRecording = async () => {
    try {
      const { data: recData, error: recError } = await supabase
        .from('recordings')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('id', recordingId)
        .single();

      if (recError) throw recError;
      setRecording(recData);

      const { data: trackData, error: trackError } = await supabase
        .from('tracking_data')
        .select('*')
        .eq('recording_id', recordingId)
        .order('timestamp', { ascending: true });

      if (trackError) throw trackError;

      if (trackData && trackData.length > 0) {
        const formattedData = trackData.map(d => ({
          timestamp: d.timestamp,
          position: { x: d.position_x, y: d.position_y, z: d.position_z },
          rotation: { x: d.rotation_x, y: d.rotation_y, z: d.rotation_z }
        }));
        setTrackingData(formattedData);

        setCameraIntrinsics({
          focalLength: trackData[0].focal_length,
          sensorWidth: trackData[0].sensor_width,
          sensorHeight: trackData[0].sensor_height,
          principalPoint: {
            x: trackData[0].principal_point_x,
            y: trackData[0].principal_point_y
          }
        });
      }
    } catch (err) {
      console.error('Error loading recording:', err);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = async () => {
    if (!trackingData.length || !cameraIntrinsics || !recording) return;

    setExporting(true);

    try {
      const projectName = recording.project?.name || 'VFX_Project';
      const fps = recording.fps || 30;

      if (exportFormat === 'USDA') {
        const usdaContent = generateUSDA(trackingData, cameraIntrinsics, projectName, fps);
        downloadFile(usdaContent, `${projectName}_camera.usda`, 'text/plain');
      } else if (exportFormat === 'FBX') {
        const fbxContent = generateFBX(trackingData, cameraIntrinsics, projectName, fps);
        downloadFile(fbxContent, `${projectName}_camera.fbx`, 'text/plain');
      }

      setTimeout(() => {
        setExporting(false);
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      setExporting(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm('Discard this recording? This cannot be undone.')) return;

    try {
      await supabase.from('recordings').delete().eq('id', recordingId);
      navigate('/projects');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-300">
      <div className="glass-effect p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="text-accent-blue hover:text-blue-400 flex items-center gap-2"
        >
          <span>←</span> Projects
        </button>
        <h1 className="text-lg font-semibold">Preview</h1>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="relative bg-black aspect-video w-full max-w-4xl mx-auto">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No video preview available
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 glass-effect p-4 space-y-3">
            <div
              onClick={handleSeek}
              className="h-1 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-accent-blue"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 flex items-center justify-center glass-effect rounded-lg"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <div className="font-mono text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <div className="flex gap-2">
                <button className="glass-effect px-3 py-1 rounded text-sm">
                  🔇
                </button>
                <button className="glass-effect px-3 py-1 rounded text-sm">
                  3D
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          <div className="glass-effect border border-gray-700 rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">Recording Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-medium">{recording?.duration?.toFixed(2) || 0}s</p>
              </div>
              <div>
                <p className="text-gray-400">Resolution</p>
                <p className="font-medium">{recording?.resolution || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">FPS</p>
                <p className="font-medium">{recording?.fps || 30}</p>
              </div>
              <div>
                <p className="text-gray-400">Codec</p>
                <p className="font-medium">{recording?.codec || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Tracking Points</p>
                <p className="font-medium text-accent-green">{trackingData.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Focal Length</p>
                <p className="font-medium">{cameraIntrinsics?.focalLength?.toFixed(1) || 'N/A'}mm</p>
              </div>
            </div>
          </div>

          <div className="glass-effect border border-gray-700 rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">Export Options</h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
              >
                <option value="USDA">USDA (Universal Scene Description)</option>
                <option value="FBX">FBX (Motion Data)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={exporting || !trackingData.length}
                className="flex-1 bg-accent-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                {exporting ? 'Exporting...' : 'Export Camera Data'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              className="flex-1 bg-accent-red bg-opacity-20 hover:bg-opacity-30 border border-accent-red text-accent-red font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Discard
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex-1 glass-effect border border-gray-700 hover:border-accent-blue text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostRecording;

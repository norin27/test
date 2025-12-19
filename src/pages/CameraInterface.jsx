import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SensorTracker } from '../utils/sensorTracking';
import { CameraIntrinsics } from '../utils/cameraIntrinsics';

function CameraInterface() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const sensorTrackerRef = useRef(new SensorTracker());
  const cameraIntrinsicsRef = useRef(new CameraIntrinsics());

  const [project, setProject] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [focalLength, setFocalLength] = useState(24);
  const [isLocked, setIsLocked] = useState({ exposure: false, wb: false, focus: false });
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    loadProject();
    initializeCamera();
    return cleanup;
  }, [projectId]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
        updateSensorData();
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);

      const resolution = data.settings?.resolution || '1080p';
      const [width, height] = resolution === '4K' ? [3840, 2160] : [1920, 1080];
      cameraIntrinsicsRef.current.updateResolution(width, height);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    }
  };

  const initializeCamera = async () => {
    try {
      const hasPermission = await sensorTrackerRef.current.requestPermissions();
      if (!hasPermission) {
        setError('Sensor permissions required');
      }

      const resolution = project?.settings?.resolution || '1080p';
      const [width, height] = resolution === '4K' ? [3840, 2160] : [1920, 1080];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: width },
          height: { ideal: height }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const intrinsics = await cameraIntrinsicsRef.current.calculateFromStream(stream);
      setFocalLength(intrinsics.focalLength);

    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Failed to access camera');
    }
  };

  const updateSensorData = () => {
    const state = sensorTrackerRef.current.getCurrentState();
    setPosition(state.position);
    setRotation(state.rotation);
  };

  const startRecording = async () => {
    try {
      const stream = streamRef.current;
      if (!stream) throw new Error('No camera stream');

      const mimeType = project?.settings?.codec === 'HEVC'
        ? 'video/mp4; codecs="hev1"'
        : 'video/webm; codecs="vp9"';

      const options = {
        mimeType: MediaRecorder.isTypeSupported(mimeType)
          ? mimeType
          : 'video/webm',
        videoBitsPerSecond: project?.settings?.resolution === '4K'
          ? 20000000
          : 8000000
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setRecordedChunks(chunks);
        await saveRecording(chunks);
      };

      mediaRecorder.start(100);
      sensorTrackerRef.current.startTracking();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Recording start error:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      sensorTrackerRef.current.stopTracking();
      setIsRecording(false);
    }
  };

  const saveRecording = async (chunks) => {
    try {
      const trackingData = sensorTrackerRef.current.getTrackingData();
      const intrinsics = cameraIntrinsicsRef.current.getIntrinsics();

      const { data: recording, error: recError } = await supabase
        .from('recordings')
        .insert({
          project_id: projectId,
          filename: `recording_${Date.now()}.webm`,
          duration: recordingTime / 10,
          resolution: project?.settings?.resolution || '1080p',
          fps: project?.settings?.fps || 30,
          codec: project?.settings?.codec || 'H264',
          file_size: chunks.reduce((acc, chunk) => acc + chunk.size, 0)
        })
        .select()
        .single();

      if (recError) throw recError;

      const trackingInserts = trackingData.map((frame) => ({
        recording_id: recording.id,
        timestamp: frame.timestamp,
        position_x: frame.position.x,
        position_y: frame.position.y,
        position_z: frame.position.z,
        rotation_x: frame.rotation.x,
        rotation_y: frame.rotation.y,
        rotation_z: frame.rotation.z,
        focal_length: intrinsics.focalLength,
        sensor_width: intrinsics.sensorWidth,
        sensor_height: intrinsics.sensorHeight,
        principal_point_x: intrinsics.principalPoint.x,
        principal_point_y: intrinsics.principalPoint.y
      }));

      const { error: trackError } = await supabase
        .from('tracking_data')
        .insert(trackingInserts);

      if (trackError) throw trackError;

      navigate(`/preview/${recording.id}`, { state: { chunks, trackingData, intrinsics } });
    } catch (err) {
      console.error('Save recording error:', err);
      setError('Failed to save recording');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sensorTrackerRef.current.stopTracking();
  };

  const formatTime = (deciseconds) => {
    const minutes = Math.floor(deciseconds / 600);
    const seconds = Math.floor((deciseconds % 600) / 10);
    const tenths = deciseconds % 10;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="glass-effect p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-dark-200 px-3 py-1 rounded text-xs font-mono">
              {project?.settings?.resolution || '1080p'}
            </span>
            <span className="bg-dark-200 px-3 py-1 rounded text-xs font-mono">
              {project?.settings?.fps || 30}FPS
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
              <span className="font-mono text-accent-red font-semibold">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="glass-effect p-2 rounded-lg"
          >
            ⚙️
          </button>
        </div>

        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 glass-effect rounded-lg p-3 space-y-2 font-mono text-xs">
            <div>
              <span className="text-gray-400">POS:</span>
              <div className="text-accent-blue">
                X: {position.x.toFixed(2)} Y: {position.y.toFixed(2)} Z: {position.z.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-gray-400">ROT:</span>
              <div className="text-accent-green">
                X: {rotation.x.toFixed(1)}° Y: {rotation.y.toFixed(1)}° Z: {rotation.z.toFixed(1)}°
              </div>
            </div>
            <div>
              <span className="text-gray-400">FL:</span>
              <span className="text-white ml-2">{focalLength.toFixed(1)}mm</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setIsLocked({ ...isLocked, wb: !isLocked.wb })}
              className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center ${
                isLocked.wb ? 'bg-accent-blue bg-opacity-30' : ''
              }`}
            >
              WB
            </button>
            <button
              onClick={() => setIsLocked({ ...isLocked, exposure: !isLocked.exposure })}
              className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center ${
                isLocked.exposure ? 'bg-accent-blue bg-opacity-30' : ''
              }`}
            >
              ☀️
            </button>
            <button
              onClick={() => setIsLocked({ ...isLocked, focus: !isLocked.focus })}
              className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center ${
                isLocked.focus ? 'bg-accent-blue bg-opacity-30' : ''
              }`}
            >
              🎯
            </button>
          </div>
        </div>

        <div className="glass-effect p-6 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => navigate('/projects')}
              disabled={isRecording}
              className="glass-effect p-4 rounded-full disabled:opacity-50"
            >
              📁
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all transform active:scale-95 ${
                isRecording
                  ? 'border-accent-red bg-accent-red'
                  : 'border-white bg-white bg-opacity-10'
              }`}
            >
              {isRecording && (
                <div className="w-8 h-8 bg-white rounded"></div>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              disabled={isRecording}
              className="glass-effect p-4 rounded-full disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-accent-red bg-opacity-20 border border-accent-red rounded-lg p-2 text-accent-red text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraInterface;

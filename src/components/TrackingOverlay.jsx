function TrackingOverlay({ position, rotation, focalLength }) {
  return (
    <div className="absolute top-4 left-4 glass-effect rounded-lg p-3 space-y-2 font-mono text-xs max-w-xs">
      <div className="flex items-center justify-between gap-4">
        <span className="text-gray-400 font-semibold">POSITION</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-gray-500 text-[10px]">X</div>
          <div className="text-accent-blue font-semibold">{position.x.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">Y</div>
          <div className="text-accent-blue font-semibold">{position.y.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">Z</div>
          <div className="text-accent-blue font-semibold">{position.z.toFixed(2)}</div>
        </div>
      </div>

      <div className="h-px bg-gray-700"></div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-gray-400 font-semibold">ROTATION</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-gray-500 text-[10px]">PITCH</div>
          <div className="text-accent-green font-semibold">{rotation.x.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">YAW</div>
          <div className="text-accent-green font-semibold">{rotation.y.toFixed(1)}°</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">ROLL</div>
          <div className="text-accent-green font-semibold">{rotation.z.toFixed(1)}°</div>
        </div>
      </div>

      <div className="h-px bg-gray-700"></div>

      <div className="flex items-center justify-between">
        <span className="text-gray-400">FOCAL LENGTH</span>
        <span className="text-white font-semibold">{focalLength.toFixed(1)}mm</span>
      </div>
    </div>
  );
}

export default TrackingOverlay;

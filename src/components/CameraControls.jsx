import { useState } from 'react';

function CameraControls({ onLockChange, locks }) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        onClick={() => onLockChange('wb', !locks.wb)}
        className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
          locks.wb ? 'bg-accent-blue bg-opacity-30 border-2 border-accent-blue' : 'border border-gray-700'
        }`}
        title="White Balance Lock"
      >
        WB
      </button>
      <button
        onClick={() => onLockChange('exposure', !locks.exposure)}
        className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
          locks.exposure ? 'bg-accent-blue bg-opacity-30 border-2 border-accent-blue' : 'border border-gray-700'
        }`}
        title="Exposure Lock"
      >
        ☀️
      </button>
      <button
        onClick={() => onLockChange('focus', !locks.focus)}
        className={`glass-effect w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
          locks.focus ? 'bg-accent-blue bg-opacity-30 border-2 border-accent-blue' : 'border border-gray-700'
        }`}
        title="Focus Lock"
      >
        🎯
      </button>
    </div>
  );
}

export default CameraControls;

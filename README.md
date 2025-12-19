# VFX Tracker Pro

Professional VFX Camera Tracking App for Android - A Progressive Web App (PWA) for high-performance camera tracking with real-time sensor fusion.

## Features

### Core Functionality
- **Video Recording**: Capture video in 1080p and 4K at 30fps (configurable)
- **6DOF Tracking**: Real-time Position (XYZ) and Rotation (XYZ) tracking
- **Sensor Fusion**: Utilizes Gyroscope, Accelerometer, and Device Orientation APIs
- **Camera Intrinsics**: Automatic calculation of Focal Length, Sensor Size, and Principal Point

### Advanced Features
- **Portrait & Landscape Support**: Works in any orientation
- **Codec Selection**: Choose between H.264 and HEVC
- **Depth Map Recording**: Support for LiDAR-equipped devices (future enhancement)
- **Export Formats**: USDA (Universal Scene Description) and FBX for industry-standard VFX workflows

### UI/UX
- Start screen with project management
- Intuitive camera interface with real-time overlays
- Camera controls (Exposure, White Balance, Focus lock)
- Post-recording preview and export options
- Professional dark theme optimized for filming

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **3D/AR**: Three.js + WebXR APIs
- **Database**: Supabase (PostgreSQL)
- **PWA**: Vite PWA Plugin with service worker
- **Sensors**: Device Orientation & Motion APIs

## Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Usage

### Creating a New Project
1. Launch the app and tap "New Project"
2. Configure project settings:
   - Project name
   - Save path
   - Resolution (1080p or 4K)
   - FPS (24, 30, or 60)
   - Codec (H.264 or HEVC)
3. Tap "Start Recording"

### Recording
- The camera interface shows real-time tracking data
- Lock controls for exposure, white balance, and focus
- Tap the record button to start/stop recording
- View real-time position, rotation, and focal length data

### Post-Recording
- Preview your recording
- View tracking statistics
- Export camera data as USDA or FBX
- Discard or save to projects

### Exporting
Export formats include:
- **USDA**: Full camera animation with position, rotation, and intrinsics
- **FBX**: Motion data compatible with major 3D software

## Project Structure

```
vfx-tracker-pro/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── lib/             # Supabase client
│   ├── utils/           # Sensor tracking & export utilities
│   ├── App.jsx          # Main app with routing
│   └── main.jsx         # Entry point
├── public/              # Static assets & PWA manifest
└── supabase/           # Database migrations (handled by MCP)
```

## Browser Support

- Chrome/Edge 90+
- Safari 14+ (iOS/iPadOS)
- Firefox 88+

**Note**: Full sensor access requires HTTPS and user permissions.

## Performance Optimization

- Efficient sensor data sampling (10Hz)
- Optimized video encoding settings
- Background processing for tracking data
- Progressive loading for project lists

## Credits

**Copyright © 2024-2025 by Bentami Touhami Noruioine**

For inquiries:
- Phone: +1 (234) 567-890
- Email: contact@vfxtrackerpro.com

## License

All rights reserved.

---

Built with React, Vite, Tailwind CSS, Three.js, and Supabase.
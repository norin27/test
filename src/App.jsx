import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartScreen from './pages/StartScreen';
import ProjectSetup from './pages/ProjectSetup';
import CameraInterface from './pages/CameraInterface';
import PostRecording from './pages/PostRecording';
import ProjectList from './pages/ProjectList';
import Credits from './pages/Credits';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-300">
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/setup" element={<ProjectSetup />} />
          <Route path="/camera/:projectId" element={<CameraInterface />} />
          <Route path="/preview/:recordingId" element={<PostRecording />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

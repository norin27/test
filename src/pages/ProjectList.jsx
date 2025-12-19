import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          recordings(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Delete this project and all its recordings?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-accent-blue hover:text-blue-400 flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="w-16"></div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-gray-400">No projects yet</p>
            <button
              onClick={() => navigate('/setup')}
              className="bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-effect border border-gray-700 rounded-lg p-4 hover:border-accent-blue transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <div className="text-sm text-gray-400 space-y-1 mt-2">
                      <p>Created: {formatDate(project.created_at)}</p>
                      <p>
                        {project.settings?.resolution} • {project.settings?.fps}fps • {project.settings?.codec}
                      </p>
                      <p className="text-accent-green">
                        {project.recordings?.[0]?.count || 0} recordings
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/camera/${project.id}`)}
                      className="bg-accent-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-accent-red bg-opacity-20 hover:bg-opacity-30 text-accent-red font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectList;

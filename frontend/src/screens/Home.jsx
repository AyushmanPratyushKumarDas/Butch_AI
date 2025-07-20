import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate } from 'react-router-dom';

function Home() {
  const { user } = useContext(UserContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault();
    axios.post('/projects/create', { name: projectName })
      .then((res) => {
        setModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    axios.get('/projects/all')
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <main className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#1a0a1d] via-[#1a1a2e] to-[#2c003e] p-0 md:p-8">
      {/* Heading and instructions */}
      <div className="w-full max-w-5xl mx-auto mt-12 mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg mb-4">Welcome to Butch AI Workspace</h1>
        <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto">Manage your projects with ease. Create a new project or select an existing one to get started. Collaborate, innovate, and accelerate your workflow with AI-powered tools.</p>
      </div>
      {/* Main content layout */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Create Project Card */}
        <div className="flex-1 bg-black/60 backdrop-blur-md border border-indigo-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center mb-8 md:mb-0">
          <div className="flex flex-col items-center mb-4">
            <div className="bg-gradient-to-tr from-pink-500 via-indigo-500 to-cyan-400 p-4 rounded-full mb-4 shadow-lg">
              <i className="ri-add-circle-fill text-5xl text-white drop-shadow-lg"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create a New Project</h2>
            <p className="text-gray-300 text-center mb-4">Start something amazing! Click below to create a new project and unleash the power of AI collaboration.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-lg shadow-lg transition duration-200 mt-2"
            >
              <i className="ri-add-circle-line mr-2"></i> Create Project
            </button>
          </div>
        </div>
        {/* Projects List */}
        <div className="flex-[2] w-full">
          <div className="mb-4 flex items-center gap-2">
            <i className="ri-folder-2-line text-2xl text-indigo-400"></i>
            <h3 className="text-xl font-bold text-white">Your Projects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {project.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400 py-8 bg-black/40 rounded-xl border border-gray-800">No projects yet. Create your first project!</div>
            ) : (
              project.map((project, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(`/project`, { state: { project } });
                  }}
                  className="cursor-pointer bg-black/60 border border-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow-lg hover:bg-indigo-900 transition group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-lightbulb-flash-line text-pink-400 text-xl group-hover:scale-110 transition"></i>
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">{project.name}</span>
                  </div>
                  <span className="text-xs text-gray-400"><i className="ri-team-line"></i> Team size: {project.users.length}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-all duration-500 ease-in-out" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="bg-[#18122B] p-8 rounded-2xl shadow-2xl w-96 animate-modal border border-indigo-700">
            <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">Enter Project Name</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
              className="w-full p-3 border bg-[#232136] rounded-lg mb-4 text-white border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-[#232136] text-white rounded-md border border-gray-700 hover:bg-indigo-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 text-white rounded-md font-bold shadow-md transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;

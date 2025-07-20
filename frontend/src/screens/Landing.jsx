import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import reactLogo from '../assets/react.svg';
import viteLogo from '../../public/vite.svg';
import tailwindLogo from '../assets/tailwind.svg';
import jsLogo from '../assets/js.svg';
import expressLogo from '../assets/express.svg';
import im1 from '../assets/im1.png';
import im2 from '../assets/im2.png';
import demoVideo from '../assets/demo.mp4';

const toolIcons = [
  { src: reactLogo, alt: 'React' },
  { src: viteLogo, alt: 'Vite' },
  { src: tailwindLogo, alt: 'Tailwind CSS' },
  { src: jsLogo, alt: 'JavaScript' },
  { src: expressLogo, alt: 'Express.js' },
];

const Landing = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#1a0a1d] via-[#1a1a2e] to-[#2c003e] relative overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-red-900 via-black to-transparent opacity-40 rounded-full blur-3xl top-[-20%] left-[-20%] animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-indigo-700 via-purple-900 to-transparent opacity-30 rounded-full blur-2xl bottom-[-10%] right-[-10%] animate-pulse"></div>
      </div>
      <div className="flex-1 flex flex-col items-center z-10 w-full">
        {/* Header */}
        <header className="w-full flex flex-col items-center pt-16 pb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg mb-4 tracking-tight">
            The enterprise <span className="text-red-400">AI code assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mb-8">
            Supercharge your team. Ship better code, faster. Secure, private, and built for modern development.
          </p>
          <Link to="/register" className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg text-lg transition duration-200">
            Get started for free
          </Link>
          
        </header>
        {/* Code Editor Mockup */}
        <section className="z-10 w-full flex flex-col items-center mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">epic Collaborative platform</h2>
          <div className="bg-[#18122B] border border-[#2A2438] rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <pre className="text-sm md:text-base text-indigo-200 font-mono whitespace-pre-wrap leading-relaxed">
{`function accelerateDevelopment(team) {
  return team.map(engineer => ({
    ...engineer,
    productivity: engineer.productivity * 2,
    codeQuality: 'enterprise-grade',
    aiAssistance: true
  }));
}`}
            </pre>
          </div>
        </section>
        {/* Works with your favorite tools */}
        <section className="z-10 w-full flex flex-col items-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Works with your favorite tools</h2>
          <div className="flex flex-row gap-8 mb-2">
            {toolIcons.map((icon, idx) => (
              <img
                key={idx}
                src={icon.src}
                alt={icon.alt}
                className="w-16 h-16 grayscale hover:grayscale-0 transition duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_16px_rgba(99,102,241,0.8)] cursor-pointer"
                style={{ transitionProperty: 'filter, transform, box-shadow' }}
              />
            ))}
          </div>
        </section>
        {/* Testimonials */}
        <section className="z-10 w-full flex flex-col items-center mb-16 px-4">
          <div className="max-w-2xl w-full bg-black/60 border border-gray-800 rounded-xl p-6 shadow-lg">
            <blockquote className="text-lg text-gray-200 italic text-center">
              "Engineers are saving roughly 6+ hours per week using AI code assistants like Butch AI, and writing code 2x faster than without it."
            </blockquote>
            <div className="mt-4 text-right text-gray-400 text-sm">— Told by someone who is a pro</div>
          </div>
        </section>
        {/* Features/Benefits */}
        <section className="z-10 w-full flex flex-col items-center mb-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            <div className="bg-[#18122B] border border-[#2A2438] rounded-xl p-6 text-center shadow-md">
              <h3 className="text-xl font-bold text-white mb-2">Accelerate Development</h3>
              <p className="text-gray-300">AI-powered code suggestions, refactoring, and documentation at your fingertips.</p>
            </div>
            <div className="bg-[#18122B] border border-[#2A2438] rounded-xl p-6 text-center shadow-md">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-gray-300">Your code and data stay private. Built with security and compliance in mind.</p>
            </div>
            <div className="bg-[#18122B] border border-[#2A2438] rounded-xl p-6 text-center shadow-md">
              <h3 className="text-xl font-bold text-white mb-2">Seamless Collaboration</h3>
              <p className="text-gray-300">Integrates with your favorite tools for a smooth team workflow.</p>
            </div>
          </div>
        </section>
        {/* Images before Footer */}
        <section className="z-10 w-full flex flex-col items-center mb-12 px-4">
          <div className="flex flex-col md:flex-row gap-10 justify-center items-center w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center w-full md:w-3/5">
              <img src={im1} alt="Showcase 1" className="rounded-xl shadow-2xl w-full max-h-[420px] object-cover border-2 border-indigo-700" />
              <span className="mt-4 text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg text-center">
                Seamless Collaboration in Action
              </span>
              <span className="text-sm text-gray-400 text-center mt-1">Experience real-time teamwork and project flow</span>
            </div>
            <div className="flex flex-col items-center w-full md:w-3/5">
              <img src={im2} alt="Showcase 2" className="rounded-xl shadow-2xl w-full max-h-[420px] object-cover border-2 border-pink-600" />
              <span className="mt-4 text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg text-center">
                AI-Powered Coding Experience
              </span>
              <span className="text-sm text-gray-400 text-center mt-1">Let Butch AI accelerate your workflow with smart suggestions</span>
            </div>
          </div>
          {/* Demo Video Section */}
          <section className="z-10 w-full flex flex-col items-center mb-12 px-4 mt-8">
            <div className="relative group max-w-3xl w-full mx-auto flex flex-col items-center">
              <div className="w-full aspect-video bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500">
                <video
                  src={demoVideo}
                  className="w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-100 opacity-0"
                  loop
                  muted
                  playsInline
                  preload="none"
                  onMouseOver={e => { e.target.play(); e.target.style.opacity = 1; }}
                  onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; e.target.style.opacity = 0; }}
                />
                {/* Play overlay before hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 group-hover:opacity-0 opacity-100">
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-pink-400 shadow-lg">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.15"/><polygon points="19,16 34,24 19,32" fill="#fff"/></svg>
                    </span>
                    <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg text-center">
                      Watch Demo
                    </span>
                    <span className="text-base md:text-lg text-white/80 font-semibold text-center">
                      See Butch AI in action: real-time code, chat, and collaboration!
                    </span>
                  </div>
                </div>
                {/* Caption overlay when playing */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-center pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                  <span className="text-base md:text-lg font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl tracking-wide font-sans" style={{letterSpacing: '0.04em'}}>
                    Experience Next-Gen Collaboration & AI Coding with <span className="underline decoration-pink-400/60 decoration-2 underline-offset-4">Butch AI</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
      {/* Footer */}
      <footer className="z-10 w-full py-8 text-gray-500 text-xs text-center opacity-70 border-t border-gray-800 bg-black/40">
        &copy; {new Date().getFullYear()} Butch AI. All rights reserved. | <Link to="/login" className="underline hover:text-red-400">Sign In</Link> | <Link to="/register" className="underline hover:text-red-400">Sign Up</Link>
      </footer>
    </div>
  );
};

export default Landing; 
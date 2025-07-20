import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket, removeMessageListener } from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from 'markdown-to-jsx';

import { getWebContainer } from "../config/webContainer.js";
import TerminalPopup, { addTerminalLogExternally } from '../components/TerminalPopup';


// Component for syntax highlighting
function SyntaxHighlightedCode(props) {
  const ref = useRef(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current);
      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted');
    }
  }, [props.className, props.children]);

  const handleCopy = () => {
    if (ref.current) {
      navigator.clipboard.writeText(ref.current.innerText)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  // Ensure children is a string for highlight.js
  const children = React.Children.toArray(props.children).join('');

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-1 p-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
      <code {...props} ref={ref}>{children}</code>
    </div>
  );
}

// 1. Add a simple SVG for the AI avatar
const AIAvatar = () => (
  <span className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-cyan-400 to-pink-400">
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#232136" />
      <ellipse cx="11.5" cy="15" rx="2.5" ry="3" fill="#fff" />
      <ellipse cx="20.5" cy="15" rx="2.5" ry="3" fill="#fff" />
      <ellipse cx="11.5" cy="15" rx="1.2" ry="1.5" fill="#6366f1" />
      <ellipse cx="20.5" cy="15" rx="1.2" ry="1.5" fill="#6366f1" />
      <rect x="12" y="21" width="8" height="2" rx="1" fill="#fff" />
    </svg>
  </span>
);

function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State variable for messages
  const { user } = useContext(UserContext);
  const messageBox = useRef();


  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setopenFiles] = useState([]);
  const webContainerRef = useRef(null);


  const [webContainer, setwebContainer] = useState(null);
  const [iframeUrl, setiframeUrl] = useState(null);
  const [serverProcess, setServerProcess] = useState(null);

  const [iframeWindow, setIframeWindow] = useState({
    x: window.innerWidth / 2 - 200,
    y: 100,
    width: 400,
    height: 300,
    minimized: true,
    maximized: false,
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    resizing: false,
    resizeStartX: 0,
    resizeStartY: 0,
    resizeStartWidth: 0,
    resizeStartHeight: 0,
  });

  useEffect(() => {
    // Initialize socket only once
    initializeSocket(project._id);

    const initWebContainer = async () => {
      console.log("Starting WebContainer initialization...");
      try {
        const container = await getWebContainer();
        console.log("WebContainer instance received:", container);
        webContainerRef.current = container;
        setwebContainer(container);
        console.log("WebContainer state updated");
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
      }
    };

    initWebContainer();

    const handleMessage = async (data) => {
      console.log('[SOCKET] Received message:', data);
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(data.message);
      } catch {
        parsedMessage = null;
      }
      // Only update fileTree if it's an AI message
      if (parsedMessage && parsedMessage.fileTree) {
        setFileTree(parsedMessage.fileTree);
      }
      setMessages(prevMessages => {
        const last = prevMessages[prevMessages.length - 1];
        if (last && last.message === data.message && last.sender === data.sender) {
          return prevMessages;
        }
        return [...prevMessages, data];
      });
      
      if (webContainerRef.current && parsedMessage && parsedMessage.fileTree) {
        console.log("Attempting to mount fileTree:", parsedMessage.fileTree);
        try {
          const mounted = await webContainerRef.current.mount(parsedMessage.fileTree);
          console.log("webContainer mounted successfully:", mounted);
        } catch (error) {
          console.error('Error mounting file tree:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            fileTree: parsedMessage.fileTree
          });
        }
      } else {
        console.log("Cannot mount - missing requirements:", {
          hasWebContainer: !!webContainerRef.current,
          hasFileTree: !!parsedMessage && !!parsedMessage.fileTree,
          webContainerState: webContainerRef.current
        });
      }
    };

    receiveMessage('project-message', handleMessage);

    axios.get('/users/all').then(res => {
      setUsers(res.data.users);
    }).catch(err => {
      console.log(err);
    });

    axios.get(`/projects/get-project/${location.state.project._id}`).then(
      res => {
        setProject(res.data.project);
      }
    );

    return () => {
      removeMessageListener('project-message', handleMessage);
      disconnectSocket();
      // Cleanup if needed
      if (webContainerRef.current) {
        webContainerRef.current = null;
      }
    };
  // eslint-disable-next-line
  }, []); // Only run once on mount

  const handleUserClick = (userId) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  function addCollaborators() {
    axios.put("/projects/add-user", {
      projectId: location.state.project._id,
      users: Array.from(selectedUserIds)
    }).then(res => {
      console.log(res.data);
      setIsModalOpen(false);
    }).catch(err => {
      console.log(err);
    });
  }

  const send = () => {
    const newMessage = {
      message,
      sender: user.email
    };

    sendMessage('project-message', newMessage);
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage("");
  };

  const handleDragStart = (e) => {
    setIframeWindow((prev) => ({
      ...prev,
      dragging: true,
      offsetX: e.clientX - prev.x,
      offsetY: e.clientY - prev.y,
    }));
  };

  const handleDrag = (e) => {
    if (!iframeWindow.dragging) return;
    setIframeWindow((prev) => ({
      ...prev,
      x: e.clientX - prev.offsetX,
      y: e.clientY - prev.offsetY,
    }));
  };

  const handleDragEnd = () => {
    setIframeWindow((prev) => ({
      ...prev,
      dragging: false,
    }));
  };

  useEffect(() => {
    if (iframeWindow.dragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDrag);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [iframeWindow.dragging]);

  const handleMaximize = () => {
    setIframeWindow((prev) => ({
      ...prev,
      maximized: true,
      minimized: false,
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  };

  const handleMinimize = () => {
    setIframeWindow((prev) => ({
      ...prev,
      minimized: true,
      maximized: false,
      width: 400,
      height: 64,
      x: window.innerWidth / 2 - 200,
      y: 100,
    }));
  };

  const handleRestore = () => {
    setIframeWindow((prev) => ({
      ...prev,
      minimized: false,
      maximized: false,
      width: 400,
      height: 300,
      x: window.innerWidth / 2 - 200,
      y: 100,
    }));
  };

  // Add resize handlers
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIframeWindow((prev) => ({
      ...prev,
      resizing: true,
      resizeStartX: e.clientX,
      resizeStartY: e.clientY,
      resizeStartWidth: prev.width,
      resizeStartHeight: prev.height,
    }));
  };

  const handleResizing = (e) => {
    if (!iframeWindow.resizing) return;
    const newWidth = Math.max(200, iframeWindow.resizeStartWidth + (e.clientX - iframeWindow.resizeStartX));
    const newHeight = Math.max(100, iframeWindow.resizeStartHeight + (e.clientY - iframeWindow.resizeStartY));
    setIframeWindow((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
  };

  const handleResizeEnd = () => {
    setIframeWindow((prev) => ({
      ...prev,
      resizing: false,
    }));
  };

  useEffect(() => {
    if (iframeWindow.resizing) {
      window.addEventListener("mousemove", handleResizing);
      window.addEventListener("mouseup", handleResizeEnd);
      return () => {
        window.removeEventListener("mousemove", handleResizing);
        window.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [iframeWindow.resizing]);

  // Add a handler to trigger npm install
  const handleNpmInstall = () => {
    sendMessage('run-npm-install');
  };

  // Add this helper to send logs to the backend for terminal streaming
  const sendTerminalLog = (msg, type = 'info') => {
    console.log('[sendTerminalLog] Sending:', msg, type); // Debug log
    sendMessage('project-terminal-log', { message: msg, type });
  };

  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-[#18122B] via-[#232136] to-[#1a0a1d]">
      {/* Left: Chat/AI Assistant */}
      <section className="flex flex-col w-full md:w-[420px] h-full border-r border-indigo-900 bg-[#18122B]">
        {/* AI Assistant Header */}
        <header className="flex items-center gap-3 p-5 bg-[#232136] border-b border-indigo-900 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-pink-400 text-white text-2xl font-bold">
            <i className="ri-robot-2-line"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wide">Butch AI Assistant</span>
            <span className="text-xs text-indigo-200">Chat & Code Generation</span>
          </div>
          <div className="flex-1 flex justify-end gap-2">
            <button className="p-2 text-indigo-300 hover:text-indigo-400 transition" onClick={() => setIsModalOpen(true)} title="Add Member">
              <i className="ri-user-add-line"></i>
            </button>
            <button className="p-2 text-indigo-300 hover:text-indigo-400 transition" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} title="Team Members">
              <i className="ri-group-fill"></i>
            </button>
          </div>
        </header>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#232136] overflow-y-auto scrollbar-hide p-4 gap-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === user.email ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender === user.email ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${msg.sender === 'BUTCH AI' ? '' : 'bg-indigo-900 text-indigo-200'} font-bold text-lg`}>
                  {msg.sender === 'BUTCH AI' ? <AIAvatar /> : <i className="ri-user-3-line"></i>}
                </div>
                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow ${msg.sender === user.email ? 'bg-indigo-800 text-white border border-indigo-500' : msg.sender === 'BUTCH AI' ? 'bg-[#18122B] text-indigo-100 border border-gray-700' : 'bg-blue-900 text-white border border-blue-700'} relative`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold tracking-wide text-indigo-300">{msg.sender === user.email ? 'You' : msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {msg.sender === 'BUTCH AI' ? (
                    <div className="overflow-auto">
                      <Markdown options={{
                        overrides: {
                          fileTree: SyntaxHighlightedCode,
                          pre: {
                            component: ({ children, ...props }) => <pre {...props} style={{ backgroundColor: 'transparent' }}>{children}</pre>,
                          },
                        }
                      }}>{JSON.parse(msg.message).Text}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Input Field */}
        <div className="inputField w-full flex bg-[#18122B] p-3 border-t border-indigo-900">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                send();
              }
            }}
            className="flex-grow p-3 px-4 border-none outline-none bg-[#232136] text-white rounded-l-md"
            type="text"
            placeholder="Type a message..."
          />
          <button
            onClick={send}
            className="p-2 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-r-md font-semibold transition"
          >
            <i className="ri-send-plane-2-fill"></i>
          </button>
        </div>
      </section>
      {/* Side Panel */}
      <div
        className={`sidePanel w-full md:w-[420px] h-full bg-[#232136] absolute transition-all z-50 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0 border-r border-indigo-900`}
      >
        <header className="flex justify-end gap-2 p-2 px-3 w-full bg-[#232136] border-b border-indigo-900">
          <button onClick={() => setIsSidePanelOpen(false)} className="text-indigo-300 hover:text-white transition">
            <i className="ri-close-large-line"></i>
          </button>
        </header>
        <h1 className="text-2xl py-2 px-4 font-bold text-indigo-300 border-b border-indigo-900 mb-2 bg-[#18122B] rounded-t-xl shadow">Team Members</h1>
        <div className="users flex flex-col gap-3 px-4 pb-4 bg-[#18122B] rounded-b-xl shadow">
          {project.users && project.users.map(user => (
            <div key={user._id} className="user flex gap-3 p-3 items-center bg-[#232136] rounded-xl border border-indigo-900 hover:bg-indigo-900 transition shadow">
              <div className="aspect-square rounded-full w-10 h-10 flex items-center justify-center bg-indigo-700 text-white text-xl">
                <i className="ri-user-2-fill"></i>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-white">{user.email}</span>
                {/* Optionally add a role or status here */}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right: Code Editor & File Explorer */}
      <section className="flex-grow h-full flex flex-col bg-[#232136]">
        <div className="flex h-full">
          {/* File Explorer */}
          <div className="explorer h-full max-w-64 min-w-52 bg-[#18122B] border-r border-indigo-900">
            <div className="file-tree w-full p-2">
              {Object.keys(fileTree).map((file, index) => (
                <button key={index} onClick={() => {
                  setCurrentFile(file)
                  setopenFiles(prevOpenFiles => {
                    const newOpenFiles = new Set(prevOpenFiles);
                    newOpenFiles.add(file);
                    return Array.from(newOpenFiles);
                  })
                }} className="tree-element cursor-pointer p-2 px-4 flex item-center gap-2 bg-[#232136] hover:bg-indigo-900 text-white w-full rounded transition">
                  <p className="text-sm font-semibold">{file}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Code Editor */}
          {currentFile && (
            <div className="code-editor h-full flex flex-col flex-grow">
              <div className="top flex justify-between w-full bg-[#18122B] border-b border-indigo-900">
                <div className="files flex">
                  {openFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentFile(file);
                      }}
                      className={`p-2 px-4 text-sm font-semibold border-b-2 ${file === currentFile ? 'bg-[#232136] text-indigo-400 border-indigo-400' : 'bg-[#18122B] text-white hover:bg-indigo-900 border-transparent'} transition`}
                    >
                      {file}
                    </button>
                  ))}
                </div>
                <div className="actions flex gap-4 items-center px-4 py-2 mt-1 mb-1">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white hover:bg-indigo-800 rounded shadow transition font-semibold"
                    onClick={async () => {
                      if (!webContainer) return;
                      if (serverProcess) {
                        try {
                          await serverProcess.kill();
                          await serverProcess.exit;
                        } catch (e) {
                          console.warn("Failed to kill previous process:", e);
                        }
                      }
                      const installProcess = await webContainer.spawn("npm", ["install"]);
                      installProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log('[WebContainer output] chunk:', chunk); // Debug log
                          sendTerminalLog(chunk, 'info');
                          if (addTerminalLogExternally) {
                            addTerminalLogExternally({
                              message: chunk,
                              type: 'info',
                              timestamp: new Date().toISOString()
                            });
                          }
                        }
                      }));
                      const runProcess = await webContainer.spawn("npm", ["start"]);
                      setServerProcess(runProcess);
                      runProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        }
                      }));
                      webContainer.on('server-ready', (port, url) => {
                        setiframeUrl(url);
                      });
                    }}
                  >
                    <i className="ri-play-fill text-lg"></i> Run
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white hover:bg-green-800 rounded shadow transition font-semibold"
                    onClick={async () => {
                      if (!webContainer || !currentFile) return;
                      try {
                        await webContainer.fs.writeFile(currentFile, fileTree[currentFile].file.contents);
                        alert("File saved!");
                        if (serverProcess) {
                          try {
                            await serverProcess.kill();
                            await serverProcess.exit;
                          } catch (e) {
                            console.warn("Failed to kill previous process:", e);
                          }
                        }
                        const runProcess = await webContainer.spawn("npm", ["start"]);
                        setServerProcess(runProcess);
                        runProcess.output.pipeTo(new WritableStream({
                          write(chunk) {
                            console.log(chunk);
                          }
                        }));
                        webContainer.on('server-ready', (port, url) => {
                          setiframeUrl(url);
                        });
                      } catch (err) {
                        alert("Failed to save file: " + err.message);
                      }
                    }}
                  >
                    <i className="ri-save-3-fill text-lg"></i> Save
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 rounded shadow transition font-semibold"
                    onClick={async () => {
                      try {
                        const response = await axios.post(
                          '/projects/download-zip',
                          {
                            fileTree: fileTree,
                            zipName: `project_${project._id}`
                          },
                          {
                            responseType: 'blob',
                          }
                        );
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `project_${project._id}.zip`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (err) {
                        alert('Failed to download project: ' + err.message);
                      }
                    }}
                  >
                    <i className="ri-download-2-fill text-lg"></i> Download
                  </button>
                </div>
              </div>
              <div className="bottom flex flex-grow">
                <div className="w-full h-full bg-[#232136] p-2 font-mono text-sm overflow-auto relative">
                  <div className="relative w-full h-full">
                    <div className="relative w-full h-full">
                      {/* --- DO NOT CHANGE THE TEXTAREA CODE --- */}
                      <textarea
                        className="absolute inset-0 w-full h-full bg-transparent p-2 font-mono text-sm resize-none caret-white outline-none"
                        value={fileTree[currentFile].file.contents}
                        onChange={(e) => {
                          const newFileTree = { ...fileTree };
                          newFileTree[currentFile].file.contents = e.target.value;
                          setFileTree(newFileTree);
                        }}
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        onScroll={(e) => {
                          const pre = e.target.parentElement.querySelector('pre');
                          if (pre) {
                            pre.scrollTop = e.target.scrollTop;
                            pre.scrollLeft = e.target.scrollLeft;
                          }
                        }}
                      />
                      <pre className="absolute inset-0 w-full h-full p-2 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap">
                        <code 
                          className={`language-${currentFile.split('.').pop()}`}
                          dangerouslySetInnerHTML={{
                            __html: hljs.highlight(
                              fileTree[currentFile].file.contents,
                              { language: currentFile.split('.').pop() }
                            ).value
                          }}
                          style={{ color: '#e2e8f0' }}
                        />
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {iframeUrl && webContainer && (
          <div
            className="fixed z-50"
            style={{
              top: iframeWindow.y,
              left: iframeWindow.x,
              width: iframeWindow.width,
              height: iframeWindow.height,
              transition: "width 0.2s, height 0.2s",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              borderRadius: 8,
              background: "#18122B", // inner window color is dark
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              color: "#e2e8f0", // default text color is light
            }}
          >
            {/* Title Bar */}
            <div
              className="cursor-move bg-[#232136] text-indigo-200 flex items-center justify-between px-2 py-1 border-b border-indigo-900"
              style={{ userSelect: "none" }}
              onMouseDown={handleDragStart}
            >
              <span className="font-semibold tracking-wide">Live Preview</span>
              <div className="flex gap-1">
                {iframeWindow.maximized ? (
                  <button onClick={handleRestore} className="px-2">🗗</button>
                ) : (
                  <button onClick={handleMaximize} className="px-2">🗖</button>
                )}
                <button onClick={handleMinimize} className="px-2">🗕</button>
              </div>
            </div>
            {/* Iframe */}
            {!iframeWindow.minimized && (
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0 flex-grow"
                style={{ background: "#18122B", color: "#e2e8f0" }} // inner window color is dark, text is light
                title="Live Preview"
              ></iframe>
            )}
            {iframeWindow.minimized && (
              <div style={{ height: 48 }}></div>
            )}
            {/* Resize Handle */}
            {!iframeWindow.minimized && !iframeWindow.maximized && (
              <div
                onMouseDown={handleResizeStart}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 20,
                  height: 20,
                  cursor: "nwse-resize",
                  zIndex: 10,
                  background: "transparent",
                  userSelect: "none",
                }}
              >
                <svg width="20" height="20">
                  <polyline points="0,20 20,0" stroke="#6366f1" strokeWidth="2" />
                </svg>
              </div>
            )}
          </div>
        )}
      </section>
      {/* Modal for Selecting Users */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#232136] p-6 rounded-2xl w-96 max-w-full border border-indigo-900 shadow-2xl">
            <header className="flex justify-between items-center mb-4 border-b border-indigo-900 pb-2">
              <h2 className="text-xl font-bold text-indigo-300">Select Users</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-indigo-300 hover:text-white transition">
                <i className="ri-close-fill"></i>
              </button>
            </header>

            {/* User List */}
            <div className="users-list flex flex-col gap-2 mb-16 max-h-72 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer p-2 flex gap-2 items-center rounded transition border ${selectedUserIds.has(user._id) ? "bg-indigo-700 text-white border-indigo-500" : "bg-[#18122B] text-indigo-200 border-indigo-900 hover:bg-indigo-900"}`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-indigo-700">
                    <i className="ri-user-fill"></i>
                  </div>
                  <h1 className="font-semibold text-base">{user.email}</h1>
                </div>
              ))}
            </div>

            {/* Confirm Selection Button */}
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold shadow-md transition"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
      {/* Place the terminal popup so it overlays the page */}
      <TerminalPopup />
    </main>
  );
}

export default Project;
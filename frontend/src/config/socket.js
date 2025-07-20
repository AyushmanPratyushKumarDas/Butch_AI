import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => socketInstance;

export const initializeSocket = (projectId) => {
    if (!socketInstance) {
        socketInstance = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
            query: {
                projectId
            }
        });
    }
    return socketInstance;
}

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

export const receiveMessage = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.on(eventName, cb);
    }
}

export const removeMessageListener = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.off(eventName, cb);
    }
}

export const sendMessage = (eventName, data) => {
    if (socketInstance) {
        socketInstance.emit(eventName, data);
    }
}
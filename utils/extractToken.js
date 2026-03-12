

const extractTokenFromSocket = (socket) => {
 
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    if (socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split('; ');
        const authCookie = cookies.find(c => c.startsWith('auth_token='));
        if (authCookie) {
            return authCookie.split('=')[1];
        }
    }

    if (socket.handshake.auth.token) {
        return socket.handshake.auth.token;
    }
    
    if (socket.handshake.query.token) {
        return socket.handshake.query.token;
    }
    
    return null;
};


export {extractTokenFromSocket};
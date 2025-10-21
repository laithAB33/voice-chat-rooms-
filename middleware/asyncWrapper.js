
function asyncWrapper(fn){

    return (req,res,next) => {
        fn(req,res,next).catch(err =>{
            
            next(err);
        })
    }
}

function socketWrapper(fn) {
    return async (socket,...args) => {        
        try {
            await fn(socket,...args);
        } catch (err) {

            console.error('Socket Error:', {
                user: socket.username,
                error: err.message
            });

            socket.emit("error", {
                success: false,
                message: err.message,
                code: err.code || "INTERNAL_ERROR"
            });
            
        }
    };
}

function socketWrapper2(socket,fn) {
    return async (...args) => {        
        try {
            await fn(...args);
        } catch (err) {

            console.error('Socket Error:', {
                user: socket.username,
                error: err.message
            });

            socket.emit("error", {
                success: false,
                message: err.message,
                code: err.code || "INTERNAL_ERROR"
            });
            
        }
    };
}



export {asyncWrapper,socketWrapper,socketWrapper2};
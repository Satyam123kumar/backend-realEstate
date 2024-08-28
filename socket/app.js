import {Server} from "socket.io"

const io = new Server({
    cors: {
        origin:"http://localhost:5173",
    }
});

let onlineUser = [];

const addUser = (userId, socketId) =>{
    const userExists = onlineUser.find(user=> user.userId === userId);

    if (!userExists){
        onlineUser.push({userId, socketId});
    }
}

const removeUser = (socketId) => {
    onlineUser = onlineUser.filter(user=>user.socketId !== socketId)
}

//for private messages

const getUser = (userId) =>{
    return onlineUser.find((user)=> user.userId === userId);
}

io.on("connection", (socket)=>{
    // console.log(socket.id);
    //get the userid from the client and save it inside online user
    socket.on("newUser", (userId)=>{
        addUser(userId, socket.id)
        console.log(onlineUser)
    })
    
    socket.on("sendMessage", ({receiverId, data}) => {
        // console.log(receiverId);
        const receiver = getUser(receiverId)
        io.to(receiver.socketId).emit("getMessage", data);
    })
    socket.on("disconnect", ()=>{
        removeUser(socket.id)
    })
})


io.listen("4000")
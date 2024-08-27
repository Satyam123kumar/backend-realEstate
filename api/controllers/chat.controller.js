import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {

    const tokenUserId = req.userId;
    try {

        const chats = await prisma.chat.findMany({
            where: {
                userIDs: {
                    hasSome: [tokenUserId]
                }
            }
        })

        //we need to fetch user info too, so that we can show username and avatar
        //chat.userIDs have 2 id sender and receiver
        for(const chat of chats){
            const receiverId = chat.userIDs.find((id) => id!== tokenUserId);  //if it's not our id then it's other user id
            
            const receiver = await prisma.user.findUnique({
                where: {
                    id: receiverId,
                },

                //we only need username and avatar not all the user information
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                }
            })
            //add receiver info to chats
            chat.receiver = receiver
        }
        
        res.status(200).json(chats)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get Chats" })
    }
}

export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {

        const chat = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
                //this is done to avoid other user cannot fetch chat 
                userIDs: {
                    hasSome: [tokenUserId]
                }
            },
            //now as soon as we open any chat, it will update seenBy
            include: {
                messages: {
                    //this will return the latest messages
                    orderBy: {
                        createdAt: "asc",
                    }
                }
            }
        });
        await prisma.chat.update({
            where: {
                id: req.params.id
            },
            data: {
                seenBy: {
                    push: [tokenUserId]
                }
            }
        })
        res.status(200).json(chat)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to get Chat" })
    }
}

export const addChat = async (req, res) => {

    const tokenUserId = req.userId;
    // console.log("inside add chat token id ", tokenUserId)
    // console.log("inside add chat receiver id ", req.body.receiverId)
    try {

        const newChats = await prisma.chat.create({
            data: {
                userIDs: [tokenUserId, req.body.receiverId]
            }
        })
        res.status(200).json(newChats)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to add Chat" })
    }
}

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.update({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            }
        })
        res.status(200).json(chat)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to read Chats"})
    }
}
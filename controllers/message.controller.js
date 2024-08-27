import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {

    const tokenUserId = req.userId;
    //text, sender id, and chat id (inside message db)
    const chatId = req.params.chatId;
    const text = req.body.text;
    try {

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                //security
                userIDs: {
                    hasSome:[tokenUserId]
                }
            }
        });

        if (!chat){
            return res.status(404).json({message: "chat not found!"})
        }

        const message = await prisma.message.create({
            data: {
                text,
                chatId,
                userId: tokenUserId,
            }
        })

        //update seen by for other user
        await prisma.chat.update({
            where:{
                id: chatId
            },
            data:{
                seenBy: [tokenUserId],    //we cannot do set, we directly use this so that it gonna replace other's user id
                lastMessage: text         //update the last message
            }
        })

        res.status(200).json(message)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to add Message" })
    }
}
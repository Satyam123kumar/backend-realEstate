import prisma from "../lib/prisma.js"
import bcrypt from "bcrypt"

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to get users!"})
    }
}

export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await prisma.user.findUnique({
            where: {id}
        });
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to get user!"})
    }
}

export const updateUser = async (req, res) => {
    const id = req.params.id;

    //now we take the id from cookie and this id, and compare them both
    //if both are equal it means it the the original owner
    const tokenUserId = req.userId; //inside middle ware (verifyToken.js) 

    if (id!==tokenUserId){
        return res.status(403).json({message: "Not Aurthorized!"})
    }

    //Now take all the user info, and update it later
    //But here we need to seperate password, as if we update the password as same as other things like username and email
    //password will we sent directly without encryption

    // const body = req.body;
    const {password, avatar, ...inputs} = req.body;

    let updatedPassword = null;
    try {

        if (password){
            updatedPassword = await bcrypt.hash(password, 10);

        }
        const updatedUser = await prisma.user.update({
            where: {id},
            data: {
                ...inputs,
                //if there is no update in password we are not going to add anything else
                //else we have an updatedPassword
                ...(updatedPassword && {password: updatedPassword}),
                ...(avatar && {avatar})
            }
        }) 

        //we don't want to send password, so we have to seperate it out from updatedUser
        //Note: - we cannot seperate password with the same name, so we need to give any random name
        const {password:userPassword, ...rest} = updatedUser;

        return res.status(200).json(rest)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to update user!"})
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    if (id!==tokenUserId){
        return res.status(403).json({message: "Not Aurthorized!"})
    }
    try {
        await prisma.user.delete({
            where: {id}
        })

        return res.status(200).json({message: "User deleted!"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to delete user!"})
    }
}

export const savePost = async (req, res) => {
    const postId = req.body.postId;
    const tokenUserId = req.userId;
    try {
        
        const savedPost = await prisma.savedPost.findUnique({
            where: {
                userId_postId:{
                    userId: tokenUserId,
                    postId                 //postId: postId same thing
                }
            }
        })

        if (savedPost) {
            await prisma.savedPost.delete({
                where: {
                    id: savedPost.id
                }
            })
            res.status(200).json({message: "Post removed from saved list!"})
        }
        else{
            await prisma.savedPost.create({
                data: {
                    userId: tokenUserId,
                    postId,
                }
            })
            res.status(200).json({message: "Post saved!"})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Failed to save post!"})
    }
}

export const profilePosts = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const userPosts = await prisma.post.findMany({
            where: {
                userId: tokenUserId
            }
        });

        const saved = await prisma.savedPost.findMany({
            where: {
                userId: tokenUserId     //this will just give id, userId, postId (see in schema prisma) but we also want posts for that we have to include it
            },
            include: {
                post: true,
            }
        });

        //Now we don't want saved post and want only post object, so will map through item
        const savedPosts = saved.map((item)=>item.post)  //this will return post array
        res.status(200).json({userPosts, savedPosts})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to get profile posts!"})
    }
}

export const getNotificationNumber = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chatsNumber = await prisma.chat.count({
            where:{
                userIDs: {
                    hasSome: [tokenUserId]
                },
                NOT:{
                    seenBy:{
                        hasSome: [tokenUserId]
                    }
                }
            }
        })
        res.status(200).json(chatsNumber)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to get profile posts!"})
    }
}
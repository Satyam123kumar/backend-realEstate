import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
    //this is just the query comes from loader function and have value { location: 'london', minPrice: '100', maxPrice:'10000' }
    const query = req.query;
    // console.log(query);
    try {
        const posts = await prisma.post.findMany({
            where: {
                city: query.city || undefined,
                type: query.type || undefined,
                property: query.property || undefined,
                bedroom: parseInt(query.bedroom) || undefined,
                price: {
                    gte: parseInt(query.minPrice) || 0,   //greater than min price
                    lte: parseInt(query.maxPrice) || 10000000,   // less than max price 
                }
            }
        })
        return res.status(200).json(posts)
    } catch (err) {
        console.log("error in post controller, ", err)
        res.status(500).json({ message: "Failed to get posts!" })
    }
}

//here we don't require verify token as anyone can see the post. 
//But if someone want to sake the post we need to get the token and verify it
export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                postDetail: true,
                // user: true   //as it contains password so we need to remove it
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                }
            }
        })

        // return res.status(200).json({message: "Sent"})

        //code for saved post
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
                if (err){
                    return res.status(401).json({ error: 'Invalid token' });
                }
                try{
                    const saved = await prisma.savedPost.findUnique({
                        where: {
                            userId_postId: {
                                postId: id,
                                userId: payload.id,
                            },
                        }
                    })
                    return res.status(200).json({ ...post, isSaved: saved ? true : false });
                }
                catch(error){
                    return res.status(500).json({ error: 'Internal server error' });
                }
            })
        }
        else{
            return res.status(400).json({ error: "Token not provided" });
        }
        
    } catch (err) {
        console.log("error in post controller, ", err)
        res.status(500).json({ message: "Failed to get post!" })
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    try {
        const newPost = await prisma.post.create({
            data: {
                ...body.postData,
                userId: tokenUserId,
                postDetail: {
                    create: body.postDetail
                }
            }
        })
        return res.status(200).json(newPost)
    } catch (err) {
        console.log("error in post controller, ", err)
        return res.status(500).json({ message: "Failed to add post!" })
    }
}

export const updatePost = async (req, res) => {
    try {
        return res.status(200).json()
    } catch (err) {
        console.log("error in post controller, ", err)
        return res.status(500).json({ message: "Failed to update post!" })
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    try {

        const post = await prisma.post.findUnique({
            where: { id }
        })

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Aurthorized!" })
        }
        await prisma.post.delete({
            where: { id }
        })
        return res.status(200).json({ message: "Post deleted sucessfully!" })
    } catch (err) {
        console.log("error in post controller, ", err)
        return res.status(500).json({ message: "Failed to delete post!" })
    }
}
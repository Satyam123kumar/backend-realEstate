import express from "express"
import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/post.controller.js"
import {verifyToken} from "../middleware/verifyToken.js"

const router = express.Router()

router.get("/", getPosts)
router.get("/:id", getPost)  //as anyone with the link can see the single page post
router.post("/", verifyToken, addPost)
router.put("/:id", verifyToken, updatePost)
router.delete("/:id", verifyToken, deletePost)


export default router
import express from "express"
import { shouldBeAdmin, shouldBeLoggedIn } from "../controllers/test.controller.js"
import {verifyToken} from "../middleware/verifyToken.js"

const router = express.Router()

//Just a test route to check user is logged in or not
router.get("/should-be-logged-in", verifyToken, shouldBeLoggedIn)

//This is used to check user is admin or not
router.get("/should-be-admin", shouldBeAdmin)

export default router
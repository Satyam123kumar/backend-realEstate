import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {

    const { username, email, password } = req.body;

    try {

        //HASH the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);

        //create new user and save to the data base using prisma
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })

        // console.log(newUser);
        res.status(201).json({ message: "User created Sucessfully" })

        // console.log(req.body);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Failed to create User" })
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        //Check if the user exists
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials!" });
        }

        //check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials!" });
        }

        //generate cookie token and send to the user
        // res.setHeader("Set-cookie", "test=" + "myValue").json("sucess") 

        const age = 1000 * 60 * 60 * 24 * 7;

        //in this token, user id is there, so if get the token inside cookie we take the token and decrypt that
        //we will get the user id from that 
        //Use case is that, if a user try to delete a post we will check if the post belong to that user or not
        //if user id is different we send an error
        const token = jwt.sign({
            id: user.id,
            isAdmin: false,
        }, process.env.JWT_SECRET_KEY, { expiresIn: age })

        //here we cannot give password as same name, so we have given any random name
        const { password: userPassword, ...userInfo } = user

        res.cookie("token", token, {
            httpOnly: true,
            // secure: true,
            maxAge: age,
        }).status(200).json(userInfo)


    } catch (err) {
        // console.log(err)
        res.status(500).json({ message: "Failed to login" })
    }
}

export const logout = (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout sucessful!" })
}
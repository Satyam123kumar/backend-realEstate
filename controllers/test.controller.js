import jwt from "jsonwebtoken";

export const shouldBeLoggedIn = async (req, res) => {
    
    //this comes from middleware (id of logged in user)
    //this id is important because when we delete any post, or do any protected 
    // console.log("user Id: ", req.userId);

    return res.status(200).json({message: "You are authenticated"})
}

export const shouldBeAdmin = async(req, res) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({message: "Not authenticated!"})
    
    //here payload cotains our user id, as in auth.controller.js I have signed the jwt token with user id 
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload)=>{
        if (err) return res.status(403).json({message: "Token is not valid!"})
        if (!payload.isAdmin) return res.status(403).json({message: "Not aurthorized!"})
    })

    return res.status(200).json({message: "You are authenticated"})

}
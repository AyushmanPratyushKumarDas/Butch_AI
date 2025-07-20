import jwt from "jsonwebtoken";
import redisClint from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // Extract token from different places
        const token = req.cookies?.token || 
        (req.headers?.authorization && req.headers.authorization.split(' ')[1]) ||
        req.body?.token;

        // If token is missing, return unauthorized error
        if (!token) {
            res.cookies('token','',{maxage:1});
            return res.status(401).send({ error: "Unauthorized: No token provided" });
        }


        const isBlacklisted = await redisClint.get(token);
        if (isBlacklisted) {
            return res.status(401).send({ error: "Unauthorized: Token is blacklisted" });
        }

        // const isBlacklisted = await redisClint.get(token);

        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user information to request object
        req.user = decoded;

        // Proceed to the next middleware
        next();
    } catch (err) {
        // Catch errors and return appropriate error message
        console.error("Authentication error:", err);
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

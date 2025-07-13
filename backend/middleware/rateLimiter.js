import ratelimit from "../config/upstash.js";

const ratelimiter = async(req, res, next) => {
    try {
        const {success} = await ratelimit.limit("my-rate-limit");

        if (!success) {
            return res.status(429).json({
                message: "Request limit reached. Try again in a little while."
            })
        }

        next();
    } catch (error) {
        console.log("Rate limit error", error);
        next(error);
    }
};

export default ratelimiter
import jwt from "jsonwebtoken";

const Auth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      Email: decoded.Email,
    };

    console.log("Token issued:", new Date(decoded.iat * 1000));
console.log("Token expires:", new Date(decoded.exp * 1000));
console.log("Current time:", new Date());

    next();
  } catch (error) {
    console.error("JWT error:", error.message);

    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token",
    });
  }
};

export default Auth;
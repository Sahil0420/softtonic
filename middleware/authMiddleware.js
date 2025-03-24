import jwt from "jsonwebtoken";
import Users from "../models/dbSchema/Users.js";
import Roles from "../models/dbSchema/Roles.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Unauthorized. Invalid token payload." });
    }

    // Fetch user without populate
    const user = await Users.findById(decoded._id).lean();
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Manually fetch role
    const role = await Roles.findById(user.role_id).lean();
    if (!role || !role.role_slug) {
      return res.status(403).json({ message: "Access denied. No role assigned." });
    }

    // Attach user details to request
    req.user = {
      _id: user._id,
      role: role.role_slug, // Manually assign role_slug
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

export default authenticate;

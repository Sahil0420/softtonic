import Roles from "../models/Roles.js";

export default async function (req, res, next) {
  try {
    const role = await Roles.findById(req.role_id);
    if (!role) {
      return res.status(403).json({ message: "Role don't exists" });
    }

    if (role.role_name !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
}



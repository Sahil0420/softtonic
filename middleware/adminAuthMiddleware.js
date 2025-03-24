const adminAuthMiddleware = (req, res, next) => {
  console.log("Admin Auth Middleware Triggered");
  console.log("User Role:", req.user?.role); // Log role for debugging

  if (!req.user || req.user.role !== "_admin") {
    return res.status(403).json({
      status: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};

export default adminAuthMiddleware;

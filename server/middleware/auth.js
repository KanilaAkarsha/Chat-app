import User from "../models/User";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute:", error);
    res.json({
      success: false,
      message: "Not authorized",
      error: error.message,
    });
  }
};

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  // Debug logging
  console.log("🔐 Auth Middleware Check:");
  console.log("  - Has token:", !!token);
  console.log("  - Origin:", req.headers.origin);
  console.log("  - Cookies:", Object.keys(req.cookies));

  if (!token) {
    return res.status(401).json({ 
      message: "Not authenticated",
      debug: {
        hasCookies: Object.keys(req.cookies).length > 0,
        origin: req.headers.origin
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ success: true, admin: { username } });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Verify token (frontend page refresh pe call karta hai)
const verifyToken = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// Logout — cookie clear karo
const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ success: true, message: "Logged out successfully." });
};

module.exports = { login, verifyToken, logout };
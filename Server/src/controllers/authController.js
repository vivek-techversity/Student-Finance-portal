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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 8 * 60 * 60 * 1000, // 7 * 24 * 60 * 60 * 1000 tha
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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.json({ success: true, message: "Logged out successfully." });
};

module.exports = { login, verifyToken, logout };

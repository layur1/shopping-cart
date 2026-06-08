const express = require("express");
const router  = express.Router();
const { register, login, getMe, adminLogin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login",    login);
router.post("/admin/login", adminLogin);
router.get ("/me",       protect, getMe);   // protected — needs token

module.exports = router;
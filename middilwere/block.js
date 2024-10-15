const User= require("../model/user");

const blockCheck = async (req, res, next) => {
  const email = req.session.user;
  const user = await User.findOne({ email: email });
  if (user && user.blocked === true) {
    return res.render("user/login", {
      message: "You are blocked",
    });
  } else {
    next();
  }
};

module.exports = { blockCheck };

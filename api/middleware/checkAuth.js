const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    //for checking Auth (i.e. He is loggedin  or Not? for Adding Course)
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    const verify = jwt.verify(token, "SikshyanNet98765");
    // console.log(verify);
    req.user = verify;
    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Invalid Token !",
    });
  }
};

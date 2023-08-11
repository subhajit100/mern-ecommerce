const passport = require("passport");

exports.isAuth = (req, res, done) => {
  return passport.authenticate("jwt");
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  // TODO:- this is temporary and remove this when all testing done
//   token =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZDViYzk3ZDEzZjc2OTUwNzM4MTI2MyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkxNzI5MDQ3fQ.JIgJUuzAPhD0h6TaKe2MXYJeRH75ghGcuaBFWsV_0Oo";
  return token;
};

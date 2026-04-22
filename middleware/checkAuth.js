function isAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/?error=You must be logged in to do that');
}

function isMember(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'MEMBER' || req.user.role === 'ADMIN')) return next();
  res.redirect('/?error=You must be a member to do that');
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'ADMIN') return next();
  res.redirect('/?error=You must be an admin to do that');
}

module.exports = {
  isAuth,
  isMember,
  isAdmin
};
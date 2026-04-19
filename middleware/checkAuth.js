function isAuth(req, res, next){
    if(req.isAuthenticated()) {
        next()
    } else {
        res.status(401).json({ msg: 'You are not authorized to be here' })
    }
};

function isMember(req, res, next){
    if(req.isAuthenticated() && req.user.member) {
        next()
    } else {
        res.status(401).json({ msg: 'You are not authorized to be here, not member' })
    }
};

function isAdmin(req, res, next){
    if(req.isAuthenticated() && req.user.admin) {
        next()
    } else {
        res.status(401).json({ msg: 'You are not authorized to be here, not admin' })
    }
};

module.exports = {
    isAuth,
    isMember,
    isAdmin
};
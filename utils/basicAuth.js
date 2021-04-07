const jwt = require('jwt-simple');

const config = require('../app');

function authUser(req, res, next) {
    if (req.user == null) {
        res.status(403)
        return res.send('Necesitas iniciar sesión')
    }

    next()
}


function authRole(role) {
    return (req, res, next) => {
        if (res.user.role !== role) {
            res.status(401)
            return res.send("No estas autorizado")
        }

        next()
    }
}



module.exports = {
    authUser,
    authRole
}
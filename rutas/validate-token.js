const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const Equipo = require('../models/equipo');
const Convocatoria = require('../models/convocatoria');
let TOKEN_SECRET = 'secreto';
// middleware to validate token (rutas protegidas)
let validaToken = (token) => {
    try {
        let resultado = jwt.verify(token, TOKEN_SECRET);
        return resultado;
    } catch (error) {}
};



let protegerRuta = role => {
    return (req, res, next) => {
        let token = req.headers['authorization'];
        if (token) {

            token = token.substring(7);
            let resultado = validaToken(token);

            if (resultado && (role === "" || role === resultado.role)) {
                next();
            } else res.send({ ok: false, error: "Usuario no autorizado" });
        } else res.send({ ok: false, error: "Usuario no autorizado" });
    }
};





module.exports = { protegerRuta: protegerRuta };
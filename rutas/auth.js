const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

let router = express.Router();
const validates = require('./validate-token');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const Convocatoria = require('../models/equipo');
const Joi = require('@hapi/joi');
const Equipo = require('../models/equipo');
let TOKEN_SECRET = 'secreto';
router.use(express.json());
const cors = require('cors');
const { string } = require('@hapi/joi');
//-- REGISTRO --
router.post('/registro', async(req, res) => {

    const password = await codifyPassword(req.body.password);

    if (req.body.avatar != '') {
        let avatar = req.body.avatar;
        let base64Image = avatar.split(';base64,').pop();
        let rutaImagen = 'avatar' + Date.now() + '.png';

        let newUser = new Usuario({
            email: req.body.email,
            name: req.body.name,
            avatar: avatar,
            password: password,
            role: req.body.role,
            equipo: req.body.equipo
        });

        fs.writeFile('public/uploads/avatar/' + rutaImagen, base64Image, { encoding: 'base64' }, (error) => {
            newUser.avatar = rutaImagen;
            newUser.save().then(x => {

                console.log(newUser.avatar);
                res.status(200).send({
                    ok: true,
                    resultado: x
                })
            }).catch(err => {
                res.status(400).send({
                    ok: false,
                    error: "Error insertando el Convocatoria: " + err
                });
            });

        });
    } else {
        newUser.save().then(x => {

            res.status(200).send({
                ok: true,
                resultado: x
            })
        }).catch(err => {
            res.status(400).send({
                ok: false,
                error: "Error insertando el Convocatoria: " + err
            });
        });

    }

})


async function codifyPassword(passwordBody) {

    const saltos = await bcrypt.genSalt(10);
    let password;
    return password = await bcrypt.hash(passwordBody, saltos);

}

//-- lOGIN// Método para generar el token tras login correcto
let generarToken = (login, id, role) => {

    return jwt.sign({ login: login, id: id, role: role },
        TOKEN_SECRET, { expiresIn: 86400 });
};



router.post('/login', async(req, res) => {
        // login/*
        const usuario = await Usuario.findOne({ email: req.body.email });

        const passValida = await bcrypt.compare(req.body.password, usuario.password);
        if (!passValida) return res.status(400).json({ error: 'contraseña no válida' })

        if (usuario && passValida) {
            res.send({ ok: true, token: generarToken(usuario.email, usuario.id, usuario.role) });
        } else {
            res.send({ ok: false });
        }

    })
    //USUARIO CON EQUIPO
router.get('/usuario', validates.protegerRuta(''), (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/avatar/';
    console.log(BaseUrl);
    let token = req.headers['authorization'];
    token = token.substring(7);
    console.log(token);
    let decode = jwt.decode(token, TOKEN_SECRET);
    console.log(decode);

    Usuario.findById(decode.id).populate('equipo')
        .then(resultado => {
            if (resultado) {
                resultado.avatar = BaseUrl + resultado.avatar;
                res.status(200)
                    .send({ ok: true, usuario: resultado, email: resultado.email });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Usuario no encontrado"
                });
            }

        }).catch(err => {
            console.log('ha fallado /me');
            res.status(500).send({
                ok: false,
                error: err
            });
        });

});

router.get('/me', validates.protegerRuta(''), (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/avatar/';
    console.log(BaseUrl);
    let token = req.headers['authorization'];
    token = token.substring(7);
    console.log(token);
    let decode = jwt.decode(token, TOKEN_SECRET);
    console.log(decode);

    Usuario.findById(decode.id)
        .then(resultado => {
            if (resultado) {
                resultado.avatar = BaseUrl + resultado.avatar;
                res.status(200)
                    .send({ ok: true, usuario: resultado, email: resultado.email });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Usuario no encontrado"
                });
            }

        }).catch(err => {
            console.log('ha fallado /me');
            res.status(500).send({
                ok: false,
                error: err
            });
        });

});

//VER UN USUARIO
router.get('/:id', validates.protegerRuta(''), (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/avatar/';
    console.log(BaseUrl);
    Usuario.findById(req.params['id'])
        .then(resultado => {
            if (resultado) {
                resultado.avatar = BaseUrl + resultado.avatar;
                res.status(200)
                    .send({ ok: true, usuario: resultado });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Usuario no encontrado"
                });
            }

        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });
});
// VER USUARIO DE UN EQUIPO
router.get('/equipo/:idEquipo', (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/avatar/';
    console.log(BaseUrl);
    console.log(req.params['idEquipo']);
    Usuario.find({ equipo: req.params['idEquipo'] }).then(x => {
        if (x.length > 0) {

            x.forEach(el => {
                el.avatar = BaseUrl + el.avatar;

            });
            res.send({ ok: true, usuarios: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontro el equipo" })
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            ok: false,
            error: err
        });
    });


});

// VER USUARIOS
router.get('/', (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/avatar/';
    console.log(BaseUrl);
    Usuario.find().populate('equipo').then(x => {
        if (x.length > 0) {
            x.forEach(el => {
                el.avatar = BaseUrl + el.avatar;
            });
            res.send({ ok: true, usuarios: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontro el equipo" })
        }
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: err
        });
    });


});



//MODIFICAR USUARIO (NAME / EMAIL)
router.put('/edit-profile/:id', validates.protegerRuta(''), (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: userBD
        });
    });
});

//MODIFICAR USUARIO (PASSWORD)
router.post('/edit-password/:id', validates.protegerRuta(''), async(req, res) => {
    let id = req.params.id;
    let passEncriptada = await codifyPassword(req.body.password);

    Usuario.findByIdAndUpdate(req.params.id, { $set: { password: passEncriptada } }, { new: true }, (err, userBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: userBD
        });
    });
});

//MODIFICAR USUARIO (AVATAR)
router.post('/edit-avatar/:id', validates.protegerRuta(''), (req, res) => {
    let id = req.params.id;
    if (req.body.avatar != '') {
        let avatar = req.body.avatar;
        let base64Image = avatar.split(';base64,').pop();
        let rutaImagen = 'avatar' + Date.now() + '.jpeg';
        fs.writeFile('public/uploads/avatar/' + rutaImagen, base64Image, { encoding: 'base64' }, (error) => {
            Usuario.findByIdAndUpdate(id, { $set: { avatar: rutaImagen } }, { new: true }, (err, userBD) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    usuario: userBD
                });
            });

        });

    }

});

//MODIFICAR USUARIO (NAME / EMAIL / ROLE / EQUIPO)
router.put('/edit-profile-admin/:id', validates.protegerRuta('admin'), (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'role', 'equipo']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: userBD
        });
    });
});


module.exports = router;
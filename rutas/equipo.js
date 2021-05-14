const express = require('express');
const Usuario = require('../models/usuario');
const { isAdmin } = require('./validate-token');

const Equipo = require(__dirname + '/../models/equipo');
const Convocatoria = require(__dirname + '/../models/convocatoria');
const validates = require('./validate-token');
let router = express.Router();

router.use(express.json());

//VER EQUIPOS CON SUS USUARIOS
router.get('/', (req, res) => {

    Equipo.find().populate('miembros').then(x => {
        if (x.length > 0) {
            res.send({ ok: true, resultado: x });
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

//Buscar EQUIPO POR ID
router.get('/:id', (req, res) => {

    Equipo.findById(req.params['id']).populate('miembros')
        .then(resultado => {
            if (resultado) {
                res.status(200)
                    .send({ ok: true, equipo: resultado });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Equipo no encontrado"
                });
            }

        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });

});

//Borrar
router.delete('/:idEquipo', validates.protegerRuta('admin'), (req, res) => {
    Equipo.findByIdAndRemove(req.params['idEquipo']).then(result => {
        res.status(200)
            .send({ ok: true, resultado: result });
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: "Error eliminando el equipo: " + err
        });
    })

});

//AÑADIR UN EQUIPO
router.post('/', validates.protegerRuta('admin'), (req, res) => {
    let newEquipo = new Equipo({
        nombre: req.body.nombre
    });

    newEquipo.save().then(x => {
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

///AÑADIR Usuario A EQUIPO
router.post('/:idEquipo/:idUsuario', (req, res) => {
    Equipo.findByIdAndUpdate(req.params['idEquipo'], {
        $push: {
            'miembros': { '_id': req.params['idUsuario'] }
        }
    }, {
        new: true
    }).then(x => {
        if (x) {
            res.status(200).send({
                ok: true,
                resultado: x
            })
        } else {
            res.status(401).send({
                ok: false,
                error: 'Error al inserar este Usuario en el Equipo'
            })
        }
    }).catch(err => {
        res.status(401).send({
            ok: false,
            error: 'Error al inserar este Usuario en el Equipo' + err
        })
    })

})


///BORRAR USUARIO DE EQUIPO
router.delete('/:idEquipo/:idUsuario', validates.protegerRuta('entrenador'), (req, res) => {
    Equipo.findByIdAndUpdate(req.params['idEquipo'], {
        $pull: {
            'miembros': req.params['idUsuario']
        }
    }, {
        new: true
    }).then(x => {
        if (x) {
            res.status(200).send({
                ok: true,
                resultado: x
            })
        } else {
            res.status(401).send({
                ok: false,
                error: 'Error al inserar este Usuario en el Equipo'
            })
        }
    }).catch(err => {
        res.status(401).send({
            ok: false,
            error: 'Error al inserar este Usuario en el Equipo' + err
        })
    })
})

module.exports = router;
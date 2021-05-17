const express = require('express');
const validates = require('./validate-token');

const fs = require('fs');
const Convocatoria = require(__dirname + '/../models/convocatoria');
const Calendario = require(__dirname + '/../models/calendario');
const Usuario = require(__dirname + '/../models/usuario');
const Equipo = require(__dirname + '/../models/equipo');
let router = express.Router();

var FileReader = require('filereader'),
    fileReader = new FileReader();
const multer = require('multer');
const { base } = require('../models/usuario');
const basicAuth = require('../utils/basicAuth');
router.use(express.json());

//VER CALENDARIOS
router.get('/', (req, res) => {

    Calendario.find().populate('convocatorias').then(x => {
        if (x.length > 0) {
            res.send({ ok: true, calendarios: x });
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

//VER CALENDARIO ACTIVO 
router.get('/activo', (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/';


    Calendario.find({ estado: 'true' }).populate('convocatorias').then(x => {
        if (x.length > 0) {
            const calen = x[0];
            calen.convocatorias.forEach(el => {
                el.imagen = BaseUrl + el.imagen;
            });
            res.send({ ok: true, calendario: calen });
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

//VER Convocatorias CALENDARIO
router.get('/convocatorias', (req, res) => {

    Calendario.findBy({ estado: 'true' }).populate('convocatorias').then(x => {
        if (x.length > 0) {
            res.send({ ok: true, calendario: x });
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


//VER CALENDARIO
router.get('/:id', (req, res) => {
    Calendario.findById(req.params['id']).populate('convocatorias')
        .then(resultado => {
            if (resultado) {
                res.status(200)
                    .send({ ok: true, calendario: resultado });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Producto no encontrado"
                });
            }

        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });
});
//AÑADIR CALENDARIO
router.post('/', validates.protegerRuta('admin'), (req, res) => {
    let newCalendario = new Calendario({
        nombre: req.body.nombre,
        estado: 'true'
    });

    newCalendario.save().then(x => {
        res.status(200).send({
            ok: true,
            resultado: x
        })
    }).catch(err => {
        res.status(400).send({
            ok: false,
            error: "Error insertando el Calendario: " + err
        });
    });
})

//MODIFICAR CALENDARIO
router.put('/:id', validates.protegerRuta('admin'), (req, res) => {
    Calendario.updateOne({ _id: req.params.id }, {
        $set: req.body
    }, {
        new: true
    }).then(x => {
        if (x) {
            res.status(200).send({
                ok: true,
                resultado: x
            })
        } else {
            res.status(400).send({
                ok: false,
                resultado: "Error modificando el calendario"
            })
        }

    }).catch(err => {
        res.status(500).send({
            ok: false,
            resultado: "Error modificando el Calendario " + err
        })
    })
});

//AÑADIR CONVOCATORIA DESDE ARCHIVO //SEGUIR
router.put('/archivo/:id', validates.protegerRuta('admin'), (req, res) => {
    try {
        let archivo = fs.readFileSync(req.body.name, 'utf-8');
        console.log(archivo);
    } catch (err) {
        console.error(err)
    }

})
module.exports = router;
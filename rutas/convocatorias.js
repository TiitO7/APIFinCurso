const express = require('express');
const validates = require('./validate-token');

const fs = require('fs');
const Convocatoria = require(__dirname + '/../models/convocatoria');
const Calendario = require(__dirname + '/../models/calendario');
const Usuario = require(__dirname + '/../models/usuario');
const Equipo = require(__dirname + '/../models/equipo');
let router = express.Router();

const multer = require('multer');
const { base } = require('../models/usuario');

const basicAuth = require('../utils/basicAuth');
router.use(express.json());

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join('public/uploads'))
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage })


//VER CONVOCATORIAS
router.get('/', (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/';
    console.log(BaseUrl);
    Convocatoria.find().populate('jugadores')
        .then(x => {
            if (x.length > 0) {
                x.forEach(el => {
                    el.imagen = BaseUrl + el.imagen;

                });
                res.send({ ok: true, resultado: x });
            } else {
                res.status(500).send({ ok: false, error: "No se encontraron convocatorias" })
            }
        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });
});

//VER CONVOCATORIAS con equipo
router.get('/equipo/saber', (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/';
    console.log(BaseUrl);
    Convocatoria.find().populate('equipo')
        .then(x => {
            if (x.length > 0) {
                x.forEach(el => {
                    el.imagen = BaseUrl + el.imagen;

                });
                res.send({ ok: true, resultado: x });
            } else {
                res.status(500).send({ ok: false, error: "No se encontraron convocatorias" })
            }
        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });
});

//VER CONVOCATORIAS DE UN EQUIPO

router.get('/equipo/:idEquipo', validates.protegerRuta(''), (req, res) => {
    let resultado = [];
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/';
    console.log(BaseUrl);
    Convocatoria.find({ equipo: req.params['idEquipo'] }).populate('jugadores').then(x => {

        if (x.length > 0) {
            x.forEach(el => {
                el.imagen = BaseUrl + el.imagen;

            });
            res.send({ ok: true, resultado: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontraron convocatorias" })
        }
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: err
        });
    });
});

//VER PARTIDOS DE UN EQUIPO

router.get('/equipo/:idEquipo/partidos', validates.protegerRuta(''), (req, res) => {
    let resultado = [];
    Convocatoria.find({ equipo: req.params['idEquipo'], itpo: 'partido' }).then(x => {
        if (x.length > 0) {
            res.send({ ok: true, resultado: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontraron partidos" })
        }
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: err
        });
    });
});

//VER ENTRENAMIENTOS DE UN EQUIPO

router.get('/equipo/:idEquipo/entrenamientos', validates.protegerRuta(''), (req, res) => {
    let resultado = [];
    Convocatoria.find({ equipo: req.params['idEquipo'], tipo: 'entrenamiento' }).then(x => {
        if (x.length > 0) {
            res.send({ ok: true, resultado: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontraron partidos" })
        }
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: err
        });
    });
});

//VER UNA CONVOCATORIA
router.get('/:id', validates.protegerRuta(''), (req, res) => {
    const BaseUrl = 'http://' + req.headers.host + '/public/uploads/';

    Convocatoria.findById(req.params['id']).populate('jugadores')
        .then(resultado => {
            if (resultado) {
                resultado.imagen = BaseUrl + resultado.imagen
                res.status(200)
                    .send({ ok: true, convocatoria: resultado });
            } else {
                res.status(400).send({
                    ok: false,
                    error: "Convocatoria no encontrada"
                });
            }

        }).catch(err => {
            res.status(500).send({
                ok: false,
                error: err
            });
        });
});

//AÑADIR CONVOCATORIA + AÑADIR A CALENDARIO
router.post('/', validates.protegerRuta('entrenador'), async(req, res) => {


    if (req.body.imagen != '') {
        let imagen = req.body.imagen;
        let base64Image = imagen.split(';base64,').pop();
        let rutaImagen = 'imagen' + Date.now() + '.png';

        // const imagenUrl = await basicAuth.saveImage('convocatorias', req.body.imagen);


        let newConvocatoria = new Convocatoria({
            nombre: req.body.nombre,
            tipo: req.body.tipo,
            descripcion: req.body.descripcion,
            imagen: rutaImagen,
            fecha: req.body.fecha,
            equipo: req.body.equipo,
            calendario: req.body.calendario
        });

        //CALENDARIO
        await Calendario.findByIdAndUpdate(newConvocatoria.calendario, {
            $push: {
                convocatorias: newConvocatoria._id
            }
        }, {
            new: true
        })


        fs.writeFile('public/uploads/' + rutaImagen, base64Image, { encoding: 'base64' }, (error) => {
            newConvocatoria.save().then(x => {
                //newConvocatoria.imagen = rutaImagen;
                res.status(200).send({
                    ok: true,
                    convocatoria: x
                })
            }).catch(err => {
                res.status(400).send({
                    ok: false,
                    error: "Error insertando el Convocatoria: " + err
                });
            });

        });
    } else {
        newConvocatoria.save().then(x => {

            res.status(200).send({
                ok: true,
                resultado: x
            })
        }).catch(err => {
            res.status(400).send({
                ok: false,
                error: "Error insertando la Convocatoria: " + err
            });
        });


    }

});

//MODIFICAR FOTO DE LA CONVOCATORIA

router.post('/imagen/:id', validates.protegerRuta('entrenador'), (req, res) => {
    if (req.body.imagen != '') {
        let imagen = req.body.imagen;
        let base64Image = imagen.split(';base64,').pop();
        let rutaImagen = 'imagen' + Date.now() + '.png';

        fs.writeFile('public/uploads/' + rutaImagen, base64Image, { encoding: 'base64' }, (error) => {
            let convocatoria = Convocatoria.updateOne({ _id: req.params.id })

            console.log(convocatoria._id);
            convocatoria.imagen = rutaImagen;

            Convocatoria.updateOne({ _id: req.params.id }, {
                $set: {
                    imagen: convocatoria.imagen
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
                    res.status(400).send({
                        ok: false,
                        resultado: "Error modificando la convocatoria"
                    })
                }
            }).catch(err => {
                res.status(500).send({
                    ok: false,
                    resultado: "Error modificando la Convocatoria " + err
                })
            })


        });
    }

})

//MODIFICAR CONVOCATORIA
router.put('/:id', validates.protegerRuta('entrenador'), (req, res) => {
    Convocatoria.updateOne({ _id: req.params.id }, {
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
                resultado: "Error modificando la convocatoria"
            })
        }

    }).catch(err => {
        res.status(500).send({
            ok: false,
            resultado: "Error modificando el Convocatoria " + err
        })
    })
});

///APUNTAR JUGADOR A CONVOCATORIA
router.post('/usuario/:idConvocatoria/:idUsuario', validates.protegerRuta('jugador'), async(req, res) => {

    Convocatoria.findByIdAndUpdate(req.params['idConvocatoria'], {
        $push: {
            'jugadores': { _id: req.params['idUsuario'] }
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
                error: 'Error al inserar este Usuario en la Convocatoria'
            })
        }
    }).catch(err => {
        res.status(401).send({
            ok: false,
            error: 'Error al inserar este Usuario en la Convocatoria' + err
        })
    })

})

///DESAPUNTAR USUARIO DE CONVOCATORIA
router.delete('/usuario/:idConvocatoria/:idUsuario', validates.protegerRuta('jugador'), (req, res) => {
    Convocatoria.findByIdAndUpdate(req.params['idConvocatoria'], {
        $pull: {
            'jugadores': req.params['idUsuario']
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
                error: 'Error al borrar este Usuario de la Convocatoria'
            })
        }
    }).catch(err => {
        res.status(401).send({
            ok: false,
            error: 'Error al borrar este Usuario en la Convocatoria' + err
        })
    })
})

//BORRAR CONVOCATORIA + BORRAR CONVOCATORIA CALENDARIO
router.delete('/:id', validates.protegerRuta('entrenador'), (req, res) => {
    let convocatoria;
    Convocatoria.findById(req.params.id).then(x => {
        if (x) {
            Calendario.findByIdAndUpdate(x.calendario, {
                $pull: {
                    'convocatorias': x._id
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
                        error: 'Error al borrar esta Convocatoria en el Calendario'
                    })
                }
            }).catch(err => {
                res.status(401).send({
                    ok: false,
                    error: 'Error al borrar esta Convocatoria en el Calendario' + err
                })
            })
        }
    })



    Convocatoria.findByIdAndRemove(req.params['id']).then(result => {
        res.status(200)
            .send({ ok: true, resultado: result });
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: "Error eliminando la convocatoria: " + err
        });
    })
});




module.exports = router;
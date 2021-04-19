// Librerías
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const session = require('express-session');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
//Enrutadores
const convocatorias = require(__dirname + '/rutas/convocatorias');
const usuarios = require(__dirname + '/rutas/auth');
const equipos = require(__dirname + '/rutas/equipo');
const calendario = require(__dirname + '/rutas/calendario');
let TOKEN_SECRET = 'secreto';
const app = express();




// Conexión con la BD
mongoose.connect('mongodb://localhost:27017/ManagerClub', {
    useNewUrlParser: true,
    useUnifiedTopology: true

});

app.set('port', process.env.PORT || 3000);

mongoose.set('useFindAndModify', false);
// Carga de middleware y enrutadores
app.use(express.json());
app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use(express.static(__dirname + '/public/uploads'));
app.get('/', convocatorias)
app.use('/convocatorias', convocatorias)
app.use('/auth', usuarios)
app.use('/equipos', equipos)
app.use('/calendario', calendario)


// Puesta en marcha del servidor
app.listen(app.get('port'), () =>
    console.log('Servidor en marcha')
);
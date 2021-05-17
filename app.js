// Librerías
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
//Enrutadores
const convocatorias = require(__dirname + '/rutas/convocatorias');
const usuarios = require(__dirname + '/rutas/auth');
const equipos = require(__dirname + '/rutas/equipo');
const calendario = require(__dirname + '/rutas/calendario');
const session = require('express-session');

const cors = require('cors');
let TOKEN_SECRET = 'secreto';
const app = express();


app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb' }));



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

app.use('/public', express.static(__dirname + '/public'));
app.get('/', cors(), convocatorias)
app.use('/convocatorias', cors(), convocatorias)
app.use('/auth', cors(), usuarios)
app.use('/equipos', cors(), equipos)
app.use('/calendario', cors(), calendario)


//app.use(cors());
// Puesta en marcha del servidor
app.listen(app.get('port'), () =>
    console.log('Servidor en marcha...')
);
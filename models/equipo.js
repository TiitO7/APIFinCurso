const mongoose = require('mongoose');
const { UsurioSchema } = require('./usuario');


let EquipoSchema = new mongoose.Schema({
    nombre: String,
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' }],
    //entrenadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' }],

});

let Equipo = mongoose.model('equipo', EquipoSchema);



module.exports = Equipo
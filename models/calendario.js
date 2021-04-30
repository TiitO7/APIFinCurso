const mongoose = require('mongoose');

let CalendarioSchema = new mongoose.Schema({
    nombre: String,
    convocatorias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'convocatoria' }],
    estado: Boolean,
});

let Calendario = mongoose.model('calendario', CalendarioSchema);

module.exports = Calendario;
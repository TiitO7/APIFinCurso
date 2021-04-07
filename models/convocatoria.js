const mongoose = require('mongoose');



let ConvocatoriaSchema = new mongoose.Schema({
    nombre: String,
    tipo: String,
    descripcion: String,
    imagen: String,
    fecha: Date,
    jugadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usuario' }],
    equipo: { type: mongoose.Schema.Types.ObjectId, ref: 'equipo' },
    calendario: { type: mongoose.Schema.Types.ObjectId, ref: 'calendario' },
});


let Convocatoria = mongoose.model('convocatoria', ConvocatoriaSchema);


module.exports = Convocatoria;
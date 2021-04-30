const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true,
        lowercase: true
    },
    name: {
        required: true,
        type: String,
        lowercase: true
    },
    avatar: String,
    token: String,
    role: {
        type: String,
        default: 'jugador',
        enum: ['jugador', 'entrenador', 'admin']
    },
    password: { type: String, required: true },
    signUpDate: {
        type: Date,
        default: Date.now()
    },
    equipo: { type: mongoose.Schema.Types.ObjectId, ref: 'equipo' }


})


let Usuario = mongoose.model('usuario', UsuarioSchema);



module.exports = Usuario
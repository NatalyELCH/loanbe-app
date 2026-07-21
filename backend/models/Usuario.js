const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({

  nombre: {
    type: String,
    required: true,
    trim: true,
  },

  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  rol: {
    type: String,
    default: "cliente",
  },

  saldo: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model("Usuario", usuarioSchema);
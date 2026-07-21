const mongoose = require("mongoose");

const transaccionSchema = new mongoose.Schema({

  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },

  tipo: String,
  categoria: String,
  monto: Number,

  fecha: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Transaccion", transaccionSchema);
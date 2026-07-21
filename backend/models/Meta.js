const { Schema, model } = require("mongoose");

const metaSchema = new Schema(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    montoObjetivo: {
      type: Number,
      required: true,
    },
    montoAhorrado: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model("Meta", metaSchema);
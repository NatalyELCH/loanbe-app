const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const Usuario = require("./models/Usuario");
const Transaccion = require("./models/Transaccion");
const Meta = require("./models/Meta");
const app = express();

app.use(cors());
app.use(express.json());

/* =========================================
   SOCKET SERVER
========================================= */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

/* =========================================
   MONGODB
========================================= */

mongoose
  .connect("mongodb://127.0.0.1:27017/bank_system")
  .then(() => console.log("MongoDB conectado"))
  .catch((error) => console.log(error));

/* =========================================
   HOME
========================================= */

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

/* =========================================
   REGISTRO
========================================= */

app.post("/registro", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    // 🔥 Validación estricta de la contraseña en el servidor
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regexPassword.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial.",
      });
    }

    // 🔥 verificar si existe
    const existe = await Usuario.findOne({
      correo: correo.toLowerCase()
    });

    if (existe) {
      return res.status(400).json({
        message: "El correo ya existe",
      });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      correo: correo.toLowerCase(),
      password,
      saldo: 0,
    });

    await nuevoUsuario.save();

    res.json({
      message: "Usuario registrado",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error en registro",
    });
  }
});
/* =========================================
   LOGIN
========================================= */

app.post("/login", async (req, res) => {
  try {

    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({
      correo: correo.toLowerCase(),
      password,
    });

    if (!usuario) {
      return res.status(401).json({
        message: "Usuario incorrecto",
      });
    }

    res.json({
      message: "Login correcto",

      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        saldo: usuario.saldo,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error login",
    });

  }
});

/* =========================================
   CREAR TRANSACCIÓN
========================================= */

app.post("/transacciones", async (req, res) => {

  try {

    const {
      usuario_id,
      tipo,
      categoria,
      monto,
    } = req.body;

    // 🔥 validar usuario
    const usuario = await Usuario.findById(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // 🔥 guardar transacción
    const nuevaTransaccion = new Transaccion({
      usuario_id,
      tipo,
      categoria,
      monto,
    });

    await nuevaTransaccion.save();

    // 🔥 ACTUALIZAR SALDO
    if (tipo === "ingreso") {
      usuario.saldo += Number(monto);
    }

    if (tipo === "gasto") {
      usuario.saldo -= Number(monto);
    }

    if (tipo === "ahorro") {
      usuario.saldo -= Number(monto);
    }

    if (tipo === "prestamo") {
      usuario.saldo += Number(monto);
    }

    await usuario.save();

    // 🔥 SOCKET.IO
    io.emit("nueva-transaccion", nuevaTransaccion);

    res.json({
      message: "Transacción guardada",
      saldoActual: usuario.saldo,
      data: nuevaTransaccion,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error al guardar transacción",
    });

  }
});

/* =========================================
   TODOS LOS USUARIOS
========================================= */

app.get("/usuarios", async (req, res) => {

  try {

    const usuarios = await Usuario.find();

    res.json(usuarios);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error al obtener usuarios",
    });

  }

});

/* =========================================
   TODAS LAS TRANSACCIONES
========================================= */

app.get("/transacciones", async (req, res) => {

  try {

    const transacciones = await Transaccion.find();

    res.json(transacciones);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error al obtener transacciones",
    });

  }

});

/* =========================================
   TRANSACCIONES POR USUARIO
========================================= */

app.get("/transacciones/:usuario_id", async (req, res) => {

  try {

    const transacciones = await Transaccion.find({
      usuario_id: req.params.usuario_id,
    });

    res.json(transacciones);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error al obtener transacciones",
    });

  }

});
/* =========================================
   EDITAR TRANSACCIÓN (PUT)
========================================= */
app.put("/transacciones/:id", async (req, res) => {
  try {
    const { tipo, categoria, monto } = req.body;
    
    const transaccionEditada = await Transaccion.findByIdAndUpdate(
      req.params.id,
      { tipo, categoria, monto },
      { new: true }
    );
    
    res.json(transaccionEditada);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar transacción" });
  }
});

/* =========================================
   ELIMINAR TRANSACCIÓN (DELETE)
========================================= */
app.delete("/transacciones/:id", async (req, res) => {
  try {
    await Transaccion.findByIdAndDelete(req.params.id);
    res.json({ message: "Transacción eliminada con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar transacción" });
  }
});
/* =========================================
   CAMBIAR CONTRASEÑA
========================================= */
app.put("/usuarios/:id/password", async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const { id } = req.params;

    // Validación de seguridad de la contraseña en el servidor
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regexPassword.test(passwordNueva)) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial." 
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si la contraseña actual coincide
    if (usuario.password !== passwordActual) {
      return res.status(401).json({ message: "La contraseña actual es incorrecta" });
    }

    // Actualizar con la nueva contraseña
    usuario.password = passwordNueva;
    await usuario.save();

    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
});
/* =========================================
   METAS DE AHORRO
========================================= */

// Obtener metas por usuario_id
app.get("/metas/:usuario_id", async (req, res) => {
  try {
    const metas = await Meta.find({ usuario_id: req.params.usuario_id });
    res.json(metas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las metas" });
  }
});

// Crear una nueva meta
app.post("/metas", async (req, res) => {
  try {
    const { usuario_id, titulo, montoObjetivo, montoAhorrado } = req.body;
    
    const nuevaMeta = new Meta({
      usuario_id,
      titulo,
      montoObjetivo,
      montoAhorrado: montoAhorrado || 0,
    });

    const metaGuardada = await nuevaMeta.save();
    res.status(201).json(metaGuardada);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear la meta" });
  }
});

// Actualizar / Abonar meta (PUT)
app.put("/metas/:id", async (req, res) => {
  try {
    const { montoAhorrado } = req.body;
    
    const metaActualizada = await Meta.findByIdAndUpdate(
      req.params.id,
      { montoAhorrado },
      { new: true }
    );

    res.json(metaActualizada);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar la meta" });
  }
});

// Eliminar meta (DELETE)
app.delete("/metas/:id", async (req, res) => {
  try {
    await Meta.findByIdAndDelete(req.params.id);
    res.json({ message: "Meta eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar la meta" });
  }
});
/* =========================================
   SERVER
========================================= */

server.listen(3000, "0.0.0.0", () => {
  console.log("Servidor con Socket.io en puerto 3000");
});
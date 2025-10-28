const express = require('express');
const mongoose = require('mongoose');
const productosRouter = require('./proyectos');
const http = require('http'); // 1. Importar http de Node
const { Server } = require("socket.io"); // 2. Importar Server de socket.io

const app = express();
const server = http.createServer(app); // 3. Crear servidor http usando app
const io = new Server(server, { // 4. Inicializar Socket.io sobre el servidor http
    cors: {
        origin: "*", // Permitir todas las conexiones (para pruebas)
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(express.json());

// 5. Middleware para pasar 'io' a todas las rutas
// Así, 'proyectos.js' puede acceder a 'req.io'
app.use((req, res, next) => {
    req.io = io;
    next();
});

const mongoURI ="mongodb+srv://proyecto:1234@clusterproyecto.nehinbj.mongodb.net/?appName=ClusterProyecto";

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión', err));

app.use('/api/proyectos', productosRouter);

// 6. Lógica de conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado a Socket.io');

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

const PORT = 3000;
// 7. Usar 'server.listen' en lugar de 'app.listen'
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

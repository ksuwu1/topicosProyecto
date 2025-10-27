const express = require('express');
const mongoose = require('mongoose');
const productosRouter = require('./proyectos');

const app = express();

app.use(express.json());

const mongoURI ="mongodb+srv://proyecto:1234@clusterproyecto.nehinbj.mongodb.net/?appName=ClusterProyecto";

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión', err));

app.use('/api/proyectos', productosRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
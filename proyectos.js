const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ==== Esquema del Proyecto ====
const proyectoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date },
    status: {
        type: String,
        enum: ["Pendiente", "En Progreso", "Completado"],
        default: "Pendiente"
    },
    tasks: [
        {
            taskName: { type: String, required: true },
            completed: { type: Boolean, default: false }
        }
    ]
});

const Proyecto = mongoose.model('Proyecto', proyectoSchema);

// ==== RUTAS ====

/** Crear nuevo proyecto */
router.post('/', async (req, res) => {
    try {
        const nuevoProyecto = new Proyecto(req.body);
        const proyectoGuardado = await nuevoProyecto.save();
        
        // --- Evento Socket.io ---
        // req.io viene del middleware en index.js
        req.io.emit('proyecto:creado', proyectoGuardado);
        // --- Fin Evento ---

        res.status(201).json(proyectoGuardado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** Obtener todos los proyectos */
router.get('/', async (req, res) => {
// ... (sin cambios)
    try {
        const proyectos = await Proyecto.find();
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Buscar proyectos por título */
router.get('/buscar', async (req, res) => {
// ... (sin cambios)
    try {
        const { titulo } = req.query;
        const filtro = {};

        if (titulo) {
            filtro.titulo = { $regex: titulo, $options: 'i' }; // búsqueda parcial y sin distinguir mayúsculas
        }

        const proyectos = await Proyecto.find(filtro);
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** Obtener un proyecto por ID */
router.get('/:id', async (req, res) => {
// ... (sin cambios)
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.findById(id);
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    } catch (error) {
        res.status(400).json({ error: 'ID inválido' });
    }
});

/** Actualizar proyecto por ID */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proyectoActualizado = await Proyecto.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!proyectoActualizado) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        // --- Evento Socket.io ---
        req.io.emit('proyecto:actualizado', proyectoActualizado);
        // --- Fin Evento ---

        res.json(proyectoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** Eliminar proyecto por ID */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proyectoEliminado = await Proyecto.findByIdAndDelete(id);
        if (!proyectoEliminado) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        // --- Evento Socket.io ---
        // Enviamos solo el ID para que el cliente sepa cuál borrar
        req.io.emit('proyecto:eliminado', { id: proyectoEliminado._id });
        // --- Fin Evento ---

        res.json({ mensaje: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

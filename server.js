require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['https://frontend-autonomia.vercel.app', 'http://localhost:8080'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB Atlas');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err);
});

// Esquema del formulario con validaciones mejoradas
const FormSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: [true, 'El nombre de la empresa es obligatorio'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'El email es obligatorio'],
    match: [/.+\@.+\..+/, 'Por favor ingrese un email válido'],
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String,
    trim: true
  },
  industry: { 
    type: String, 
    required: [true, 'La industria es obligatoria'],
    trim: true
  },
  challenges: { 
    type: String, 
    required: [true, 'Los desafíos son obligatorios'],
    trim: true
  },
  goals: { 
    type: String, 
    required: [true, 'Los objetivos son obligatorios'],
    trim: true
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  versionKey: false // Elimina el campo __v
});

const Form = mongoose.model('Form', FormSchema);

// Rutas
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

// POST: Guardar formulario con manejo de errores mejorado
app.post('/api/submit-form', async (req, res) => {
  console.log('Nueva solicitud recibida:', new Date().toISOString());
  
  try {
    const form = new Form(req.body);
    await form.save();
    
    console.log('Formulario guardado exitosamente:', form._id);
    res.status(201).json({ 
      message: 'Formulario guardado correctamente',
      formId: form._id
    });
    
  } catch (error) {
    console.error('Error al guardar el formulario:', error);
    
    // Manejo específico de errores de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor al guardar el formulario' 
    });
  }
});

// GET: Obtener formularios con paginación
app.get('/api/forms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      Form.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
      Form.countDocuments()
    ]);

    res.json({
      forms,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalForms: total
    });

  } catch (error) {
    console.error('Error al obtener formularios:', error);
    res.status(500).json({ 
      message: 'Error al obtener formularios' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'desarrollo'}`);
});
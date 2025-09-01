const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Inicializar la aplicación Express
const app = express();
const PORT = 5000;

// Middlewares
app.use(cors({
  origin: ['https://frontend-autonomia.vercel.app', 'http://localhost:8080'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://diegonavarrete2:Dn8972nV@clusternava.ductuw3.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB Atlas');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err);
});

// Esquema del formulario
const FormSchema = new mongoose.Schema({
  companyName: String,
  email: String,
  phone: String,
  industry: String,
  challenges: String,
  goals: String,
  createdAt: { type: Date, default: Date.now }
});

const Form = mongoose.model('Form', FormSchema);

// Rutas
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

// POST: Guardar formulario
app.post('/api/submit-form', async (req, res) => {
  console.log('--- Nueva solicitud recibida ---');
  
  try {
    const { companyName, email, phone, industry, challenges, goals } = req.body;

    // Validación
    if (!companyName || !email || !industry || !challenges || !goals) {
      return res.status(400).json({ message: 'Error: Faltan campos obligatorios.' });
    }

    // Crear nuevo documento en MongoDB
    const form = new Form({
      companyName,
      email,
      phone,
      industry,
      challenges,
      goals
    });

    // Guardar en la base de datos
    await form.save();
    
    console.log('Formulario guardado en MongoDB');
    res.status(200).json({ message: 'Formulario guardado correctamente' });
    
  } catch (error) {
    console.error('Error al guardar el formulario:', error);
    res.status(500).json({ message: 'Error al guardar el formulario' });
  }
});

// GET: Obtener formularios
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error al obtener formularios:', error);
    res.status(500).json({ message: 'Error al obtener formularios' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
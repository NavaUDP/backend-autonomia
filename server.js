// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Inicializar la aplicación Express
const app = express();
const PORT = 5000; // Puerto en el que se ejecutará el servidor

// --- Middlewares ---
// 1. CORS: Permite solicitudes desde otros orígenes (tu frontend de React)
app.use(cors({
  origin: ['https://frontend-autonomia.vercel.app/', 'http://localhost:8080'], // Reemplaza con la URL de tu frontend si es diferente
  methods: ['GET', 'POST'],
  credentials : true
}));

// 2. Body Parser: Permite a Express leer el cuerpo de las solicitudes POST en formato JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas (Endpoints) ---

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

// Endpoint para recibir los datos del formulario y guardarlos en un archivo txt
app.post('/api/submit-form', (req, res) => {
  console.log('--- Nueva solicitud recibida ---');
  
  // Los datos enviados desde el frontend están en req.body
  const { companyName, email, phone, industry, challenges, goals } = req.body;

  // Validación básica en el servidor
  if (!companyName || !email || !industry || !challenges || !goals) {
    return res.status(400).json({ message: 'Error: Faltan campos obligatorios.' });
  }

  // Formato de entrada para el archivo txt
  const entry = `
Empresa: ${companyName}
Email: ${email}
Teléfono: ${phone}
Industria: ${industry}
Desafíos: ${challenges}
Objetivos: ${goals}
--------------------------
`;

  const filePath = path.join(__dirname, 'formularios.txt');
  fs.appendFile(filePath, entry, (err) => {
    if (err) {
      console.error('Error al guardar el formulario:', err);
      return res.status(500).json({ message: 'Error al guardar el formulario' });
    }
    console.log('Formulario guardado en formularios.txt');
    res.status(200).json({ message: 'Formulario guardado correctamente' });
  });
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
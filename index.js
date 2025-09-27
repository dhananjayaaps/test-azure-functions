const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Demo Pet API',
      version: '1.0.0',
      description: 'A simple pet store API for APIM demo',
    },
    servers: [
      { url: `http://localhost:${port}`, description: 'Local server' },
      { url: 'https://testapimsineth-f4ejgtg7dahce6d8.canadacentral-01.azurewebsites.net', description: 'Azure deployed server' },
    ],
  },
  apis: ['./index.js'], // Point to this file for JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Sample in-memory data
let pets = [
  { id: 1, name: 'Fluffy', type: 'Cat' },
  { id: 2, name: 'Rex', type: 'Dog' },
];

// Routes

/**
 * @openapi
 * /pets:
 *   get:
 *     summary: Get all pets
 *     responses:
 *       200:
 *         description: List of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 */
app.get('/pets', (req, res) => {
  res.json(pets);
});

/**
 * @openapi
 * /pets/{id}:
 *   get:
 *     summary: Get a pet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       404:
 *         description: Pet not found
 */
app.get('/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(pet);
});

/**
 * @openapi
 * /pets:
 *   post:
 *     summary: Add a new pet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pet created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 */
app.post('/pets', (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and type required' });
  const newPet = { id: pets.length + 1, name, type };
  pets.push(newPet);
  res.status(201).json(newPet);
});

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const employeeRoutes = require('./routes/employee.routes');

const app = express();

// Enable CORS
app.use(cors());

// To support JSON-encoded bodies
app.use(express.json());

// To support URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount employee routes at /api/employees
app.use('/api/employees', employeeRoutes);

module.exports = app;

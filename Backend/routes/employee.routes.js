const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const employeeController = require('../controllers/employee.controller');

// Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: function (req, file, cb) {
//     // Create a unique filename
//     const ext = path.extname(file.originalname);
//     const filename = `${file.fieldname}-${Date.now()}${ext}`;
//     cb(null, filename);
//   }
// });

// ——— Multer Setup ———
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  }
});


const upload = multer({ storage });

// GET: fetch all employees
router.get("/view", employeeController.getAllEmployees);

router.get('/view/:id', employeeController.getEmployeeById);

router.put(
  "/update/:id",
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  employeeController.updateEmployee
);


// POST: create a new employee (with file uploads)
router.post(
  '/create',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  employeeController.createEmployee
);

// PUT: update employee by id (uncomment if needed, use upload middleware if you expect file uploads)
// router.put(
//   '/edit/:id',
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'profileImage', maxCount: 1 }
//   ]),
//   employeeController.updateEmployee
// );

// DELETE: remove employee by id
router.delete('/delete/:id', employeeController.deleteEmployee);

module.exports = router;

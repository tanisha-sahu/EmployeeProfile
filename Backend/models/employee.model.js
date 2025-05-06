// models/Employee.js
const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  skills: [{ type: String }],
  department: { type: String, required: true },
  resume: { type: String },         // store file path/name
  profileImage: { type: String },     // store file path/name
  // New field for gallery images; an array of strings.
  galleryImages: [{ type: String }],
  isActive: { type: Boolean, default: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);

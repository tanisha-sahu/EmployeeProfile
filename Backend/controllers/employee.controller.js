const Employee = require('../models/employee.model');
const mongoose = require('mongoose');

// Create Employee Profile
exports.createEmployee = async (req, res) => {
  try {
    // Parse file paths if files were uploaded
    if (req.files) {
      if (req.files.resume) {
        req.body.resume = req.files.resume[0].path;
      }
      if (req.files.profileImage) {
        req.body.profileImage = req.files.profileImage[0].path;
      }
    }

    // Create new employee document
    const newEmployee = new Employee({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      dob: req.body.dob,
      gender: req.body.gender,
      skills: req.body.skills,
      department: req.body.department,
      resume: `uploads/${req.files.resume[0].filename}`,
      profileImage:`uploads/${req.files.profileImage[0].filename}`,
      isActive: req.body.isActive,
      address: req.body.address
    });

    await newEmployee.save();
    res.status(201).json({ success: true, message: 'Profile created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee profile
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;

  // Check if it's a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ employee });
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all employee profiles
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error while fetching employees." });
  }
};

// Update employee profile (if needed)
// Update employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let { fullName, email, phone, dob, gender, department, address, skills, isActive } = req.body;

    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim());
    }

    const updateData = {
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      address,
      isActive: isActive === 'true' || isActive === true,
    };

    // If files are updated
    if (req.files?.resume?.[0]) {
      updateData.resume = `uploads/${req.files.resume[0].filename}`;
    }
    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = `uploads/${req.files.profileImage[0].filename}`;
    }   


    const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, message: "Employee updated successfully", data: updated });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: "Server error while updating employee" });
  }
};


// Delete employee profile
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

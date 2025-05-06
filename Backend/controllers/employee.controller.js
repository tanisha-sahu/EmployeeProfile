const Employee = require('../models/employee.model');
const mongoose = require('mongoose');

// Create Employee Profile
exports.createEmployee = async (req, res) => {
  try {
    // Process uploaded files and set file paths.
    if (req.files) {
      if (req.files.resume) {
        req.body.resume = `uploads/${req.files.resume[0].filename}`;
      }
      if (req.files.profileImage) {
        req.body.profileImage = `uploads/${req.files.profileImage[0].filename}`;
      }
      if (req.files.galleryImages) {
        // Map the array of files to an array of file paths.
        req.body.galleryImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
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
      resume: req.body.resume,
      profileImage: req.body.profileImage,
      galleryImages: req.body.galleryImages,  // Store array of gallery image paths.
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
// controllers/employeeController.js



exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      fullName,
      email,
      phone,
      dob,
      gender,
      department,
      address,
      skills,
      isActive,
      // incoming list of retained gallery images (string[] or CSV)
      galleryImages: retainedGalleryField
    } = req.body;

    // normalize skills
    if (typeof skills === 'string') {
      skills = skills.split(',').map(s => s.trim());
    }

    // normalize retained gallery array
    let retainedGallery = [];
    if (retainedGalleryField) {
      if (Array.isArray(retainedGalleryField)) {
        retainedGallery = retainedGalleryField;
      } else {
        retainedGallery = retainedGalleryField.split(',').map(s => s.trim());
      }
    }

    // fetch existing to compare
    const existingEmp = await Employee.findById(id);
    if (!existingEmp) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // figure out which old files to delete
    const oldGallery = existingEmp.galleryImages || [];
    const toDelete = oldGallery.filter(imgPath => !retainedGallery.includes(imgPath));
    toDelete.forEach(imgPath => {
      const fullPath = path.join(__dirname, '..', imgPath);
      fs.unlink(fullPath, err => {
        if (err) console.warn('Failed to delete image file:', fullPath, err);
      });
    });

    // new uploaded gallery images
    let newGalleryImages = [];
    if (req.files?.galleryImages?.length) {
      newGalleryImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
    }

    // build the update payload
    const updateData = {
      fullName,
      email,
      phone,
      dob,
      gender,
      department,
      address,
      skills,
      isActive: isActive === 'true' || isActive === true,
      // merge retained + newly uploaded
      galleryImages: [...retainedGallery, ...newGalleryImages]
    };

    // file fields
    if (req.files?.resume?.[0]) {
      updateData.resume = `uploads/${req.files.resume[0].filename}`;
    }
    if (req.files?.profileImage?.[0]) {
      updateData.profileImage = `uploads/${req.files.profileImage[0].filename}`;
    }

    // perform update
    const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updated
    });

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

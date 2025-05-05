// employee.service.js (Optional Service Layer)
const Employee = require('../models/employee.model');

exports.createEmployeeProfile = async (employeeData) => {
  const employee = new Employee(employeeData);
  return await employee.save();
};

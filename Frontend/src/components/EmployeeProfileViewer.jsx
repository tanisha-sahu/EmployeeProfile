import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeProfileViewer = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employees/view');
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employees.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/delete/${id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 font-medium mt-6">{error}</p>;
  }

  if (employees.length === 0) {
    return <p className="text-center text-gray-600 mt-6">No Employees Found.</p>;
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {employees.map(employee => (
        <div
          key={employee._id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition duration-200 p-6 flex flex-col items-center"
        >
          {/* Profile Image */}
          <img
            src={
              employee.profileImage
                ? `http://localhost:5000/${employee.profileImage}`
                : 'https://via.placeholder.com/150'
            }
            alt={employee.fullName}
            className="w-24 h-24 rounded-full border-2 border-gray-200 shadow-md object-cover"
          />

          {/* Status Badge */}
          <span
            className={`mt-4 inline-block px-3 py-1 text-sm font-medium rounded-full ${
              employee.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {employee.isActive ? 'Active' : 'Inactive'}
          </span>

          {/* Name & Department */}
          <h3 className="mt-2 text-xl font-semibold text-center">
            {employee.fullName}
          </h3>
          <p className="text-gray-500 text-center">{employee.department}</p>

          {/* Contact Info */}
          <div className="mt-2 text-center text-gray-600 text-sm space-y-1">
            <p>{employee.email}</p>
            <p>{employee.phone}</p>
          </div>

          {/* Skills */}
          {employee.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {employee.skills.map(skill => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Resume Link */}
          {employee.resume && (
            <a
              href={`http://localhost:5000/${employee.resume}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              View Resume
            </a>
          )}

          {/* Action Buttons */}
          <div className="mt-auto flex space-x-2 pt-4">
            <button
              onClick={() => navigate(`/edit/${employee._id}`)}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(employee._id)}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeProfileViewer;

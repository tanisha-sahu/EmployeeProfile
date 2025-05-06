import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeProfileViewer = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [modalImages, setModalImages] = useState([]);
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

  const openGallery = (images) => {
    setModalImages(images);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setModalImages([]);
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
    <>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {employees.map(emp => (
          <div
            key={emp._id}
            className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition p-6"
          >
            {/* Header */}
            <div className="flex items-center space-x-4">
              <img
                src={
                  emp.profileImage
                    ? `http://localhost:5000/${emp.profileImage}`
                    : 'https://via.placeholder.com/150'
                }
                alt={emp.fullName}
                className="w-16 h-16 rounded-full border-2 border-blue-200 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{emp.fullName}</h3>
                <p className="text-sm text-gray-500">{emp.department}</p>
              </div>
            </div>

            {/* Contact & Skills */}
            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2 text-gray-600 text-sm">
                <p><span className="font-medium">Email:</span> {emp.email}</p>
                <p><span className="font-medium">Phone:</span> {emp.phone}</p>
              </div>

              {emp.skills?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {emp.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {emp.resume && (
                <a
                  href={`http://localhost:5000/${emp.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                >
                  View Resume
                </a>
              )}

              {emp.galleryImages?.length > 0 && (
                <div
                  className="relative group cursor-pointer"
                  onClick={() => openGallery(emp.galleryImages)}
                >
                  <div className="grid grid-cols-3 gap-1 border rounded-lg overflow-hidden">
                    {emp.galleryImages.slice(0, 6).map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:5000/${img}`}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-16 object-cover"
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition">
                    <span className="text-white text-sm font-medium">View Gallery</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/edit/${emp._id}`)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(emp._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Lightbox Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modalImages.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:5000/${img}`}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeProfileViewer;

// src/components/EmployeeForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import skillsData from "../data/skills.json";
import departmentsData from "../data/departments.json";
import gendersData from "../data/genders.json";
import {
  validateEmail,
  validatePhone,
  validateFileType,
  validateFileSize,
} from "../utils/validations";
import "react-phone-input-2/lib/style.css"; // Ensure react-phone-input-2 styles are imported

const EmployeeForm = ({ isEdit = false }) => {
  const { id } = useParams(); // for edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    skills: [],
    department: "",
    resume: null,
    profileImage: null,
    // We'll store gallery images here. Each item can be:
    //  - A new File object
    //  - Or a string/URL if you're editing existing images
    galleryImages: [],
    address: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [resumeURL, setResumeURL] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing data in edit mode
  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(
            `http://localhost:5000/api/employees/view/${id}`
          );
          const emp = data.employee;

          // If the server returns already-uploaded gallery images as strings (URLs),
          // store them in form.galleryImages so they appear in the preview.
          // For example, if emp.galleryImages is an array of image paths/URLs.
          // If it's something else on your backend, adjust accordingly.
          const existingGallery = Array.isArray(emp.galleryImages)
            ? emp.galleryImages
            : [];

          setForm({
            fullName: emp.fullName || "",
            email: emp.email || "",
            // Store only the 10-digit part in state; react-phone-input-2 will prepend the dial code
            phone: emp.phone ? emp.phone.slice(-10) : "",
            dob: emp.dob?.slice(0, 10) || "", // format YYYY-MM-DD
            gender: emp.gender || "",
            skills: emp.skills || [],
            department: emp.department || "",
            resume: null, // new file only if user chooses
            profileImage: null,
            galleryImages: existingGallery,
            address: emp.address || "",
            isActive: emp.isActive,
          });
          if (emp.resume) setResumeURL(`http://localhost:5000/${emp.resume}`);
        } catch (err) {
          toast.error("Failed to load employee details");
          navigate("/");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEdit, id, navigate]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (resumeURL?.startsWith("blob:")) URL.revokeObjectURL(resumeURL);
    };
  }, [resumeURL]);

  // Validation logic
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full Name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email";

    // Ensure that phone always includes the dial code.
    const rawPhone = form.phone.replace(/\D/g, "").slice(-10);
    if (!rawPhone) errs.phone = "Phone is required";
    else if (!validatePhone(rawPhone))
      errs.phone = "Enter a valid 10-digit phone";

    if (!form.dob) errs.dob = "Date of Birth is required";
    if (!form.gender) errs.gender = "Select gender";
    if (!form.skills.length) errs.skills = "Select at least one skill";
    if (!form.department) errs.department = "Select department";
    if (!form.resume && !isEdit) errs.resume = "Upload resume";
    else if (form.resume) {
      if (!validateFileType(form.resume, ["application/pdf"]))
        errs.resume = "Resume must be a PDF";
      if (!validateFileSize(form.resume, 2))
        errs.resume = "Resume must be ≤ 2 MB";
    }
    if (!form.profileImage && !isEdit)
      errs.profileImage = "Upload profile image";
    else if (form.profileImage) {
      if (!validateFileType(form.profileImage, ["image/jpeg", "image/png"]))
        errs.profileImage = "Image must be JPG or PNG";
    }
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Field change handler
  const handleFieldChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && name === "resume") {
      const file = files[0];
      setForm((f) => ({ ...f, resume: file }));
      setResumeURL(file ? URL.createObjectURL(file) : null);
    } else if (type === "file" && name === "profileImage") {
      setForm((f) => ({ ...f, profileImage: files[0] }));
    } else if (type === "checkbox" && name === "isActive") {
      setForm((f) => ({ ...f, isActive: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Handle adding new gallery images
  const handleAddGalleryImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // If you want to append the new images to existing ones, do this:
    // (We need to store them in a single array, which could contain both
    // existing URLs (strings) and new File objects.)
    setForm((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files],
    }));

    // Optional: Clear the file input value so user can re-select if needed
    e.target.value = "";
  };

  // Skill toggle handler
  const toggleSkill = (skill) => {
    setForm((f) => {
      const has = f.skills.includes(skill);
      return {
        ...f,
        skills: has
          ? f.skills.filter((s) => s !== skill)
          : [...f.skills, skill],
      };
    });
  };

  // Remove profile image handler
  const removeProfileImage = () => {
    setForm((f) => ({ ...f, profileImage: null }));
  };

  // Remove one gallery image (by index)
  const removeGalleryImage = (index) => {
    setForm((f) => {
      const newGallery = [...f.galleryImages];
      newGallery.splice(index, 1);
      return { ...f, galleryImages: newGallery };
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix errors before submitting");
      return;
    }
    const formData = new FormData();

    // Append everything to formData
    Object.entries(form).forEach(([key, value]) => {
      if (key === "skills") {
        value.forEach((s) => formData.append("skills", s));
      } else if (key === "galleryImages") {
        // The array may contain existing string URLs (if editing) & new File objects
        value.forEach((item) => {
          if (typeof item === "string") {
            // Possibly skip or handle differently if your backend can handle it.
            // For example, you might have an array of "existingImages" for these
            // or you can pass them as text:
            formData.append("existingGalleryImages", item);
          } else {
            // If it's a File
            formData.append("galleryImages", item);
          }
        });
      } else {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      const url = isEdit
        ? `http://localhost:5000/api/employees/update/${id}`
        : `http://localhost:5000/api/employees/create`;
      const method = isEdit ? "put" : "post";
      const { data } = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Success", data.message, "success");
      navigate("/employees");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit" : "Create"} Employee Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Full Name */}
        <div>
          <label className="block font-medium">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Phone Input */}
        <div>
          <label className="block font-medium">
            Phone<span className="text-red-500">*</span>
          </label>
          <PhoneInput
            country={"in"}
            value={form.phone}
            onChange={(value, country) => {
              const dialCode = country.dialCode;
              if (!value.startsWith(dialCode)) {
                value = dialCode + value.replace(/^\+?/, "");
              }
              setForm((f) => ({ ...f, phone: value }));
            }}
            containerStyle={{ width: "100%" }}
            inputStyle={{ width: "100%" }}
            inputClass={`${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            buttonStyle={{
              border: errors.phone ? "1px solid #f56565" : "1px solid #d1d5db",
            }}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block font-medium">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.dob ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.dob && (
            <p className="text-red-500 text-sm">{errors.dob}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium">
            Gender<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mt-2">
            {gendersData.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm((f) => ({ ...f, gender: g }))}
                className={`px-4 py-1 rounded-full border transition ${
                  form.gender === g
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block font-medium">
            Skills<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {skillsData.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full border transition ${
                  form.skills.includes(skill)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills && (
            <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block font-medium">
            Department<span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.department ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Department</option>
            {departmentsData.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-sm">{errors.department}</p>
          )}
        </div>

        {/* Resume */}
        <div>
          <label className="block font-medium">
            Resume (PDF)<span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="resume"
            accept=".pdf"
            onChange={handleFieldChange}
            className="w-full mt-1 p-2 border rounded"
          />
          {errors.resume && (
            <p className="text-red-500 text-sm">{errors.resume}</p>
          )}
          {resumeURL && (
            <a
              href={resumeURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 text-sm mt-1 inline-block"
            >
              View Resume
            </a>
          )}
        </div>

        {/* Profile Image */}
        <div>
          <label className="block font-medium">
            Profile Image<span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="profileImage"
            accept="image/jpeg, image/png"
            onChange={handleFieldChange}
            className="w-full mt-1 p-2 border rounded"
          />
          {errors.profileImage && (
            <p className="text-red-500 text-sm">{errors.profileImage}</p>
          )}
          {form.profileImage && (
            <div className="relative inline-block mt-2">
              <img
                src={URL.createObjectURL(form.profileImage)}
                alt="Profile Preview"
                className="h-24 w-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={removeProfileImage}
                className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.586l4.95-4.95a1 1 0 011.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 015.05 3.636L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block font-medium">Gallery Images</label>
          {/* 
            We don't rely on the old single file input with multiple attribute. 
            Instead, we show a grid of existing images + a dedicated "Add Image" tile.
          */}
          <div className="flex flex-wrap gap-1 mt-2">
            {/* Render each image in the state */}
            {form.galleryImages.map((item, index) => {
              // If item is a File, generate object URL for preview
              // If item is a string, we treat it as an existing image URL
              const isFile = typeof item !== "string";
              const previewSrc = isFile
                ? URL.createObjectURL(item)
                : `http://localhost:5000/${item}`; 
              // Adjust the URL as needed if your server path is different

              return (
                <div
                  key={index}
                  className="relative group w-24 h-24 border rounded overflow-hidden"
                >
                  <img
                    src={previewSrc}
                    alt={`Gallery Preview ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 8.586l4.95-4.95a1 1 0 011.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 015.05 3.636L10 8.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* "Add Image" tile */}
            <label
              className="w-24 h-24 border border-dashed border-gray-400 rounded flex items-center justify-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50"
              title="Click to add images"
            >
              + Add Image
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={handleAddGalleryImages}
              />
            </label>
          </div>
        </div>

        {/* Is Active Toggle */}
        <div className="flex items-center mt-4">
          <label htmlFor="isActiveToggle" className="font-medium mr-2">
            Active Status
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              id="isActiveToggle"
              type="checkbox"
              name="isActive"
              className="sr-only"
              checked={form.isActive}
              onChange={handleFieldChange}
            />
            <div
              className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                form.isActive ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                  form.isActive ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium">
            Address<span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            rows="3"
            value={form.address}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {loading
            ? "Submitting…"
            : isEdit
            ? "Update Profile"
            : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;

import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState(null);
  const [toggleError, setToggleError] = useState(null);

  const limit = 10;
  const { navigate, API_URL } = useAppContext();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/employees?page=${page}&limit=${limit}&search=${searchTerm}`
      );
      
      // Handle both possible response formats
      if (response.data?.success) {
        if (Array.isArray(response.data.data)) {
          // Simple array response
          setEmployees(response.data.data);
          setTotalPages(1);
        } else if (response.data.data.employees) {
          // Paginated response
          setEmployees(response.data.data.employees || []);
          setTotalPages(response.data.data.totalPages || 1);
        } else {
          throw new Error("Invalid employee data format");
        }
      } else {
        throw new Error(response.data?.message || "Failed to load employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, searchTerm]);

  useEffect(() => {
    // Prevent body scroll when modals are open
    document.body.style.overflow =
      selectedExperience || selectedSalary || selectedDocuments ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedExperience, selectedSalary, selectedDocuments]);

  const toggleCurrentStatus = async (id, currentStatus) => {
    try {
      setToggleError(null);
      await axios.put(`${API_URL}/api/employees/${id}`, {
        is_current_employee: !currentStatus,
      });

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, is_current_employee: !currentStatus } : emp
        )
      );
    } catch (err) {
      console.error("Failed to update current status:", err);
      setToggleError("Failed to update status. Please try again.");
    }
  };

  if (loading) return <div className="p-6 flex justify-center">Loading employees...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      {/* Search + Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
  <div className="relative flex-grow">
    <input
      type="text"
      placeholder="Search employees by name, email or phone..."
      className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg
        className="h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
    </div>
  </div>

  <button
    onClick={() => navigate("/employees/add")}
    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 whitespace-nowrap"
  >
    Add New Employee
  </button>
</div>


      {/* Table Container - Fixed horizontal scroll issue */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
            <tr>
              {[
                "ID", "Name", "Contact", "Email", "Profile", "City", "Aadhar", "PAN",
                "Work Start", "Emp. Type", "Status", "Current", "Experience", "Salary", "Documents"
              ].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-600">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Editable cells */}
                {[
                  emp.employee_id, 
                  emp.name,
                  <div key={`contact-${emp._id}`}>{emp.contact1}<div className="text-xs text-gray-500">{emp.contact2}</div></div>,
                  emp.email,
                  emp.profile_image ? (
                    <img 
                      key={`profile-${emp._id}`}
                      src={emp.profile_image} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                  ) : (
                    <div 
                      key={`profile-placeholder-${emp._id}`}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-500">N/A</span>
                    </div>                  
                  ),
                  emp.city, 
                  emp.aadhar_number, 
                  emp.pan_number,
                  emp.work_start_date ? new Date(emp.work_start_date).toLocaleDateString() : "N/A",
                  emp.employment_type,
                  <div key={`status-${emp._id}`}>
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${emp.employee_status === "Active" ? "bg-green-100 text-green-800" :
                        emp.employee_status === "On Leave" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"}`}>
                      {emp.employee_status}
                    </span>
                  </div>
                ].map((cell, i) => (
                  <td key={`${emp._id}-${i}`} className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/employees/add?id=${emp._id}`)}>
                    {cell}
                  </td>
                ))}

                {/* Toggle Switch */}
                <td className="px-6 py-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emp.is_current_employee}
                      onChange={() => toggleCurrentStatus(emp._id, emp.is_current_employee)}
                      className="sr-only peer"
                    />
                    <div className="relative w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-5 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </td>

                {/* View Buttons */}
                {[
                  ["Experience", () => setSelectedExperience(emp.work_experience || [])],
                  ["Salary", () => setSelectedSalary(emp.salary_details || {})],
                  ["Docs", () => setSelectedDocuments(emp.documents || {})]
                ].map(([label, handler]) => (
                  <td key={`${emp._id}-${label}`} className="px-6 py-4">
                    <button onClick={(e) => { e.stopPropagation(); handler(); }} className="text-blue-600 underline text-sm">
                      View {label}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {/* {employees.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )} */}

      {/* No employees message */}
      {!loading && employees.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No employees found
        </div>
      )}

      {/* Error message for toggle */}
      {toggleError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {toggleError}
        </div>
      )}

      {/* Modals */}
      {selectedExperience && (
        <Modal title="Work Experience" onClose={() => setSelectedExperience(null)}>
          {selectedExperience.length > 0 ? (
            <div className="space-y-4">
              {selectedExperience.map((exp, idx) => (
                <div key={idx} className="border-b pb-3 last:border-0">
                  <p className="font-medium">{exp.company_name}</p>
                  <p className="text-gray-600">{exp.role}</p>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                  {exp.experience_letter?.url && (
                    <a href={exp.experience_letter.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline inline-block mt-1">
                      View Experience Letter
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500">No experience details</p>}
        </Modal>
      )}

      {selectedSalary && (
        <Modal title="Salary Details" onClose={() => setSelectedSalary(null)}>
          <div className="space-y-2">
            <p><strong>Monthly Salary:</strong> ₹{selectedSalary.monthly_salary || "N/A"}</p>
            <p><strong>Account No:</strong> {selectedSalary.bank_account_number || "N/A"}</p>
            <p><strong>IFSC Code:</strong> {selectedSalary.ifsc_code || "N/A"}</p>
            <p><strong>Bank Name:</strong> {selectedSalary.bank_name || "N/A"}</p>
            <p><strong>PF Account:</strong> {selectedSalary.pf_account_number || "N/A"}</p>
          </div>
        </Modal>
      )}

      {selectedDocuments && (
        <Modal title="Documents" onClose={() => setSelectedDocuments(null)}>
          <div className="space-y-3">
            {selectedDocuments.resume?.url && <FileLink url={selectedDocuments.resume.url} label="Resume" />}
            {selectedDocuments.offer_letter?.url && <FileLink url={selectedDocuments.offer_letter.url} label="Offer Letter" />}
            {selectedDocuments.joining_letter?.url && <FileLink url={selectedDocuments.joining_letter.url} label="Joining Letter" />}
            {selectedDocuments.other_docs?.map((doc, idx) => (
              <FileLink key={idx} url={doc.url} label={`Document ${idx + 1}`} />
            ))}
            {(!selectedDocuments.resume?.url && !selectedDocuments.offer_letter?.url && !selectedDocuments.joining_letter?.url && (!selectedDocuments.other_docs || selectedDocuments.other_docs.length === 0)) && (
              <p className="text-gray-500">No documents available</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900">✕</button>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const FileLink = ({ url, label }) => (
  <a href={url} target="_blank" rel="noreferrer" className="block p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
    <span className="font-medium">{label}</span>
  </a>
);

export default EmployeeManagement;
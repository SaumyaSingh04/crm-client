import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { navigate, API_URL } = useAppContext();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/employees`);
        setContracts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };
    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter((emp) =>
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (id) => {
    window.open(`${API_URL}/api/employees/${id}/contract/preview`, "_blank");
  };

  const handleDownload = async (id, name) => {
    try {
      const response = await axios.get(`${API_URL}/api/employees/${id}/contract/preview`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}_contract.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCreateForEmployee = (id) => {
    setShowDropdown(false);
    navigate(`/contracts/create/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search contracts by employee name..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* Create Contract Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            + Create Contract
            <svg 
              className={`ml-2 w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600">
              <div className="p-2 text-sm text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                Select an employee:
              </div>
              {contracts.map(emp => (
                <div
                  key={emp._id}
                  onClick={() => handleCreateForEmployee(emp._id)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                >
                  <span>{emp.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{emp.employee_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full">
        {filteredContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-12 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Contract Status
                  </th>
                  <th className="px-16 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredContracts.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td
                      className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/contracts/edit/${emp._id}`)}
                    >
                      {emp.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/contracts/edit/${emp._id}`)}
                    >
                      {emp.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.contract_agreement?.acceptance?.accepted ? (
                        <span className="text-green-600 font-medium">Accepted</span>
                      ) : (
                        <span className="text-red-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handlePreview(emp._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(emp._id, emp.name)}
                        className="text-green-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">No contracts found.</div>
        )}
      </div>
    </div>
  );
}

export default ContractManagement;
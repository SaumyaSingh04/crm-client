import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const ContractFormPage = () => {
  const { id } = useParams();
  const { API_URL } = useAppContext();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [contract, setContract] = useState({
    job_title: '',
    contract_type: 'Full Time',
    start_date: '',
    end_date: '',
    working_hours: {
      timing: '10 AM – 6 PM',
      days_per_week: 5,
      location: 'Office'
    },
    compensation: {
      monthly_salary: 0,
      salary_date: '5th'
    },
    termination: {
      notice_period_days: 30
    },
    acceptance: {
      accepted: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date to DD MMM YYYY for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/employees/${id}/contract/download`,
        { responseType: 'blob' }
      );
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${employee.name}_contract.pdf`);
      document.body.appendChild(link);
      link.click();
// Clean up
window.URL.revokeObjectURL(url);
document.body.removeChild(link);
} catch (error) {
console.error('Download failed:', error);
setError('Failed to download contract');
}
};

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/employees/${id}`);
        const data = response.data.data;
        setEmployee(data);
        
        if (data.contract_agreement) {
          setContract({
            ...data.contract_agreement,
            start_date: formatDateForInput(data.contract_agreement.start_date),
            end_date: formatDateForInput(data.contract_agreement.end_date),
            effective_date: formatDateForInput(data.contract_agreement.effective_date)
          });
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('working_hours.') || 
        name.startsWith('compensation.') || 
        name.startsWith('termination.')) {
      const [parent, child] = name.split('.');
      setContract(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: name.endsWith('days_per_week') || name.endsWith('notice_period_days') 
            ? parseInt(value) 
            : value
        }
      }));
    } else {
      setContract(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`${API_URL}/api/employees/${id}/contract/update`, contract);
      navigate('/contracts');
    } catch (error) {
      console.error('Error updating contract:', error);
      setError('Failed to update contract. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`${API_URL}/api/employees/${id}/contract/preview`, '_blank');
  };

  const handleAccept = async () => {
    if (window.confirm('Mark this contract as accepted? This action cannot be undone.')) {
      try {
        await axios.patch(`${API_URL}/api/employees/${id}/contract/accept`);
        setContract(prev => ({
          ...prev,
          acceptance: {
            ...prev.acceptance,
            accepted: true,
            accepted_at: new Date()
          }
        }));
      } catch (error) {
        console.error('Error accepting contract:', error);
        setError('Failed to accept contract');
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading employee data...</div>;
  if (!employee) return <div className="p-6 text-center">Employee not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/contracts')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">Employee Contract</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-medium mb-2">Employee Information</h3>
            <p className="mb-1"><span className="font-medium">Name:</span> {employee.name}</p>
            <p className="mb-1"><span className="font-medium">ID:</span> {employee.employee_id}</p>
            <p className="mb-1"><span className="font-medium">Designation:</span> {employee.designation}</p>
            <p><span className="font-medium">Employment Type:</span> {employee.employment_type}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-medium mb-2">Contract Status</h3>
            {contract.acceptance?.accepted ? (
              <div className="text-green-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Accepted on {contract.acceptance.accepted_at ? formatDateForDisplay(contract.acceptance.accepted_at) : 'Unknown date'}
              </div>
            ) : (
              <div className="text-yellow-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pending acceptance
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Type & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={contract.job_title || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contract Type
              </label>
              <select
                name="contract_type"
                value={contract.contract_type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Intern">Intern</option>
                <option value="Freelance">Freelance</option>
                <option value="Consultant">Consultant</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={contract.start_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          
          {/* End Date (conditional) */}
          {['Intern', 'Freelance', 'Contract'].includes(contract.contract_type) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={contract.end_date || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Working Hours */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Working Hours & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="working_hours.timing"
                  value={contract.working_hours?.timing || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Days per Week
                </label>
                <input
                  type="number"
                  name="working_hours.days_per_week"
                  value={contract.working_hours?.days_per_week || 5}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Location
                </label>
                <input
                  type="text"
                  name="working_hours.location"
                  value={contract.working_hours?.location || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Compensation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  name="compensation.monthly_salary"
                  value={contract.compensation?.monthly_salary || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salary Payment Date
                </label>
                <input
                  type="text"
                  name="compensation.salary_date"
                  value={contract.compensation?.salary_date || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 5th of each month"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Termination */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Termination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notice Period (days)
                </label>
                <input
                  type="number"
                  name="termination.notice_period_days"
                  value={contract.termination?.notice_period_days || 30}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/contracts')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Preview
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              Download Contract
            </button>
            
            {!contract.acceptance?.accepted && (
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Mark as Accepted
              </button>
            )}
            
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Contract
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractFormPage;
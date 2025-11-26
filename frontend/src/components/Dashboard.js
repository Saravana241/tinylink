import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance, API_BASE } from '../config/constants';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    originalUrl: '',
    customCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({
    originalUrl: false,
    customCode: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/links');
      setLinks(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch links' });
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation functions
  const validateUrl = (url) => {
    if (!url) return 'URL is required';
    try {
      new URL(url);
      return '';
    } catch (_) {
      return 'Please enter a valid URL (include http:// or https://)';
    }
  };

  const validateCustomCode = (code) => {
    if (!code) return ''; // Optional field
    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return 'Custom code must be 6-8 alphanumeric characters';
    }
    return '';
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate immediately when user types
    let error = '';
    if (field === 'originalUrl') {
      error = validateUrl(value);
    } else if (field === 'customCode') {
      error = validateCustomCode(value);
    }
    
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle blur events (when user leaves a field)
  const handleInputBlur = (field) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const urlError = validateUrl(formData.originalUrl);
    const codeError = validateCustomCode(formData.customCode);
    
    return !urlError && !codeError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    setFormTouched({
      originalUrl: true,
      customCode: true
    });

    // Final validation before submission
    const urlError = validateUrl(formData.originalUrl);
    const codeError = validateCustomCode(formData.customCode);
    
    if (urlError || codeError) {
      setFormErrors({
        originalUrl: urlError,
        customCode: codeError
      });
      return;
    }

    setSubmitLoading(true);
    try {
      await axiosInstance.post('/api/links', {
        originalUrl: formData.originalUrl,
        customCode: formData.customCode || undefined
      });

      setMessage({ type: 'success', text: 'Link created successfully!' });
      setFormData({ originalUrl: '', customCode: '' });
      setFormErrors({});
      setFormTouched({ originalUrl: false, customCode: false });
      setShowForm(false);
      fetchLinks();
    } catch (error) {
      if (error.response?.status === 409) {
        setFormErrors({ customCode: 'This custom code is already taken' });
        setFormTouched(prev => ({ ...prev, customCode: true }));
      } else {
        setMessage({ type: 'error', text: 'Failed to create link' });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await axiosInstance.delete(`/api/links/${code}`);
      setMessage({ type: 'success', text: 'Link deleted successfully!' });
      fetchLinks();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete link' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  // Handle click on short code - open the short link
  const handleShortCodeClick = (code) => {
    const shortUrl = `${window.location.origin}/${code}`;
    window.open(shortUrl, '_blank');
  };

  const filteredLinks = links.filter(link =>
    link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Your Links</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setFormData({ originalUrl: '', customCode: '' });
                setFormErrors({});
                setFormTouched({ originalUrl: false, customCode: false });
              }}
              className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Link
                </>
              )}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mx-6 mt-4 p-4 rounded-md ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'error' ? (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL Input */}
              <div>
                <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  id="originalUrl"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.originalUrl && formTouched.originalUrl
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/very-long-url"
                  value={formData.originalUrl}
                  onChange={(e) => handleInputChange('originalUrl', e.target.value)}
                  onBlur={() => handleInputBlur('originalUrl')}
                />
                {formErrors.originalUrl && formTouched.originalUrl && (
                  <div className="flex items-center mt-1 text-red-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">{formErrors.originalUrl}</p>
                  </div>
                )}
                {!formErrors.originalUrl && formData.originalUrl && (
                  <div className="flex items-center mt-1 text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Valid URL</p>
                  </div>
                )}
              </div>

              {/* Custom Code Input */}
              <div>
                <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Code (optional)
                </label>
                <input
                  type="text"
                  id="customCode"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.customCode && formTouched.customCode
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="my-link"
                  value={formData.customCode}
                  onChange={(e) => handleInputChange('customCode', e.target.value)}
                  onBlur={() => handleInputBlur('customCode')}
                />
                {formErrors.customCode && formTouched.customCode && (
                  <div className="flex items-center mt-1 text-red-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">{formErrors.customCode}</p>
                  </div>
                )}
                {!formErrors.customCode && formData.customCode && (
                  <div className="flex items-center mt-1 text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Valid custom code</p>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  6-8 alphanumeric characters. Leave empty for auto-generation.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitLoading || !isFormValid()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Short Link'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="p-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by code or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No links found</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first short link to get started!</p>
              {!showForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Link
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Clicked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.code} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* Clickable short code */}
                          <button
                            onClick={() => handleShortCodeClick(link.code)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 font-mono underline cursor-pointer transition-colors"
                            title="Click to open short link"
                          >
                            {link.code}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/${link.code}`)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy short URL"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {link.lastClicked
                          ? new Date(link.lastClicked).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/code/${link.code}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Stats
                        </Link>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
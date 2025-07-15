import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const GridTableCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await api.get('/code');
      setCodes(response.data);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast.error('Error fetching saved codes');
    } finally {
      setLoading(false);
    }
  };

  const loadInEditor = (code) => {
    localStorage.setItem('loadedCode', JSON.stringify({
      title: code.title,
      code: code.code,
      language: code.language,
      id: code._id
    }));
    
    navigate('/editor');
    toast.success(`${code.title} loaded in editor!`);
  };

  const deleteCode = async (id) => {
    if (window.confirm('Delete this code?')) {
      try {
        await api.delete(`/code/${id}`);
        setCodes(codes.filter(code => code._id !== id));
        toast.success('Code deleted!');
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
        <p>Loading codes...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          📁 My Saved Codes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Total: {codes.length} codes
        </p>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 mb-4">No codes saved yet</p>
          <button
            onClick={() => navigate('/editor')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create First Code
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-12 gap-2 min-w-full">
            {/* Header Row */}
            <div className="col-span-4 bg-gray-100 dark:bg-gray-700 p-3 font-bold text-gray-800 dark:text-white border-b">
              Code Title
            </div>
            <div className="col-span-2 bg-gray-100 dark:bg-gray-700 p-3 font-bold text-gray-800 dark:text-white border-b">
              Language
            </div>
            <div className="col-span-2 bg-gray-100 dark:bg-gray-700 p-3 font-bold text-gray-800 dark:text-white border-b">
              Date
            </div>
            <div className="col-span-2 bg-gray-100 dark:bg-gray-700 p-3 font-bold text-gray-800 dark:text-white border-b">
              Load
            </div>
            <div className="col-span-2 bg-gray-100 dark:bg-gray-700 p-3 font-bold text-gray-800 dark:text-white border-b">
              Delete
            </div>

            {/* Data Rows */}
            {codes.map((code, index) => (
              <React.Fragment key={code._id}>
                <div className={`col-span-4 p-3 border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <div className="text-gray-800 dark:text-white font-medium">
                    {code.title}
                  </div>
                </div>
                <div className={`col-span-2 p-3 border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    {code.language}
                  </span>
                </div>
                <div className={`col-span-2 p-3 border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={`col-span-2 p-3 border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <button
                    onClick={() => loadInEditor(code)}
                    className="w-full bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    🚀 Load
                  </button>
                </div>
                <div className={`col-span-2 p-3 border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <button
                    onClick={() => deleteCode(code._id)}
                    className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GridTableCodes;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const SavedCodes = () => {
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

  const loadCodeInEditor = (code) => {
    localStorage.setItem('loadedCode', JSON.stringify({
      title: code.title,
      code: code.code,
      language: code.language,
      id: code._id
    }));
    
    navigate('/editor');
    toast.success(`"${code.title}" loaded in editor!`);
  };

  const deleteCode = async (id) => {
    if (window.confirm('Are you sure you want to delete this code?')) {
      try {
        await api.delete(`/code/${id}`);
        setCodes(codes.filter(code => code._id !== id));
        toast.success('Code deleted successfully');
      } catch (error) {
        toast.error('Error deleting code');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading saved codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          💾 Saved Codes ({codes.length})
        </h2>
        <Link 
          to="/editor"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ New Code
        </Link>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">No saved codes yet</p>
          <Link 
            to="/editor" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Coding
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => (
            <div
              key={code._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1">
                  <button
                    onClick={() => loadCodeInEditor(code)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium text-left"
                    title="Click to load in editor"
                  >
                    {code.title}
                  </button>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      {code.language}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600 max-w-xs">
                  <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-hidden font-mono">
                    {code.code.substring(0, 60)}
                    {code.code.length > 60 && '...'}
                  </pre>
                </div>
              </div>
              <button
                onClick={() => deleteCode(code._id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded transition-colors ml-4"
                title="Delete Code"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCodes;

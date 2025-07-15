import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import MonacoEditor from '@monaco-editor/react';
import { api } from '../../services/api';
import ErrorHelper from '../AI/ErrorHelper';
import QuestionBox from '../AI/QuestionBox';
import CodeOutput from './CodeOutput';

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCodeId, setCurrentCodeId] = useState(null);
  const [isModified, setIsModified] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ];

  useEffect(() => {
    // Check if there's a code to load from localStorage
    const loadedCode = localStorage.getItem('loadedCode');
    if (loadedCode) {
      try {
        const codeData = JSON.parse(loadedCode);
        setTitle(codeData.title);
        setCode(codeData.code);
        setLanguage(codeData.language);
        setCurrentCodeId(codeData.id);
        setIsModified(false);
        
        // Clear the localStorage
        localStorage.removeItem('loadedCode');
        
        toast.success(`Loaded: ${codeData.title}`);
      } catch (error) {
        console.error('Error loading code:', error);
        toast.error('Error loading code');
      }
    }
  }, []);

  const handleCodeChange = (value) => {
    setCode(value || '');
    setIsModified(true);
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    setIsModified(true);
  };

  const saveCode = async () => {
    if (!title || !code) {
      toast.error('Please enter a title and code');
      return;
    }

    setLoading(true);
    try {
      if (currentCodeId) {
        // Update existing code
        await api.put(`/code/${currentCodeId}`, {
          title,
          code,
          language
        });
        toast.success('Code updated successfully!');
      } else {
        // Create new code
        const response = await api.post('/code', {
          title,
          code,
          language
        });
        setCurrentCodeId(response.data._id);
        toast.success('Code saved successfully!');
      }
      setIsModified(false);
    } catch (error) {
      toast.error('Error saving code');
    } finally {
      setLoading(false);
    }
  };

  const createNewCode = () => {
    if (isModified) {
      if (window.confirm('You have unsaved changes. Are you sure you want to create a new file?')) {
        resetEditor();
      }
    } else {
      resetEditor();
    }
  };

  const resetEditor = () => {
    setTitle('');
    setCode('');
    setLanguage('javascript');
    setCurrentCodeId(null);
    setIsModified(false);
    setOutput('');
    setError('');
    toast.success('New code editor ready');
  };

  const runCode = async () => {
    if (!code) {
      toast.error('Please enter some code');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await api.post('/code/run', {
        code,
        language
      });
      
      if (response.data.error) {
        setError(response.data.error);
        setOutput('');
      } else {
        setOutput(response.data.output);
        setError('');
      }
    } catch (error) {
      setError('Error running code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                💻 Code Editor
                {currentCodeId && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Editing: {title})
                  </span>
                )}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={createNewCode}
                  className="btn-secondary text-sm"
                  title="New Code"
                >
                  📄 New
                </button>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={runCode}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? '⏳ Running...' : '▶️ Run'}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter code title..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="input-field w-full"
              />
              {isModified && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ You have unsaved changes
                </p>
              )}
            </div>

            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <MonacoEditor
                height="500px"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={saveCode}
                disabled={loading || (!title || !code)}
                className="btn-primary"
              >
                {loading ? '💾 Saving...' : currentCodeId ? '💾 Update Code' : '💾 Save Code'}
              </button>
              
              {currentCodeId && (
                <button
                  onClick={createNewCode}
                  className="btn-secondary"
                >
                  📄 New Code
                </button>
              )}
            </div>
          </div>

          <CodeOutput 
            output={output}
            error={error}
            loading={loading}
            language={language}
          />
        </div>

        <div className="space-y-4">
          {error && (
            <ErrorHelper 
              error={error} 
              code={code} 
              language={language} 
            />
          )}
          
          <QuestionBox 
            code={code} 
            language={language} 
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CodeEditor;

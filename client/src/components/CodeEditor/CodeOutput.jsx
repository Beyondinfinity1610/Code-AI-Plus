import React from 'react';
import { motion } from 'framer-motion';

const CodeOutput = ({ output, error, loading, language }) => {
  const getOutputColor = () => {
    if (error) return 'text-red-400';
    if (output) return 'text-green-400';
    return 'text-gray-400';
  };

  const getContent = () => {
    if (loading) return 'Running code...';
    if (error) return error;
    if (output) return output;
    return 'No output yet. Click "Run" to execute your code.';
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Output</h3>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          )}
          <span className={`text-sm ${getOutputColor()}`}>
            {error ? 'Error' : output ? 'Success' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-auto">
        <pre className={`text-sm ${getOutputColor()} whitespace-pre-wrap`}>
          {getContent()}
        </pre>
      </div>

      {(output || error) && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <span>Language: {language}</span>
          <span>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default CodeOutput;

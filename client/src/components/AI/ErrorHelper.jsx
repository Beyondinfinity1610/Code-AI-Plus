import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { geminiService } from '../../services/geminiService';
import { toast } from 'react-hot-toast';

const ErrorHelper = ({ error, code, language }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const explainError = async () => {
    setLoading(true);
    try {
      const response = await geminiService.explainError(error, code);
      setExplanation(response.explanation);
    } catch (error) {
      toast.error('Error getting explanation');
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <motion.div 
      className="card bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
        <h3 className="text-xl font-bold text-red-400">🚨 Error Assistant</h3>
      </div>
      
      <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4">
        <p className="text-sm text-red-300">Error detected in your code!</p>
        <pre className="text-xs text-red-200 mt-1 overflow-x-auto">{error}</pre>
      </div>

      <motion.button
        onClick={explainError}
        disabled={loading}
        className="btn-primary w-full mb-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Analyzing Error...
          </div>
        ) : (
          '🔍 Explain This Error'
        )}
      </motion.button>

      {explanation && (
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center mb-3">
            <span className="text-green-400 mr-2">🤖</span>
            <h4 className="font-semibold text-green-400">AI Explanation:</h4>
          </div>
          <div 
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: `<p>${formatText(explanation)}</p>` 
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ErrorHelper;

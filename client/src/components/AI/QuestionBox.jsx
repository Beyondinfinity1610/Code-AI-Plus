import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { geminiService } from '../../services/geminiService';
import { toast } from 'react-hot-toast';

const QuestionBox = ({ code, language }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const response = await geminiService.answerQuestion(question, code);
      setAnswer(response.answer);
    } catch (error) {
      toast.error('Error getting answer');
    } finally {
      setLoading(false);
    }
  };

  const improveCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first');
      return;
    }

    setLoading(true);
    try {
      const response = await geminiService.improveCode(code, language);
      setAnswer(response.suggestion);
    } catch (error) {
      toast.error('Error getting code improvements');
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/``````/g, '<pre class="code-block"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  };

  const clearAll = () => {
    setQuestion('');
    setAnswer('');
  };

  return (
    <motion.div 
      className="card bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
        <h3 className="text-xl font-bold text-blue-400">🤖 AI Assistant</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            💬 Ask anything about your code:
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field w-full h-24 resize-none bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 focus:border-blue-500/50 transition-all duration-200"
            placeholder="What does this function do? How can I optimize this code? Can you explain this algorithm?"
          />
        </div>

        <div className="flex space-x-2">
          <motion.button
            onClick={askQuestion}
            disabled={loading}
            className="btn-primary flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '🤔 Thinking...' : '💭 Ask AI'}
          </motion.button>
          <motion.button
            onClick={improveCode}
            disabled={loading}
            className="btn-secondary flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⚡ Analyzing...' : '⚡ Improve Code'}
          </motion.button>
        </div>

        {answer && (
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">🎯</span>
                <h4 className="font-semibold text-green-400">AI Response:</h4>
              </div>
              <button
                onClick={clearAll}
                className="text-gray-400 hover:text-white transition duration-200 text-sm"
              >
                ✕ Clear
              </button>
            </div>
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p>${formatText(answer)}</p>` 
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionBox;

const Code = require('../models/Code');
const axios = require('axios');

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const languageMap = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54,        // C++
  c: 50,          // C
  csharp: 51,     // C#
  php: 68,        // PHP
  ruby: 72,       // Ruby
  go: 60,         // Go
  rust: 73,       // Rust
  kotlin: 78,     // Kotlin
  swift: 83       // Swift
};

const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (!languageMap[language]) {
      return res.status(400).json({ error: `Language '${language}' not supported` });
    }

    if (!JUDGE0_API_KEY) {
      return res.status(500).json({ error: 'Judge0 API key not configured' });
    }

    // Step 1: Submit code for execution
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageMap[language],
        stdin: '',
        cpu_time_limit: 5,
        memory_limit: 128000
      },
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const token = submissionResponse.data.token;

    // Step 2: Poll for results
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await axios.get(
        `${JUDGE0_API_URL}/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      const result = resultResponse.data;
      
      // Check if execution is complete
      if (result.status.id > 2) { // Status > 2 means completed
        let output = '';
        let error = '';

        if (result.stdout) {
          output = result.stdout;
        }

        if (result.stderr) {
          error = result.stderr;
        } else if (result.compile_output) {
          error = result.compile_output;
        } else if (result.status.description !== 'Accepted') {
          error = result.status.description;
        }

        return res.json({
          output: output || '',
          error: error || '',
          status: result.status.description,
          time: result.time,
          memory: result.memory
        });
      }
      
      attempts++;
    }

    // Timeout after max attempts
    return res.status(408).json({ error: 'Code execution timeout' });

  } catch (error) {
    console.error('Judge0 API error:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'Code execution failed',
        details: error.response.data 
      });
    }
    
    res.status(500).json({ 
      error: 'Code execution failed',
      details: error.message 
    });
  }
};

// Keep existing CRUD functions
const createCode = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newCode = await Code.create({
      title,
      code,
      language,
      tags: tags || [],
      user: req.user._id
    });

    res.status(201).json(newCode);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCodes = async (req, res) => {
  try {
    const codes = await Code.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCode = async (req, res) => {
  try {
    const code = await Code.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.json(code);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCode = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body;

    const updatedCode = await Code.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, code, language, tags },
      { new: true }
    );

    if (!updatedCode) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.json(updatedCode);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCode = async (req, res) => {
  try {
    const deletedCode = await Code.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deletedCode) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.json({ message: 'Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const totalCodes = await Code.countDocuments({ user: req.user._id });
    const recentCodes = await Code.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title language createdAt');

    res.json({
      totalCodes,
      recentCodes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loadCodeById = async (req, res) => {
  try {
    const code = await Code.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.json({
      id: code._id,
      title: code.title,
      code: code.code,
      language: code.language,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createCode,
  getCodes,
  getCode,
  updateCode,
  deleteCode,
  runCode,
  getStats,
  loadCodeById  
};
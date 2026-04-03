const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // ✅ Fixed
  } 
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  console.log("Raw Token Received:", token);
  console.log("Token Type:", typeof token);

  if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
    console.log("DENIED: Token is missing or corrupted.");
    return res.status(401).json({ message: 'No valid token, authorization denied' });
  }

  const stringToken = String(token).trim();

  try {
    const decoded = jwt.verify(stringToken, process.env.JWT_SECRET);
    req.user = decoded.user || decoded; 
    console.log("SUCCESS: Token Verified for User:", req.user.username || req.user.id);
    return next(); 
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ message: 'Token expired or invalid. Please log in again.' });
  }
};

module.exports = { protect };
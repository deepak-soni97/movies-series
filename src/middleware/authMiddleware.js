const jwt = require('jsonwebtoken');
require('dotenv').config


function verifyToken(req, res, next) {
try{
      const bearerHeader = req.headers['authorization'];
      if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      req.token = token;
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId : decodedToken.userId, role : decodedToken.role} ;
      return next();
   }
      return res.status(401).json({message:'Provide Token'})
}
catch(error){res.status(500).send(error)}
}



module.exports = verifyToken;
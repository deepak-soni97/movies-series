const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
try{
      const bearerHeader = req.headers['authorization'];
      if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      req.token = token
      return next();
   }
      return res.json({message:'Provide Token'})
}
catch(error){res.send(error)}
}

module.exports = verifyToken;
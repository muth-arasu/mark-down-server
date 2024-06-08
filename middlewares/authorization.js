const jwt = require('jsonwebtoken')
require('dotenv').config()
const authorization = (req, res, next) => {
    const token = req.headers.authorization ?.split(' ')[1];
    console.log('token',token);
    if (!token) {
        return res.status(401).json({ error: 'Token not found' });
    } else {
        jwt.verify(token,'mark-down' , (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token expired' });
                } else {
                    return res.status(403).json({ error: 'Forbidden' });
                }
            }
            const currentTimeStamp = Math.floor(Date.now()/1000)
            console.log(currentTimeStamp);
            if(user.exp && user.exp < currentTimeStamp){
                return res.status(401).json({error:"Token Expired"})
            }
            req.user = user;
            next();
        });
    }
};


module.exports = authorization
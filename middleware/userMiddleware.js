import jwt from 'jsonwebtoken';
import User from '../models/dbSchema/Users.js';

const userAuthenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user  = await User.findOne({_id : decoded._id});

    if (!user){
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: `Authorize first ---> ${error.message}` });
  }
};

export default userAuthenticate;
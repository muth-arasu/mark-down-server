const express = require("express");
const UserModel = require('../models/userModel')
const { validateSignUp, validateSignIn } = require('../Validation/User.js')
const Router = express.Router()
const multer = require('multer')
const path = require("path")
const authorization= require('../middlewares/authorization.js')
const fs = require('fs');





/* 
    Route       : /
    Method      : POST
    Parameter   : NONE
    body        : USER DATA
    Descriptrion: To SignUp
    Access      : Public

*/
Router.post('/signUp', async (req, res) => {
  try {
    console.log('POST',req.body);
    await validateSignUp(req.body)
    await UserModel.findByEmailAndPhone(req.body)
    const newUser = await UserModel.create(req.body)
    const token = newUser.generateJwtToken()
    res.status(201).json({ message: 'success fully submitted your data', token })
  }

  catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message })
  }
})

/* 
  Route       : /
  Method      : GET
  Parameter   : NONE
  Descriptrion: To SignIn
  Access      : Public

*/
Router.post('/signIn', async (req, res) => {
  try {
    console.log(req.body);
    await validateSignIn(req.body)
    const userData = await UserModel.findByEmailAndPassword(req.body)
    if (userData) {
      const token = userData.generateJwtToken()
      res.status(200).json({ message: "login successfull", token })
    }
    else {
      return res.status(404).json({ message: "User Doesn't exist" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }

})


/* 
    Route       : /
    Method      : GET
    Parameter   : filterValue
    Descriptrion: To get all User Data
    Access      : Public

*/

Router.get('/', authorization, async (req, res) => {
  try {
    const { page, limit , startDate, endDate, searchValue } = req.query;

    let filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (searchValue) {
      const regex = new RegExp(searchValue, 'i'); // case-insensitive
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const allUserData = await UserModel.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await UserModel.countDocuments(filter).exec();

    if (allUserData.length > 0) {
      res.status(200).json({
        message: "Successfully fetched all user data",
        allUserData,
        total,
        currentPage: parseInt(page),
      });
    } else {
      res.status(404).json({ error: "No User data found in collections" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* 
    Route       : /
    Method      : GET
    Parameter   : _id
    Descriptrion: Get User By id
    Access      : Public

*/

Router.get(`/user/:id`, authorization,async (req, res) => {
  try {
    const UserDataById = await UserModel.findOne()
    console.log(UserDataById);
    if (UserDataById) {
      res.status(200).json({ message: "successfully fectche all user data", UserDataById })
    }
    else {
      res.status(404).json({ error: "No User data found in collections collection" })
    }

  } catch (error) {
    console.log(error);
    console.log('internal server');
  }
})


const deleteFile = ( userData) => {
try {
  if (userData) {
    // Step 2: Get the image file name from the user data
    const imageName = userData.image;
    console.log(imageName)
    // Step 3: Delete the image file
    if (imageName) {
      const imagePath = path.join(__dirname, `../../Client/src/assets`, imageName);
      console.log(imagePath);
      // Check if the file exists before attempting to delete
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image file deleted successfully');
      } else {
        console.log('Image file not found');
      }
    }

  }
} catch (error) {
  console.log(error);
} 
}

/* 
  Route       : /
  Method      : POST
  Parameter   : NONE
  body        : {firstName,email}
  Descriptrion: upload the image
  Access      : Public

*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, '../../Login Crud/Client/public') },
  filename: (req, file, cb) => { cb(null, file.fieldname + '-'+Date.now()  + path.extname(file.originalname)) },
})
const upload = multer({ storage: storage })
Router.put('/upload/:_id', upload.single('image'), authorization, async (req, res) => {
  try {
    const { _id } = req.params;
    const userData = await UserModel.findOne({ _id });
    deleteFile(userData); 
    const image = req.file.filename;
    const userImage = await UserModel.findOneAndUpdate({ _id }, { image: image }, { new: true });

    if (userImage) {
      res.status(201).json({ message: "file uploaded successfully", userImage });
    }
  } 

  catch (error) {
    res.status(500).json({ error: error.message });
  }

});


/* 
  Route       : /
  Method      : PUT
  Parameter   : _id
  body        : {updateUserData}
  Descriptrion: To update the user data bade on id
  Access      : Public

*/


Router.put('/edit/:_id', authorization, async (req, res) => {
  try {
    const { _id } = req.params
    const  updatedUserData  = req.body
    console.log(updatedUserData)
    const userData = await UserModel.findOneAndUpdate({ _id },  updatedUserData , { new: true })
    if (userData) {
      res.status(201).json({ message: `successfully updated data for user id of${req.params._id}` })
    }
    else {
      res.status(404).json({ error: `User not found for the id of ${_id}` })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/* 
Route       : /
Method      : DELETE
Parameter   : _id
body        : {updateUserData}
Descriptrion: To delete the user data bade on id
Access      : Public

*/
Router.delete('/delete/:_id',authorization, async (req, res) => {
  try {
    const { _id } = req.params;

    // Step 1: Delete user data from the database
    const userData = await UserModel.findOneAndDelete({ _id });
    deleteFile(userData)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = Router;
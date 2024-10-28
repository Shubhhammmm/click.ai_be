const passport = require('passport');
const User = require('../models/user');


exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});


exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/' }, async (err, user) => {

    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/');
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      res.redirect('https://click-ai-fe.vercel.app');
    });
  })(req, res, next);
};


exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

exports.getSession = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user,
      isAuthenticated: true,
    });
  } else {
    res.json({ isAuthenticated: false });
  }
};
exports.userLogin = async(req, res) => {
 try{
   const {email,password}=req.body;
  let user = await User.findOne({ email:email });
    if (!user) {
      res.status(404).json({message:"User Not Found"});
    }
    else{
      if(!user.password){
        const val= await User.findOneAndUpdate(
          { email:email },
          { $set: { password: password } },
          { new: true }
        );
        res.status(200).json({message:"Login Success",user:val});
      }
      else{
        if(user.password==password){
          res.status(200).json({message:"Login Success",user});
        }
        else{
          res.status(404).json({message:"Password is Incorrect"});
        }
      }
    }
  }
  catch(error){
    console.log(error.message)
    res.status(500).json({message:error.message});

 }
};

exports.userRegister = async(req, res) => {
 try{
   const {email,password,Name}=req.body;
  let user = await User.findOne({ email:email });
  if (!user) {
    if(!password){
      res.status(404).json({message:"Password is required"});
      return;
    }
    const newuser = await User.create({
      Name:Name,
      email: email,
      password:password,
    });
      res.status(200).json({message:"Register Success",user:newuser});
    }
    else{
      res.status(404).json({message:"User Already Exist"});
    }
  }
  catch(error){
    res.status(500).json({message:error.message});
 }
};



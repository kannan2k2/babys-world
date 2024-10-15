const User= require("../model/user");

exports.isAuthicated=async (req,res,next)=>{

    const email = req.session.user;
    const user = await User.findOne({ email: email });
        if(user){
        // const user=await User.findById({ email: email})
        if(user && user.blocked=== true){
            req.session.user = false
            return res.render("user/login", {
                message: "You are blocked",
              });
        }else{
            next();
        }
        
        }
    else{
        return res.render("user/login", {
            message: "You are blocked",
          });
    } 
}



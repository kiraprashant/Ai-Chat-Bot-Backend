const UserModel = require("../Models/UserModel")
const bcrypt = require("bcrypt")

const AddUserData = async(req,res) =>{
    console.log(req.body)
    try{
        const GetEmail = await UserModel.findOne({Email:req.body.Email})     

        console.log(" Email ",GetEmail)
        console.log(req.body.Email)

        if(GetEmail){
            res.status(400).json({
            Success:false,
            msg:"Email Already Exist"
           })

           return false
        }

            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(req.body.Password, saltRounds);
            console.log("hashedPassword",hashedPassword)

           const AddUser = await UserModel(
            {

                FullName:req.body.FullName,
                Email:req.body.Email,
                Password:hashedPassword,

            }
           ).save()
            res.json({
                Success:true,
                msg:"User SuccessFully Register"
               })
        

    }
    catch(e){
       console.log(e)
       res.status(400).json({
        Success:false,
        msg:"User Resgistration Failed 123"
       })
    }

}


module.exports = {AddUserData}
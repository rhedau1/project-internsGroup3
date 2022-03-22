const internmodel=require("../model/internModel")
const collegemodel=require("../model/collegeModel")
const validateBody = require('../validation/validation');


const createIntern = async function (req, res) {
    try {
        const { name, email, mobile, collegeid, isDeleted } = req.body; 
        const requestBody = req.body;

        // Validate body
        if (!validateBody.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please provide body of intern" });
        }

        // Validate name
        if (!validateBody.isValid(name)) {
            return res.status(400).send({ status: false, msg: "Please provide name" });
        }

        

        // Validate email
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please provide Email id" });;
        }

        // Validate syntax of Email
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, msg: "Please provide a valid Email Id" });
        }

         // Validate mobile
         if (!validateBody.isValid(mobile)) {
            return res.status(400).send({ status: false, msg: "Please provide mobile number" });
        }

        // Validate mobile number
        if (!validateBody.isValidMobileNum(mobile)) {
            return res.status(400).send({ status: false, msg: 'Please provide a valid Mobile number.' })
        }

        // Checking duplicate entry of intern
        let isDBexists = await internmodel.find();
        let dbLen = isDBexists.length
        if (dbLen != 0) {
            //Cheking the provided email id is already exists or not in the database
            const DuplicateEmailId = await internmodel.find({ email: email });
            const emailFound = DuplicateEmailId.length;
            if (emailFound != 0) {
                return res.status(400).send({ status: false, msg: "This Email Id already exists" });
            }
            const duplicateMob = await internmodel.findOne({ mobile: mobile })
            // const duplicateMobCount = duplicateMob.length
            if (duplicateMob) {
                return res.status(400).send({ status: false, msg: "This mobile number already exists" });
            }
        }
        // Cheking the email id is duplicate or not       
        if (isDeleted === true) {
            return res.status(400).send({ status: false, msg: "At the time of new entry no data should be deleted" });
        }
        

        // Finally the registration of intern is successful
        let collegeId = req.body.collegeId
        let college = await collegemodel.findById(collegeId)
        if(!college){
           res.status(400).send({status : false, msg:"No Such college is Present,Please check collegeId"})}
        
        let internCreated = await internmodel.create(requestBody)
        res.status(201).send({ status: true, data: internCreated })
   }
   catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
}
}

 





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getCollegeDetails = async function (req, res) {

        try {
          let interns = []
          let result = {}
          let collegeName = req.query.name
      
          if (!collegeName)
            return res.status(400).send({ status: false, msg: "invalid request parameters . Please Provide college name" })
      
      
          let collegeDetails = await collegemodel.findOne({ name: collegeName })
          if (!collegeDetails)
            res.status(400).send({ status: false, msg: "No College Found" })
      
          let internDetails = await internmodel.find({ collegeId: collegeDetails._id })
          if (internDetails.length === 0) {
            res.status(400).send({ status: false, msg: "No interns were Found" })
          }
          let collegeData = {
            name: collegeDetails.name,
            fullName: collegeDetails.fullName,
            logoLink: collegeDetails.logoLink
          }
          for (let i = 0; i < internDetails.length; i++) {
            result = {
              _id:internDetails[i]._id,
              name: internDetails[i].name,
              email: internDetails[i].email,
              mobile: internDetails[i].mobile
            }
            interns.push(result)
          }
          collegeData["intrests"] = interns
          console.log(collegeData)
          res.status(200).send({ status: true, data: collegeData })
        }
        catch (error) {
          console.log(error)
          res.status(500).send({ status: false, msg: error.message })
        }
      }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.createIntern=createIntern;
module.exports.getCollegeDetails=getCollegeDetails


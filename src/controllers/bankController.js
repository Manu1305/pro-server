const BankData = require("../models/Bankdetails");
const users = require("../models/userModel");

const addBankdetails = async (req, res) => {
  // console.log("ADDRESS",req.user.id);

  console.log(req.body)
  
  const BankDatas = new BankData({ userId: req.user.email, ...req.body });
  try {
    // const findUser = await Address.find({ userId: req.user.id });
    // console.log(findUser);
    const findUser = await users.findByIdAndUpdate(req.user.id, {
      storeSetup: true,
    });


    const saveBankdetails = await BankDatas.save();

    res.status(200).json(saveBankdetails);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

// const getSavedBankData= async (req, res) => {
//   console.log(req.body+"bankdata is this ")
//   const userId = req.body.userid;
//   try {
//     // console.log("userID Working address", userId);
//     const Bankdetails = await BankData.find({ userId });

//     console.log("BankData",Bankdetails)
//     if (!Bankdetails) {
//       return res.status(401).json({ Message: "No bank data...!" });
//     }
//     // console.log("carts", carts);
//     res.status(200).json(BankData);
//     console.log(Bankdetails+"saved bank")
//   } catch (error) {
//     console.log(error);
//   }
// };

const getSavedBankData = async (req, res) => {
  console.log(req.body,"shkdvjdjkcd")
  // const userId=req.params.email
  // console.log("userIdeee",userId)
  try {
    const getBankData = await BankData.find({"userId":req.params.email});
    res.status(200).json(getBankData);
  } catch (error) {
    res.json({ message: error });
  }
};




module.exports = { addBankdetails, getSavedBankData };

const Address = require("../models/Address");

const addAddress = async (req, res) => {
  // console.log("ADDRESS",req.user.id);

  console.log(req.body)
  const address = new Address({ userId: req.user.id, ...req.body });

  try {
    // const findUser = await Address.find({ userId: req.user.id });
    // console.log(findUser);

    const saveAddress = await address.save();

    res.status(200).json(saveAddress);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};

const getSavedaddress = async (req, res) => {
  console.log(req.body+"reqdfvbody")
  const userId = req.user.id;
  try {
    // console.log("userID Working address", userId);
    const address = await Address.find({ userId });

    console.log("address",address)
    if (!Address) {
      return res.status(401).json({ Message: "Your address is empty...!" });
    }
    // console.log("carts", carts);
    res.status(200).json(address);
    console.log(address+"saved address")
  } catch (error) {
    console.log(error);
  }
};








const updateAddress = async (req, res) => {
  console.log(req.body.addressDetails);
  try {
    const updateAddress = await Address.findOneAndUpdate(
      {
        userId: req.user.id,
      },
      {
        $set: {
          addressDetails: { ...req.body.addressDetails },
        },
      },

      { new: true }
    );

    res.status(200).json(updateAddress);
  } catch (error) {
    res.status(500).json(error);
  }
};


const deleteAddress = async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log(itemId)

    // const userId = req.user.id;

    const address = await Address.findByIdAndDelete(itemId);

    console.log(address)

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    

    // Save the updated cart

    res.status(200).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};







module.exports = { addAddress, updateAddress ,getSavedaddress,deleteAddress};

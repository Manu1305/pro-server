const Wishlist = require("../models/Wishlist");
const products = require("../models/productModel");


const addToWish =  async (req, res) => {
    const userId = req.user.id;
    const {productId} = req.body
  console.log(req.body)
    try {
      const existingWishlistItem = await Wishlist.findOne({
        userId,
        productId,
      });

      

    

      
      if (existingWishlistItem) {
        await Wishlist.findByIdAndDelete(existingWishlistItem._id);
        res.status(200).json({ message: "Item removed from wishlist" });
      } else {
        const newWishlistItem = new Wishlist({
          productId,
          userId,
        });
  
        await newWishlistItem.save();
        res.status(200).json({ message: "Item added to wishlist" });
      }
    } catch (error) {
      console.error(error);
     res.status(500).json({ message: "Internal Server Error" });
    }
  }


  const getWishproducts = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const wish = await Wishlist.find({ userId });
  
      const productIds = wish.map((item) => item.productId);
  
      const productList = await products
        .find({ _id: { $in: productIds } })
        .lean();
  
      const wishproducts = productList.map((product) => {
        const wishItems = wish.find(
          (item) => item.productId === product._id.toString()
        );
        return { ...product };
      });
  
      res.json(wishproducts);
    } 
    catch (error) {
      console.error("Error fetching products from wish:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }






module.exports = { addToWish,getWishproducts};


  
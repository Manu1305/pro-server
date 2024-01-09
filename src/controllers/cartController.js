const Cart = require("../models/Cart");
const Product = require("../models/productModel");

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, sizeAndQua, totalItems , productDetails} = req.body;

    // Find the product by its ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate the total cart price
    const itemPrice = Number(product.sellingPrice * totalItems) ;
console.log(itemPrice,'itemPrice')
    // Find the cart for the given userId
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            sizeAndQua,
            totalQuantity: totalItems ,
            productDetails,
            itemPrice
          },
        ],
      });
    } else {
      // If the cart exists, find the item with the same product
      const existingItem = cart.items.find((item) => {
        return item.productId == productId;
      });

      if (existingItem) {
        // update item
        existingItem.sizeAndQua = sizeAndQua;
        existingItem.stock = totalItems ;
        existingItem.itemPrice = itemPrice;
        existingItem.productDetails = productDetails
      } else {
        // If the item doesn't exist,
        cart.items.push({
          productId,
          sizeAndQua,
          totalQuantity: totalItems ,
          productDetails,
          itemPrice
        });
      }
    }

    let subTotal = 0;
    cart.items.forEach((singleItem) => {
      console.log(singleItem.itemPrice);
      subTotal += singleItem.itemPrice;
    });

    // update sub total
    cart.subTotal = subTotal;

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const getUserCart = async (req, res) => {
  const userId = req.user.id;
  console.log("userID Working", userId);
  try {
    const carts = await Cart.findOne({ userId });
    if (!carts) {
      return res.status(200).json({ Message: "Your cart is empty...!" });
    }
    res.status(200).json(carts);
  } catch (error) {
    console.log(error);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const userId = req.user.id;

    // Find the cart for the given userId
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the index of the item to be deleted
    const itemIndex = cart.items.findIndex((item) => {
      return item._id.toString() === itemId;
    });

    console.log("itemIndex", itemIndex);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    // Update the subTotal
    cart.subTotal -= cart.items[itemIndex].itemPrice;

    // Remove the item from the cart items array
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

module.exports = { addToCart, deleteCartItem, getUserCart };
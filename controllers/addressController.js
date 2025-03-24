import Address from "../models/dbSchema/Address.js";

class AddressController {
  
  async createAddress(req, res) {
    try {
      const user_id = req.user._id;
      const { billing_address, shipping_address } = req.body;

      if (!billing_address || !shipping_address) {
        return res.status(400).json({ message: "Billing and shipping address are required" });
      }

      const newAddress = new Address({ user_id, billing_address, shipping_address });
      await newAddress.save();

      res.status(201).json({ message: "Address saved successfully", address: newAddress });
    } catch (error) {
      console.error("Error in creating address: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAllAddresses(req, res) {
    try {
      const user_id = req.user._id;
      const addresses = await Address.find({ user_id });

      if (!addresses.length) {
        return res.status(404).json({ message: "No saved addresses found" });
      }

      res.status(200).json({ addresses });
    } catch (error) {
      console.error("Error in fetching addresses: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateAddress(req, res) {
    try {
      const user_id = req.user._id;
      const address_id = req.params.addressid;
      const { billing_address, shipping_address } = req.body;

      const updatedAddress = await Address.findOneAndUpdate(
        { _id: address_id, user_id },
        { billing_address, shipping_address },
        { new: true }
      );

      if (!updatedAddress) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.status(200).json({ message: "Address updated successfully", address: updatedAddress });
    } catch (error) {
      console.error("Error in updating address: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteAddress(req, res) {
    try {
      const user_id = req.user._id;
      const address_id = req.params.addressid;

      const deletedAddress = await Address.findOneAndDelete({ _id: address_id, user_id });

      if (!deletedAddress) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error in deleting address: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new AddressController();

import Faqs from "../models/dbSchema/Faq.js";

class FaqController {
  async addfaq(req, res) {
    const faqData = req.body;
    if (!faqData || faqData.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }
    try {
      const savedFaqs = [];
      for (const data of faqData) {
        const faq = new Faqs(data);
        const savedFaq = await faq.save();
        savedFaqs.push(savedFaq);
      }
      res.status(200).json({
        message: "FAQs saved successfully",
        data: savedFaqs,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error saving data", error: error.message });
    }
  }

  async getAllFaqs(req, res) {
    try {
      const faqs = await Faqs.find().sort({ _id: 1 });
      res.status(200).json(faqs);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching data", error: error.message });
    }
  }

  async deleteFaq(req, res) {
    const { id } = req.params;
    try {
      const deletedFaq = await Faqs.findByIdAndDelete(id);
      if (!deletedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting data", error: error.message });
    }
  }
}

export default new FaqController();

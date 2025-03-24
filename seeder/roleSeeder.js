import mongoose from "mongoose";
import Roles from "../models/dbSchema/Roles.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

connectDB();

const RolesData = [
  { role_name: "admin", role_slug: "_admin" },
  { role_name: "customer", role_slug: "_customer" },
];

// any data that will be added by the seeder will have isDefault : true

const seedRolesData = async () => {
  try {
    for (const roleData of RolesData) {
      const existingRole = await Roles.findOne({
        role_slug: roleData.role_slug,
      });

      if (!existingRole) {
        const role = new Roles({
          ...roleData,
          isDefault: true,
          createdBy: null,
        });
        await role.save();
        console.log(`Role saved ${roleData.role_name}`);
      } else {
        console.log(`Role already exists`);
      }
    }

    console.log("role seeded");
  } catch (error) {
    console.error(`Error seeding role : ${error.message}`);
  } finally {
    mongoose.disconnect();
  }
};

seedRolesData();

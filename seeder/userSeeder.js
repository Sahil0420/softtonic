import mongoose from "mongoose";
import dotenv from "dotenv";
import Users from "../models/dbSchema/Users.js"
import Roles from "../models/dbSchema/Roles.js";
import connectDB from "../config/db.js";

dotenv.config();
connectDB();

const UsersData = [
    {
      first_name: "John",
      last_name: "Doe",
      email_id: "john.doe@example.com",
      password: "password123",
      role_slug: "_customer",
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email_id: "adminjaneh@example.com",
      password: "password123",
      role_slug: "_admin",
    },
  ];

const seedUserData = async () => {
  try {
    for (const userData of UsersData) {
      const role = await Roles.findOne({ role_slug: userData.role_slug});

      if (!role) {
        console.error(
          `Role ${userData.role_name} not found skipping this user`
        );
        continue;
      }

      const existingUser = await Users.findOne({ email_id: userData.email_id });

      if (!existingUser) {
        const newUser = new Users({
          ...userData,
          role_id: role._id,
        });

        await newUser.save();
        console.log(
          `User created: ${userData.first_name} with email : ${userData.email_id}`
        );
      } else {
        console.log(`User already exists ${userData.email_id}`);
      }
    }

    console.log("User seeding done");
  } catch (error) {
    console.error(`Error seeding users : ${error.message}`);
    process.exit(1);
  }finally{
    mongoose.disconnect();
    process.exit(0);
  }
};

seedUserData();

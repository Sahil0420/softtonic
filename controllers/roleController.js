import { z } from "zod";
import Roles from "../models/dbSchema/Roles.js";

const createRoleSchema = z.object({
  role_name: z.string().min(1, "Role name is required"),
});

const updateRoleSchema = z.object({
  role_name: z.string().min(1, "Role name is required").optional(),
});

// Create a new role
const createRole = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { role_name } = createRoleSchema.parse(req.body);

    const role = new Roles({ role_name, createdBy: adminId });
    await role.save();

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: "Invalid request data", error: error.issues });
    } else {
      res
        .status(400)
        .json({ message: "Error creating role", error: error.message });
    }
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Roles.find().sort({ _id: -1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

// Get a role by ID
const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const role = await Roles.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Error fetching role", error });
  }
};

// Update a role
const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { role_name } = updateRoleSchema.parse(req.body);

    const role = await Roles.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: `Role not found in db ${roleId}`});
    }

    if (role_name) {
      role.role_name = role_name;
    }

    await role.save();

    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid request data", error: error.issues });
    } else {
      res.status(400).json({ message: "Error updating role", error });
    }
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    await Roles.findByIdAndDelete(roleId);

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error });
  }
};

export { createRole, getRoles, getRoleById, updateRole, deleteRole };

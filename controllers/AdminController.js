const { getSupabaseAdmin } = require('../config/supabase');
const { SubAdmin } = require('../models');

const getSubAdmins = async (req, res) => {
    try {
        const subAdmins = await SubAdmin.findAll({
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(subAdmins);
    } catch (error) {
        console.error('Error fetching sub-admins:', error);
        res.status(500).json({ error: error.message });
    }
};

const createSubAdmin = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({ success: false, message: "Name, Email and Password are required." });
    }

    const supabaseAdmin = getSupabaseAdmin();
    let authUser;

    try {
        // 1. Create Supabase Auth User
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password,
            email_confirm: true,
            user_metadata: {
                role: "sub-admin",
                name: name
            }
        });

        if (error) throw error;
        authUser = data.user;

        // 2. Insert into SubAdmins Table
        const newSubAdmin = await SubAdmin.create({
            auth_user_id: authUser.id,
            name,
            email,
            phone,
            status: "Active"
        });

        return res.status(200).json({
            success: true,
            message: "Sub-admin created successfully",
            admin: newSubAdmin
        });

    } catch (error) {
        console.error("Error creating sub-admin:", error);

        // Rollback: Delete the created auth user if DB insert fails (and user was created)
        if (authUser && authUser.id) {
            try {
                await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            } catch (deleteError) {
                console.error("Failed to rollback auth user:", deleteError);
            }
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create sub-admin record."
        });
    }
};

const updateSubAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const subAdmin = await SubAdmin.findByPk(id);

        if (!subAdmin) {
            return res.status(404).json({ success: false, message: "Sub-admin not found" });
        }

        await subAdmin.update(req.body);

        return res.status(200).json({
            success: true,
            message: "Sub-admin updated successfully",
            admin: subAdmin
        });
    } catch (error) {
        console.error("Error updating sub-admin:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update sub-admin record."
        });
    }
};

const deleteSubAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const subAdmin = await SubAdmin.findByPk(id);

        if (!subAdmin) {
            return res.status(404).json({ success: false, message: "Sub-admin not found" });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // 1. Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(subAdmin.auth_user_id);
        if (authError) throw authError;

        // 2. Delete from SubAdmins Table
        await subAdmin.destroy();

        return res.status(200).json({
            success: true,
            message: "Sub-admin deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting sub-admin:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete sub-admin record."
        });
    }
};

module.exports = {
    getSubAdmins,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin
};

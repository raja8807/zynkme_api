const { getSupabaseClient } = require('../config/supabase');
const { User, SubAdmin } = require('../models');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const supabase = getSupabaseClient(authHeader);
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const role = authUser.user_metadata?.role;

        // Find profile to confirm role and status
        let profile;
        if (role === 'sub-admin') {
            profile = await SubAdmin.findOne({ where: { auth_user_id: authUser.id } });
            if (profile && profile.status !== 'Active') {
                return res.status(401).json({ error: 'Sub-admin account is inactive' });
            }
        } else if (role === 'admin') {
            profile = await User.findOne({ where: { id: authUser.id } });
        }

        req.user = {
            id: authUser.id,
            role: role,
            profile: profile
        };

        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

module.exports = authenticate;

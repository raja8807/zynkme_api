const { getSupabaseClient, getSupabaseAdmin } = require("../config/supabase");
const { User, SubAdmin } = require("../models");

const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    return res.status(200).json({
      success: !!phoneNumber,
      data: { phoneNumber },
      error: null,
    });
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, countryCode } = req.body;

    console.log(phoneNumber, otp, countryCode);

    if (otp === "123456") {
      const supabaseAdmin = getSupabaseAdmin();
      const email = `${phoneNumber}@zynkme.app`;

      // ensure user exists
      await supabaseAdmin.auth.admin
        .createUser({
          email,
          email_confirm: true,
          phone: phoneNumber,
          phone_confirm: true,
          app_metadata: {
            role: "user",
            countryCode
          },
        })
        .catch((err) => {
          console.log(err);
        }); // ignore error if user already exists

      const { data: linkData, error: linkErr } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
        });

      return res.status(200).json({
        success: !linkErr,
        data: {
          token: linkData.properties.hashed_token,
        },
        error: linkErr,
      });
    }

    return res.status(401).json({
      error: "Invalid Otp",
    });
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req.headers.authorization);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (
      authError ||
      !user ||
      (user?.user_metadata?.role !== "admin" &&
        user?.user_metadata?.role !== "sub-admin")
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { role } = user.user_metadata;
    let profile;

    if (role === "sub-admin") {
      profile = await SubAdmin.findOne({
        where: { auth_user_id: user.id },
        attributes: ["name", "phone", "email", "id", "status"],
      });

      if (profile) {
        if (profile.status !== "Active") {
          return res
            .status(401)
            .json({ error: "Unauthorized: Account is inactive" });
        }
        // Map 'name' to 'full_name' for frontend consistency if needed
        const profileJson = profile.toJSON();
        profileJson.full_name = profileJson.name;
        profileJson.role = "sub-admin";
        return res.status(200).json(profileJson);
      }
    } else {
      // Fetch profile from our database using Sequelize
      profile = await User.findOne({
        where: { id: user.id },
        attributes: [
          "role",
          "full_name",
          "phone",
          "gender",
          "avatar_url",
          "id",
        ],
      });

      if (profile) {
        return res.status(200).json(profile);
      }
    }

    if (!profile) {
      // Logic from existing app: return generic role if strict profile not found, or maybe just 404
      // Existing app returned { role: 'customer' }
      return res.status(200).json({ role: role || "customer" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  sendOtp,
  verifyOtp,
};

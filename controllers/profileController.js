const { getSupabaseClient } = require("../config/supabase");

const updateProfile = async (req, res) => {
    try {
        const supabase = getSupabaseClient(req.headers.authorization);
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const {
            fullName,
            gender,
            customGender,
            showGender,
            pronoun,
            customPronoun,
            showPronoun,
            dob,
            interestedIn,
            location,
            state,
            city,
            pinCode,
            avatar,
            interests,
            photos,
            bio,
            designation,
            instagram,
            linkedin,
            twitter,
            professionalDetails
        } = req.body;

        // 1. Update core profile in 'profiles' table
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: fullName,
                phone_number: user.phone,
                gender: gender,
                custom_gender: customGender,
                show_gender: showGender,
                pronoun: pronoun,
                custom_pronoun: customPronoun,
                show_pronoun: showPronoun,
                dob: dob,
                interested_in: interestedIn,
                location: location,
                state: state,
                city: city,
                pin_code: pinCode,
                avatar_url: avatar,
                interests: interests,
                bio: bio,
                designation: designation,
                updated_at: new Date()
            });

        if (profileError) throw profileError;

        // 2. Update socials in 'user_socials' table
        const { error: socialsError } = await supabase
            .from('user_socials')
            .upsert({
                user_id: user.id,
                instagram: instagram,
                linkedin: linkedin,
                twitter: twitter,
                updated_at: new Date()
            }, { onConflict: 'user_id' });

        if (socialsError) throw socialsError;

        // 3. Update professional details in 'professional_details' table
        if (professionalDetails) {
            const { error: profError } = await supabase
                .from('professional_details')
                .upsert({
                    user_id: user.id,
                    designation: professionalDetails.designation,
                    company: professionalDetails.company,
                    industry: professionalDetails.industry,
                    skills: professionalDetails.skills,
                    experience_years: professionalDetails.experience_years,
                    updated_at: new Date()
                }, { onConflict: 'user_id' });

            if (profError) throw profError;
        }

        // 4. Handle additional photos in 'profile_photos' table
        if (Array.isArray(photos)) {
            // ... (rest of photo logic remains same)
            await supabase
                .from('profile_photos')
                .delete()
                .eq('user_id', user.id);

            const photoEntries = photos
                .filter(url => !!url)
                .map((url, index) => ({
                    user_id: user.id,
                    photo_url: url,
                    display_order: index
                }));

            if (photoEntries.length > 0) {
                const { error: photosError } = await supabase
                    .from('profile_photos')
                    .insert(photoEntries);

                if (photosError) throw photosError;
            }
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const supabase = getSupabaseClient(req.headers.authorization);
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
                *,
                profile_photos (photo_url, display_order),
                user_socials (instagram, linkedin, twitter),
                professional_details (*)
            `)
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        return res.status(200).json(profile);

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    updateProfile,
    getMyProfile
};

import React, { useState, useEffect } from "react";


const Profile = ({userId}) => {

    const [userProfile, setUserProfile] = useState(null);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://localhost:3000/profile/${userId}`);
            const data = await response.json();
            console.log(data);
            setUserProfile(data);
        } catch (error) {
            console.error(error);
        }
    };
  
    fetchProfile(); //get profile info based on id given

    //show profile ui with info pertaining to the userId --> then they should be able to edit it
    return (
        <div>
            <h1>Profile</h1>
        </div>
    );
};

export default Profile;
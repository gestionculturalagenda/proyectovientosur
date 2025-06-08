import React, { useState } from 'react';
import ProfileView from '../components/profile/ProfileView';
import EditProfileForm from '../components/profile/EditProfileForm';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div>
      {isEditing ? (
        <EditProfileForm onCancel={() => setIsEditing(false)} />
      ) : (
        <ProfileView onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default ProfilePage;
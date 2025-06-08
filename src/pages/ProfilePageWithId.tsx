import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileView from '../components/profile/ProfileView';
import EditProfileForm from '../components/profile/EditProfileForm';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { userId, username } = useParams();

  return (
    <div>
      {isEditing ? (
        <EditProfileForm onCancel={() => setIsEditing(false)} />
      ) : (
        <ProfileView onEdit={() => setIsEditing(true)} userId={userId} username={username} />
      )}
    </div>
  );
};

export default ProfilePage;

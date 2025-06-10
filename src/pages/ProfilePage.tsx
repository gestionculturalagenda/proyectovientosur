import { useState } from 'react';
import ProfileView from '../components/profile/ProfileView';
import EditProfileForm from '../components/profile/EditProfileForm';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
      {isEditing ? (
        <EditProfileForm onCancel={() => setIsEditing(false)} />
      ) : (
        <ProfileView onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default ProfilePage;
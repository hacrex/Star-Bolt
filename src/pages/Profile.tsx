import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <p className="text-gray-400">
            Member since: {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
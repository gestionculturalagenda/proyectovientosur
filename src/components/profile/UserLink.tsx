import React from 'react';
import { Link } from 'react-router-dom';

interface UserLinkProps {
  username: string;
  avatarUrl: string;
  displayName?: string;
  size?: number;
}

export const UserLink: React.FC<UserLinkProps> = ({ username, avatarUrl, displayName, size = 32 }) => (
  <Link to={`/profile/${username}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
    <img
      src={avatarUrl || '/default-avatar.png'}
      alt={displayName || username}
      style={{ width: size, height: size, borderRadius: '50%', marginRight: 8 }}
    />
    <span>@{username}</span>
  </Link>
);

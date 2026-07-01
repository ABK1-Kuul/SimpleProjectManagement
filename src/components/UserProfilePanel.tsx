import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { AuthUser } from '../types';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  default: { bg: 'rgba(39,39,42,0.8)', text: '#a1a1aa', border: 'rgba(63,63,70,0.6)' },
};

function getRoleStyle(role: string) {
  return ROLE_COLORS[role] ?? ROLE_COLORS.default;
}

function getAvatarGradient(avatar: string) {
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  ];
  const idx = (avatar.charCodeAt(0) + (avatar.charCodeAt(1) || 0)) % gradients.length;
  return gradients[idx];
}

export default function UserProfilePanel({ isOpen, onClose }: UserProfilePanelProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleStyle = getRoleStyle(user.role);
  const avatarGradient = getAvatarGradient(user.avatar);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            id="profile-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 49,
            }}
          />

          {/* Panel */}
          <motion.div
            id="user-profile-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '60px',
              right: '16px',
              width: '280px',
              background: 'rgba(18, 18, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)',
              zIndex: 50,
              overflow: 'hidden',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* Top gradient bar */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
            }} />

            {/* User info section */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: avatarGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                }}>
                  {user.avatar}
                </div>

                {/* Name + email */}
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#f4f4f5',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user.displayName}
                  </p>
                  <p style={{
                    margin: '2px 0 0',
                    fontSize: '12px',
                    color: '#52525b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role badge */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: roleStyle.bg,
                  border: `1px solid ${roleStyle.border}`,
                  color: roleStyle.text,
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  {user.role}
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#86efac',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 6px #4ade80',
                    flexShrink: 0,
                  }} />
                  Online
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

            {/* Info rows */}
            <div style={{ padding: '12px 20px' }}>
              <InfoRow
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                }
                label="Username"
                value={`@${user.username}`}
              />
              <InfoRow
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                }
                label="Access Level"
                value="Full Access"
              />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

            {/* Sign out */}
            <div style={{ padding: '12px' }}>
              <motion.button
                id="sign-out-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s, border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.14)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.15)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '6px 0',
    }}>
      <span style={{ color: '#52525b', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '12px', color: '#52525b', minWidth: '80px' }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#a1a1aa', marginLeft: 'auto' }}>{value}</span>
    </div>
  );
}


import React from 'react';

// Base props for all icons
type IconProps = {
  className?: string;
};

// Generic icon component structure
const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({ className = 'w-6 h-6', children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {children}
  </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.35,11.1H12.9V1.43a.79.79,0,0,0-.8-.79H11.31a.79.79,0,0,0-.79.79v9.67H1.84a.79.79,0,0,0-.79.79v.79a.79.79,0,0,0,.79.79h8.68V22.57a.79.79,0,0,0,.79.79h.79a.79.79,0,0,0,.79-.79V13.47h8.45a.79.79,0,0,0,.79-.79v-.79A.79.79,0,0,0,21.35,11.1Z" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </Icon>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </Icon>
);

export const MenuIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Icon>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </Icon>
);

export const UploadIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </Icon>
);

export const AiIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </Icon>
);

export const SolutionIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Icon>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <Icon className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </Icon>
);

export const RainIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path d="M18 10a4 4 0 10-8 0c0 2.21 1.79 4 4 4s4-1.79 4-4zM12 16v1m0 3v1m-4-3v1m0 3v1m8-3v1m0 3v1"/></Icon>
);

export const CloudyIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path d="M17.5 16a4.5 4.5 0 100-9h-1.8a8 8 0 10-15.4 3.3A5.5 5.5 0 109.5 22h8a5 5 0 000-10z"/></Icon>
);

export const ThunderstormIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path d="M11 14v6l3-3-3-3zM11.5 3.5a8 8 0 00-5.3 13.2A5.5 5.5 0 1014.5 22h-3a5 5 0 000-10h1.2a8 8 0 00-1.2-8.5z"/></Icon>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);

export const PendingIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></Icon>
);

export const BookmarkIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></Icon>
);

export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></Icon>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></Icon>
);

export const FeedbackIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></Icon>
);

export const CallIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></Icon>
);

export const MapIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m-6 3l6-3m0 0l-6 3m6-3v10" /></Icon>
);

export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></Icon>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></Icon>
);

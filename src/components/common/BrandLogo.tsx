import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface BrandLogoProps {
  logoUrl?: string | null;
  siteName: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { box: 'h-9 w-9 rounded-lg', icon: 'h-5 w-5' },
  lg: { box: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  siteName,
  size = 'sm',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const trimmed = logoUrl?.trim();
  const dims = SIZE_MAP[size];

  if (trimmed && !imgError) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-paper ring-1 ring-line/70 ${dims.box}`}
      >
        <img
          src={trimmed}
          alt={`Logo ${siteName}`}
          onError={() => setImgError(true)}
          className="h-full w-full object-contain p-0.5"
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-accent text-white ${dims.box}`}
    >
      <Compass className={dims.icon} />
    </span>
  );
};

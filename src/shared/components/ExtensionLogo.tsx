/**
 * Extension Logo Component - Uses app config from defaults.json with Header Variant Support
 * @module @voilajsx/comet
 * @file src/shared/components/ExtensionLogo.tsx
 */

import React, { useState, useEffect } from 'react';
import { Zap, Star, Shield, Rocket, Heart, Globe, Settings, FileText, Quote, Home } from 'lucide-react';
import { storage } from '@voilajsx/comet/storage';

// Icon mapping for string-based icons
const ICON_MAP = {
  Zap,
  Star,
  Shield, 
  Rocket,
  Heart,
  Globe,
  Settings,
  FileText,
  Quote,
  Home
};

interface ExtensionLogoProps {
  name?: string;
  icon?: React.ComponentType<{ className?: string }> | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact' | 'minimal';
  headerVariant?: 'default' | 'primary' | 'black'; // NEW: Header context for adaptive styling
  showIcon?: boolean;
  showName?: boolean;
  className?: string;
  // Override props (if provided, skip loading from storage)
  overrideName?: string;
  overrideIcon?: string;
}

/**
 * Extension logo component with app config integration and header variant awareness
 */
export default function ExtensionLogo({
  name,
  icon,
  size = 'md',
  variant = 'default',
  headerVariant = 'default',
  showIcon = true,
  showName = true,
  className = '',
  overrideName,
  overrideIcon
}: ExtensionLogoProps) {
  const [appName, setAppName] = useState(name || 'Comet Extension');
  const [appIcon, setAppIcon] = useState<React.ComponentType<{ className?: string }>>(Zap);
  const [loading, setLoading] = useState(!overrideName && !overrideIcon);

  // Load app configuration from storage
  useEffect(() => {
    if (overrideName && overrideIcon) {
      setAppName(overrideName);
      setAppIcon(ICON_MAP[overrideIcon] || Zap);
      setLoading(false);
      return;
    }

    loadAppConfig();
  }, [overrideName, overrideIcon]);

  const loadAppConfig = async () => {
    try {
      const configName = await storage.get('app-name', 'Comet Extension');
      const configIcon = await storage.get('app-icon', 'Zap');

      setAppName(name || configName);
      setAppIcon(
        typeof icon === 'string' 
          ? ICON_MAP[icon] || Zap
          : icon || ICON_MAP[configIcon] || Zap
      );
    } catch (error) {
      console.warn('[ExtensionLogo] Failed to load app config:', error);
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      iconBox: 'w-6 h-6',
      text: 'text-sm'
    },
    md: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      iconBox: 'w-8 h-8',
      text: 'text-base'
    },
    lg: {
      container: 'gap-3',
      icon: 'w-5 h-5',
      iconBox: 'w-10 h-10',
      text: 'text-lg'
    },
    xl: {
      container: 'gap-3',
      icon: 'w-6 h-6',
      iconBox: 'w-12 h-12',
      text: 'text-xl'
    }
  };

  // Header-aware variant styling
  const getVariantClasses = () => {
    // Base variant styling
    const baseVariants = {
      default: {
        iconBox: 'bg-primary text-primary-foreground rounded-lg',
        text: 'text-foreground'
      },
      compact: {
        iconBox: 'bg-primary/10 text-primary rounded-md',
        text: 'text-foreground'
      },
      minimal: {
        iconBox: 'bg-muted text-muted-foreground rounded',
        text: 'text-muted-foreground'
      }
    };

    // Header variant overrides
    if (headerVariant === 'primary') {
      return {
        default: {
          iconBox: 'bg-white text-primary rounded-lg',
          text: 'text-white'
        },
        compact: {
          iconBox: 'bg-white/20 text-white rounded-md',
          text: 'text-white'
        },
        minimal: {
          iconBox: 'bg-white/10 text-white rounded',
          text: 'text-white/80'
        }
      }[variant];
    }

    if (headerVariant === 'black') {
      return {
        default: {
          iconBox: 'bg-white text-black rounded-lg',
          text: 'text-white'
        },
        compact: {
          iconBox: 'bg-white/20 text-white rounded-md',
          text: 'text-white'
        },
        minimal: {
          iconBox: 'bg-white/10 text-white rounded',
          text: 'text-white/80'
        }
      }[variant];
    }

    // Default header variant
    return baseVariants[variant];
  };

  const classes = sizeClasses[size];
  const variantClasses = getVariantClasses();
  const IconComponent = appIcon;

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center ${classes.container} ${className}`}>
        {showIcon && (
          <div className={`flex items-center justify-center ${classes.iconBox} ${variantClasses.iconBox} animate-pulse`}>
            <div className={classes.icon} />
          </div>
        )}
        {showName && (
          <div className={`${classes.text} bg-muted animate-pulse rounded w-24 h-5`} />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${classes.container} ${className}`}>
      {/* Icon Container */}
      {showIcon && (
        <div className={`flex items-center justify-center ${classes.iconBox} ${variantClasses.iconBox}`}>
          <IconComponent className={classes.icon} />
        </div>
      )}

      {/* Extension Name */}
      {showName && (
        <span className={`font-semibold ${variantClasses.text} ${classes.text}`}>
          {appName}
        </span>
      )}
    </div>
  );
}
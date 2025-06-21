/**
 * Enhanced Options Wrapper - Storage-based Variants with UIKit Prop Drilling
 * @module @voilajsx/comet
 * @file src/shared/layouts/OptionsWrapper.tsx
 */

import React, { useState, useEffect } from 'react';
import { PageLayout, PageHeader, PageContent, PageFooter } from '@voilajsx/uikit/page';
import { Container } from '@voilajsx/uikit/container';
import { Button } from '@voilajsx/uikit/button';
import { Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

// Import platform APIs and hooks
import { storage } from '@voilajsx/comet/storage';
import { messaging } from '@voilajsx/comet/messaging';
import useModuleDiscovery from '@/shared/hooks/useModuleDiscovery';

// Import shared components
import ExtensionLogo from '@/shared/components/ExtensionLogo';
import GeneralSettingsPanel from '@/shared/components/GeneralSettingsPanel';
import ExtensionFooter from '@/shared/components/ExtensionFooter';

/**
 * Dynamic Options Panel Renderer
 */
function DynamicOptionsPanel({ moduleName }) {
  const [PanelComponent, setPanelComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPanelComponent();
  }, [moduleName]);

  const loadPanelComponent = async () => {
    try {
      setLoading(true);
      
      let componentModule;
      const folderName = moduleName.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      try {
        componentModule = await import(`../../features/${folderName}/components/OptionsPanel.tsx`);
      } catch (error) {
        componentModule = await import(`../../features/${moduleName}/components/OptionsPanel.tsx`);
      }
      
      setPanelComponent(() => componentModule.default);
    } catch (error) {
      console.error(`Failed to load options panel for ${moduleName}:`, error);
      setPanelComponent(() => () => (
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-sm">Options panel not available for {moduleName}</div>
        </div>
      ));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">Loading {moduleName} panel...</div>
      </div>
    );
  }

  return PanelComponent ? <PanelComponent /> : null;
}

interface OptionsWrapperProps {
  // Override props (if provided, skip loading from storage)
  customLogo?: React.ReactNode;
  customActions?: React.ReactNode;
  customFooter?: React.ReactNode;
  
  // Callbacks
  onSave?: () => void;
  onReset?: () => void;
  
  // Force overrides (bypass storage)
  forceVariant?: 'default' | 'minimal' | 'contained';
  forceSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Auto-discovery options wrapper with storage-based configuration
 */
export default function OptionsWrapper({
  customLogo,
  customActions,
  customFooter,
  onSave,
  onReset,
  forceVariant,
  forceSize
}: OptionsWrapperProps = {}) {
  const [saveResult, setSaveResult] = useState(null);
  const [layoutConfig, setLayoutConfig] = useState({
    variant: 'default',
    size: 'full'
  });
  const [configLoading, setConfigLoading] = useState(true);

  // Auto-discover modules and generate navigation
  const { optionsNavigation, loading } = useModuleDiscovery();

  // Load layout configuration from storage
  useEffect(() => {
    console.log('[OptionsWrapper] useEffect triggered', { forceVariant, forceSize });
    
    if (forceVariant || forceSize) {
      console.log('[OptionsWrapper] Using forced config');
      setLayoutConfig({
        variant: forceVariant || 'default',
        size: forceSize || 'full'
      });
      setConfigLoading(false);
    } else {
      console.log('[OptionsWrapper] Loading config from storage');
      loadLayoutConfig();
    }
  }, [forceVariant, forceSize]);

  const loadLayoutConfig = async () => {
    try {
      console.log('[OptionsWrapper] Loading layout config from defaults.js...');
      
      // Wait for storage to be fully initialized
      await storage.initialize();
      
      const variant = await storage.get('options-variant', 'default');
      const size = await storage.get('options-size', 'full');
      
      console.log('[OptionsWrapper] Raw storage values:', {
        variant,
        size,
        variantType: typeof variant,
        sizeType: typeof size
      });
      
      // Check what's actually in storage
      const allDefaults = storage.getDefaults();
      console.log('[OptionsWrapper] Current defaults in storage:', allDefaults);
      
      setLayoutConfig({ variant, size });
      
      console.log('[OptionsWrapper] Applied layout config:', JSON.stringify({ variant, size }));
    } catch (error) {
      console.error('[OptionsWrapper] Failed to load layout config:', error);
      // Use fallback values
      setLayoutConfig({ variant: 'default', size: 'full' });
    } finally {
      setConfigLoading(false);
    }
  };

  // Auto-dismiss status after 3 seconds
  useEffect(() => {
    if (saveResult) {
      const timer = setTimeout(() => setSaveResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveResult]);

  // Enhanced scroll to section with proper header offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Approximate sticky header height
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle save all settings
  const saveAllSettings = async () => {
    if (onSave) {
      onSave();
      return;
    }

    try {
      await messaging.sendToBackground({
        type: 'settingsUpdated',
        data: { timestamp: Date.now() }
      });
      
      setSaveResult({
        type: 'success',
        message: 'Saved'
      });
    } catch (error) {
      console.warn('Could not notify background script:', error);
      setSaveResult({
        type: 'success',
        message: 'Saved'
      });
    }
  };

  // Handle reset all settings
  const resetAllSettings = async () => {
    if (onReset) {
      onReset();
      return;
    }

    try {
      setSaveResult({ type: 'success', message: 'Resetting...' });

      // Clear ALL storage
      await storage.clear();
      
      // Get fresh defaults and set them
      const defaults = storage.getDefaults();
      for (const [key, value] of Object.entries(defaults)) {
        await storage.set(key, value);
      }

      setSaveResult({ type: 'success', message: 'Reset complete - reloading...' });

      // Reload page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('[Options] Reset failed:', error);
      setSaveResult({ type: 'error', message: 'Reset failed' });
    }
  };

  // Get variant-specific styling configs with inline styles
  const getVariantConfig = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          logoVariant: 'default',
          buttonStyle: 'secondary',
          resetButtonStyle: 'outline',
          statusColor: {
            success: 'text-white',
            error: 'text-red-200'
          },
          headerStyle: {} // UIKit handles primary
        };
      case 'black':
        return {
          logoVariant: 'compact',
          buttonStyle: 'outline',
          resetButtonStyle: 'ghost',
          statusColor: {
            success: 'text-white',
            error: 'text-red-400'
          },
          headerStyle: {
            backgroundColor: '#000000',
            color: '#ffffff',
            borderColor: '#000000'
          }
        };
      default: // 'default' and others
        return {
          logoVariant: 'default',
          buttonStyle: 'default',
          resetButtonStyle: 'outline',
          statusColor: {
            success: 'text-green-600',
            error: 'text-destructive'
          },
          headerStyle: {
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            borderColor: 'hsl(var(--border))'
          }
        };
    }
  };

  const variantConfig = getVariantConfig(layoutConfig.variant);

  // Debug logging for variant config  
  console.log('[OptionsWrapper] Current layout config:', JSON.stringify(layoutConfig));
  console.log('[OptionsWrapper] Computed variant config:', JSON.stringify(variantConfig));

  // Generate header actions with variant-aware styling
  const headerActions = customActions || (
    <div className="flex items-center gap-3">
      {/* Status Text */}
      {saveResult && (
        <div className="flex items-center gap-2">
          {saveResult.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <span className={`text-sm font-medium ${variantConfig.statusColor[saveResult.type]}`}>
            {saveResult.message}
          </span>
        </div>
      )}
      
      {/* Action Buttons - Variant-aware styling */}
      <Button
        variant={variantConfig.resetButtonStyle}
        onClick={resetAllSettings}
        size="sm"
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset All
      </Button>
      
      <Button
        variant={variantConfig.buttonStyle}
        onClick={saveAllSettings}
        size="sm"
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save All
      </Button>
    </div>
  );

  // Generate logo with variant-aware styling
  const logo = customLogo || (
    <ExtensionLogo 
      overrideName="Settings"
      size="lg"
      variant={variantConfig.logoVariant}
      headerVariant={layoutConfig.variant} // Pass header variant for adaptive styling
    />
  );

  // Generate enhanced navigation with proper scroll handlers
  const enhancedNavigation = optionsNavigation.map(item => ({
    ...item,
    onClick: () => scrollToSection(item.key)
  }));

  // Render panel content with proper spacing for sticky header
  const renderPanelContent = () => {
    return (
      <div className="max-w-4xl">
        <div className="space-y-12 pt-4">
          {/* General Settings Section */}
          <section id="general" className="scroll-mt-20">
            <GeneralSettingsPanel />
          </section>

          {/* Auto-generated feature sections */}
          {optionsNavigation
            .filter(item => item.key !== 'general')
            .map(item => (
              <section key={item.key} id={item.key} className="scroll-mt-20">
                <DynamicOptionsPanel moduleName={item.key} />
              </section>
            ))}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || configLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageLayout variant="default" size="full">
          <PageContent>
            <div className="p-8 text-center text-muted-foreground">
              <div className="text-sm">Loading options...</div>
            </div>
          </PageContent>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* UIKit handles prop drilling automatically */}
      <PageLayout variant={layoutConfig.variant} size={layoutConfig.size}>
        
        {/* Header - explicit variant with inline style override */}
        <PageHeader 
          variant={layoutConfig.variant} 
          sticky={true}
          style={variantConfig.headerStyle}
        >
          <div className="flex items-center justify-between w-full">
            {logo}
            {headerActions}
          </div>
        </PageHeader>

        {/* Content - inherits variant and size from PageLayout */}
        <PageContent className="py-6">
          <Container 
            sidebar="left"
            sidebarContent={enhancedNavigation}
            sidebarSticky={true}
            size="full"
          >
            {renderPanelContent()}
          </Container>
        </PageContent>

        {/* Footer - explicit variant to ensure styling */}
        <PageFooter variant={layoutConfig.variant} className="bg-card border-0">
          {customFooter || (
            <ExtensionFooter 
              variant="compact" 
              useStorageContent={true}
            />
          )}
        </PageFooter>
        
      </PageLayout>
    </div>
  );
}
/**
 * Comet Framework - User Card Component
 * Simple user profile display with logout functionality
 * @module @voilajsx/comet
 * @file src/components/auth/UserCard.tsx
 */

import { Button } from '@voilajsx/uikit/button';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Avatar, AvatarImage, AvatarFallback } from '@voilajsx/uikit/avatar';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth, useUserDisplayName } from '@/hooks/useAuth';

interface UserCardProps {
  onLogout?: () => void;
  showCard?: boolean;
  className?: string;
}

/**
 * Simple User Card Component
 * Shows user info with logout - minimal but essential
 */
export default function UserCard({
  onLogout,
  showCard = true,
  className = ''
}: UserCardProps) {
  const { user, logout, isLoading } = useAuth();
  const displayName = useUserDisplayName();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };



  const fallbackAvatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${displayName || "user"}`
  const userContent = (
    <div className="flex items-center justify-between">
      {/* User info */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={user?.avatar || fallbackAvatar}
            alt={displayName}
          />
          <AvatarFallback>{displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="font-medium text-sm">{displayName}</div>
          {user?.email && (
            <div className="text-xs text-muted-foreground">{user.email}</div>
          )}
        </div>
      </div>

      {/* Logout button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  if (showCard) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          {userContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {userContent}
    </div>
  );
}
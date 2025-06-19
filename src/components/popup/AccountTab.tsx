/**
 * Comet Framework - Account tab component for popup
 * Handles authentication and user management
 * @module @voilajsx/comet
 * @file src/components/popup/AccountTab.tsx
 */
import { TabsContent } from '@voilajsx/uikit/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import UserCard from '@/components/auth/UserCard';

interface AccountTabProps {
  value: string;
}

export default function AccountTab({ value }: AccountTabProps) {
  const { isAuthenticated } = useAuth();

  return (
    <TabsContent value={value} className="mt-0">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            {isAuthenticated ? 'Account' : 'Sign In'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <UserCard showCard={false} />
          ) : (
            <LoginForm 
              showCard={false}
              title=""
              subtitle="Sign in to access personalized features"
            />
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
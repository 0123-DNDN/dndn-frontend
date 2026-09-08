import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/auth';
import type { User } from '@/types/user';

export function useAuth() { const [user, setUser] = useState<User | null>(null); useEffect(() => { void getCurrentUser().then(setUser); }, []); return { user, isLoading: false }; }

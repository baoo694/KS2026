import { getUser } from '@/lib/actions/auth';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const user = await getUser();
  
  return <HeaderClient user={user} />;
}

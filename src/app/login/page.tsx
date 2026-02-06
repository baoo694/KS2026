import { AuthForm } from '@/components/auth/AuthForm';
import { signIn } from '@/lib/actions/auth';

export const metadata = {
  title: 'Sign In | PhenikaaQuizz',
  description: 'Sign in to your PhenikaaQuizz account',
};

export default function LoginPage() {
  return <AuthForm type="login" action={signIn} />;
}

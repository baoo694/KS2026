import { AuthForm } from '@/components/auth/AuthForm';
import { signUp } from '@/lib/actions/auth';

export const metadata = {
  title: 'Sign Up | PhenikaaQuizz',
  description: 'Create your PhenikaaQuizz account',
};

export default function RegisterPage() {
  return <AuthForm type="register" action={signUp} />;
}

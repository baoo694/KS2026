import { AuthForm } from '@/components/auth/AuthForm';
import { forgotPassword } from '@/lib/actions/auth';

export const metadata = {
  title: 'Forgot Password | PhenikaaQuizz',
  description: 'Reset your PhenikaaQuizz password',
};

export default function ForgotPasswordPage() {
  return <AuthForm type="forgot-password" action={forgotPassword} />;
}

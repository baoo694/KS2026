import { AuthForm } from '@/components/auth/AuthForm';
import { resetPassword } from '@/lib/actions/auth';

export const metadata = {
  title: 'Reset Password | PhenikaaQuizz',
  description: 'Set a new password for your PhenikaaQuizz account',
};

export default function ResetPasswordPage() {
  return <AuthForm type="reset-password" action={resetPassword} />;
}

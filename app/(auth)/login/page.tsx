import { LoginForm } from './components/login-form'

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Family Tree</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
    </div>
  )
}

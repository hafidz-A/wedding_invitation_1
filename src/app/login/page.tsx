import LoginForm from './LoginForm'

/**
 * /login — slug-agnostic password login.
 *
 * User enters email + password. We sign them in via Supabase Auth,
 * then look up which invitation they own and redirect to that dashboard.
 *
 * Compared to /<slug>/dashboard's LoginForm: this one doesn't need
 * the user to remember their slug — useful when they bookmarked the
 * landing page but forgot which couple slug they registered with.
 */
export default function LoginPage() {
  return <LoginForm />
}

import SignupForm from './SignupForm'

/**
 * Public signup page. Renders the email + password + repeat form.
 *
 * Flow:
 *   1. User submits form → client calls supabase.auth.signUp().
 *   2. Supabase sends a verification email to the address (configured in
 *      Supabase Dashboard → Authentication → Email Templates).
 *   3. User clicks the link → Supabase verifies → redirects to /onboarding.
 *   4. /onboarding shows the 5-field wizard, then creates the invitation
 *      row and redirects to /<slug>/dashboard.
 */
export default function SignupPage() {
  return <SignupForm />
}

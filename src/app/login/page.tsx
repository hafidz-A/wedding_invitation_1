import SignupForm from '../signup/SignupForm'

/**
 * /login — slug-agnostic OTP login.
 *
 * Same OTP flow as /signup (email → kode 6 digit → /onboarding) — the
 * difference is purely copy. /onboarding is idempotent: it redirects
 * returning users straight to /<slug>/dashboard without re-asking
 * for the 5 basic fields.
 *
 * Users who DO know their slug + password can still go directly to
 * /<slug>/dashboard for the classic password login.
 */
export default function LoginPage() {
  return <SignupForm variant="login" />
}

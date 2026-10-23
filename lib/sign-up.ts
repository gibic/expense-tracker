type SignUpPolicy = {
  /** ALLOW_SIGN_UP=true: anyone may sign up. */
  allowSignUp: boolean
  /** OWNER_EMAIL: the only email that may create the first account. */
  ownerEmail: string | undefined
  accountExists: boolean
}

/**
 * Whether `email` may create an account. Without ALLOW_SIGN_UP, only the owner
 * may sign up, and only while no account exists. `user.email` is unique, so
 * concurrent sign-ups with the owner email cannot both succeed.
 */
export function canSignUp(email: string, policy: SignUpPolicy) {
  if (policy.allowSignUp) return true
  if (policy.accountExists || !policy.ownerEmail) return false
  return normalize(email) === normalize(policy.ownerEmail)
}

function normalize(email: string) {
  return email.trim().toLowerCase()
}

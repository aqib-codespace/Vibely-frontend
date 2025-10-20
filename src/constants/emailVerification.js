export const EMAIL_VERIFICATION_MESSAGES = {
  VERIFICATION_SENT:
    "Verification email sent successfully! Please check your inbox.",
  VERIFICATION_RESENT:
    "Verification email resent successfully! Please check your inbox.",
  EMAIL_ALREADY_VERIFIED: "This email address is already verified.",
  INVALID_TOKEN:
    "Invalid or expired verification token. Please request a new verification email.",
  VERIFICATION_SUCCESS:
    "Email verified successfully! You can now sign in to your account.",
  EMAIL_REQUIRED: "Please enter your email address.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
  CHECK_SPAM: "Please check your spam/junk folder if you don't see the email.",
  TOKEN_EXPIRED: "Verification link has expired. Please request a new one.",
  VERIFICATION_FAILED:
    "Email verification failed. Please try again or request a new verification email.",
};

export const EMAIL_VERIFICATION_CONFIG = {
  RESEND_TIMER: 60, // seconds
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

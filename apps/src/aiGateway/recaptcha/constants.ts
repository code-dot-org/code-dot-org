// A legacy (classic) v3 key; its domains are configured in the reCAPTCHA admin.
export const RECAPTCHA_SITE_KEY = '6LfgKhEuAAAAAK3aziLuSMwcBHLu9J_1IZZa-IYk';
export const RECAPTCHA_SCRIPT_URL = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
// The worker should require this action, so a token minted for another
// purpose on our domains is refused.
export const RECAPTCHA_ACTION = 'ai_gateway';
// execute() normally answers in well under a second; this bounds a stuck one.
export const RECAPTCHA_TIMEOUT_FLAG = 'ai-gateway-recaptcha-timeout-seconds';
export const DEFAULT_RECAPTCHA_TIMEOUT_SECONDS = 30;

export const LOG = '🔵 [reCAPTCHA]';

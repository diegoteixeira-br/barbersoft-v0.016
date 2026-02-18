import { useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6LeYZm8sAAAAAFfRNVMCPkvyJnX-MWtw3-0_gvMT';

export { RECAPTCHA_SITE_KEY };

export function useRecaptchaV2() {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const getToken = useCallback((): string | null => {
    return recaptchaRef.current?.getValue() || null;
  }, []);

  const resetRecaptcha = useCallback(() => {
    recaptchaRef.current?.reset();
  }, []);

  return { recaptchaRef, getToken, resetRecaptcha };
}

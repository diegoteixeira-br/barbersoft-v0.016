import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha';
import React from 'react';

interface RecaptchaWidgetProps {
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  onChange?: (token: string | null) => void;
}

export function RecaptchaWidget({ recaptchaRef, onChange }: RecaptchaWidgetProps) {
  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={onChange}
        theme="dark"
      />
    </div>
  );
}

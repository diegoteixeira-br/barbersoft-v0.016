import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, phone, email, subject, message, recaptchaToken } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Todos os campos obrigatórios devem ser preenchidos" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({ error: "Verificação reCAPTCHA necessária" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify reCAPTCHA v2 token
    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", recaptchaToken);

    const recaptchaResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const recaptchaResult = await recaptchaResponse.json();
    console.log("reCAPTCHA v2 verification result:", JSON.stringify(recaptchaResult));

    if (!recaptchaResult.success) {
      console.error("reCAPTCHA verification failed:", recaptchaResult["error-codes"]);
      return new Response(
        JSON.stringify({ error: "Verificação de segurança falhou. Tente novamente." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Contact form submission verified successfully:", {
      name, phone, email, subject, messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Mensagem enviada com sucesso! Retornaremos em breve." }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor. Tente novamente mais tarde." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

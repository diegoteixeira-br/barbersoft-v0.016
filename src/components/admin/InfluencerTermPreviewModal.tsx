import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Send, Download, Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { InfluencerPartnership } from "@/hooks/useInfluencerPartnerships";
import { generateInfluencerTermPDF } from "@/utils/generateInfluencerTermPDF";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencer: InfluencerPartnership | null;
  termTemplate: { title: string; content: string; version: string } | null;
}

export function InfluencerTermPreviewModal({ open, onOpenChange, influencer, termTemplate }: Props) {
  const [sending, setSending] = useState(false);

  if (!influencer || !termTemplate) return null;

  const rawContent = termTemplate.content
    .replace(/\{PERCENTUAL\}/g, String(influencer.commission_percent))
    .replace(/\{NOME_INFLUENCIADOR\}/g, influencer.name)
    .replace(/\{DATA\}/g, new Date().toLocaleDateString("pt-BR"));

  const sanitizedContent = DOMPurify.sanitize(rawContent.replace(/\n/g, '<br/>'), {
    ALLOWED_TAGS: ['br', 'b', 'i', 'u', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: []
  });

  const handleSendEmail = async () => {
    if (!influencer.email) {
      toast({ title: "Influenciador não possui email cadastrado", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-influencer-term", {
        body: { influencer_id: influencer.id },
      });
      if (error) throw error;
      toast({ title: "Email enviado com sucesso!", description: `Enviado para ${influencer.email}` });
    } catch (err: any) {
      toast({ title: "Erro ao enviar email", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    generateInfluencerTermPDF(influencer, termTemplate.content, termTemplate.title);
  };

  const termAccepted = !!(influencer as any).term_accepted_at;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-orange-400" />
            {termTemplate.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Versão {termTemplate.version} • Influenciador: <strong className="text-slate-300">{influencer.name}</strong>
            {termAccepted && (
              <span className="ml-2 text-green-400 font-medium">✓ Aceito</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-lg border border-slate-600 bg-slate-900/50 p-4">
          <div
            className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </ScrollArea>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" /> Baixar PDF
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={sending || !influencer.email}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {sending ? "Enviando..." : "Enviar por Email"}
          </Button>
        </div>

        {!influencer.email && (
          <p className="text-xs text-yellow-400 text-center">
            ⚠️ Cadastre o email do influenciador para enviar por email.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

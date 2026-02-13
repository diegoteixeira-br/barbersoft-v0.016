import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfluencerPartnership } from "@/hooks/useInfluencerPartnerships";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencer?: InfluencerPartnership | null;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function InfluencerFormModal({ open, onOpenChange, influencer, onSubmit, isLoading }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [percent, setPercent] = useState("1");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (influencer) {
      setName(influencer.name);
      setEmail(influencer.email || "");
      setPhone(influencer.phone || "");
      setInstagram(influencer.instagram_handle || "");
      setPercent(String(influencer.commission_percent));
      setStatus(influencer.status);
      setNotes(influencer.notes || "");
    } else {
      setName(""); setEmail(""); setPhone(""); setInstagram("");
      setPercent("1"); setStatus("active"); setNotes("");
    }
  }, [influencer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email: email || null,
      phone: phone || null,
      instagram_handle: instagram || null,
      commission_percent: Number(percent),
      status,
      notes: notes || null,
      ...(influencer ? { id: influencer.id } : { started_at: new Date().toISOString() }),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{influencer ? "Editar" : "Novo"} Influenciador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="bg-slate-700 border-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="bg-slate-700 border-slate-600" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-slate-700 border-slate-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Instagram</Label>
              <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" className="bg-slate-700 border-slate-600" />
            </div>
            <div>
              <Label>Comissão (%)</Label>
              <Select value={percent} onValueChange={setPercent}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1%</SelectItem>
                  <SelectItem value="1.5">1.5%</SelectItem>
                  <SelectItem value="2">2%</SelectItem>
                  <SelectItem value="2.5">2.5%</SelectItem>
                  <SelectItem value="3">3%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="ended">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-slate-700 border-slate-600" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">Cancelar</Button>
            <Button type="submit" disabled={isLoading || !name}>
              {influencer ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

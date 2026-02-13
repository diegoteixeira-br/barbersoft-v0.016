import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { InfluencerPayment } from "@/hooks/useInfluencerPartnerships";

interface Props {
  payments: InfluencerPayment[];
  onMarkAsPaid: (payment: InfluencerPayment) => void;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function InfluencerPaymentsTable({ payments, onMarkAsPaid }: Props) {
  if (!payments.length) {
    return <p className="text-sm text-slate-400 py-4 text-center">Nenhum pagamento registrado.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-300">Período</TableHead>
          <TableHead className="text-slate-300">MRR Base</TableHead>
          <TableHead className="text-slate-300">%</TableHead>
          <TableHead className="text-slate-300">Valor</TableHead>
          <TableHead className="text-slate-300">Status</TableHead>
          <TableHead className="text-slate-300">Pago em</TableHead>
          <TableHead className="text-slate-300">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => {
          const s = statusMap[p.status] || statusMap.pending;
          return (
            <TableRow key={p.id} className="border-slate-700">
              <TableCell className="text-slate-200">
                {format(new Date(p.period_start), "MMM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-slate-200">
                R$ {Number(p.mrr_base).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-slate-200">{p.commission_percent}%</TableCell>
              <TableCell className="text-green-400 font-medium">
                R$ {Number(p.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Badge variant={s.variant}>{s.label}</Badge>
              </TableCell>
              <TableCell className="text-slate-200">
                {p.paid_at ? format(new Date(p.paid_at), "dd/MM/yyyy") : "—"}
              </TableCell>
              <TableCell>
                {p.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => onMarkAsPaid(p)} className="border-slate-600 text-slate-200">
                    <CheckCircle className="h-4 w-4 mr-1" /> Pagar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}


ALTER TABLE public.automation_logs
  DROP CONSTRAINT automation_logs_client_id_fkey;

ALTER TABLE public.automation_logs
  ADD CONSTRAINT automation_logs_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

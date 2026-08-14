-- Applications keep the vacancy they were submitted against.
--
-- The dashboard read the vacancy name through a live join, so renaming or
-- repurposing a job silently relabelled every CV already received against it.
-- The title is now snapshotted onto the application row. A trigger owns the
-- value so it is always read from the jobs table and can never be spoofed by a
-- client posting straight at the REST endpoint.

alter table public.applications
  add column if not exists job_title text;

update public.applications as a
set job_title = j.title
from public.jobs as j
where a.job_id = j.id
  and a.job_title is null;

create or replace function public.set_application_job_title()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select j.title into new.job_title
  from public.jobs as j
  where j.id = new.job_id;
  return new;
end;
$$;

-- The function only ever runs as a trigger, so it is not left callable as an
-- RPC endpoint. Triggers check this privilege when they are created, not when
-- they fire, so visitor submissions still populate the title.
revoke execute on function public.set_application_job_title()
  from anon, authenticated, public;

drop trigger if exists applications_set_job_title on public.applications;

create trigger applications_set_job_title
before insert or update of job_id on public.applications
for each row execute function public.set_application_job_title();

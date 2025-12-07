-- Create address table
create table public.address (
  id uuid not null default gen_random_uuid (),
  application_id uuid not null,
  street_address text null,
  city text null,
  state text null,
  postcode text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint address_pkey primary key (id),
  constraint address_application_id_fkey foreign KEY (application_id) references applications (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create index on application_id for faster queries
create index IF not exists idx_address_application_id on public.address using btree (application_id) TABLESPACE pg_default;

-- Create trigger to update the updated_at timestamp
create trigger update_address_updated_at BEFORE
update on address for EACH row
execute FUNCTION update_updated_at_column ();

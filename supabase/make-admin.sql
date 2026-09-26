-- Make an account a JumRok admin.
--
-- Nobody can become an admin from the app, so the first one is set here.
--
-- 1. Create the account (either way works):
--    a) Supabase Dashboard > Authentication > Users > Add user > Create new
--       user: enter the email and a password, and tick "Auto Confirm User"
--       (no confirmation email needed). Or:
--    b) Sign up normally in the app.
--
-- 2. Put that email below, then SQL Editor > New query > paste > Run.
--
-- 3. Log in at /login with that account: you land on /admin.
--
-- Later admins can be promoted the same way, or by an existing admin with
-- admin_set_user_role().

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@example.com'  -- <- change me
);

-- Check it worked (should show role = admin):
select p.full_name, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';

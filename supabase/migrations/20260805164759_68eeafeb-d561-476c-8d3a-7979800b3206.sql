INSERT INTO public.site_settings (key, value)
VALUES ('payments', jsonb_build_object(
  'pay_link', 'https://selcompay.me/70048280',
  'till_number', '70048280',
  'merchant_name', 'MELCHIZEDECK TWISA K',
  'tips_qr', '000201010211041552545429990002026390014tz.go.bot.tips0105039980208700482805204599953038345802TZ5920MELCHIZEDECK TWISA K6015DAR ES SALAAM (610512345621203087004828081510012tz.co.selcom0131 https://selcompay.me/70048280 63046E23'
))
ON CONFLICT (key) DO UPDATE SET value = public.site_settings.value || EXCLUDED.value, updated_at = now();
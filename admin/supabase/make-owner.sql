-- Назначить владельца. Запустите ОДИН РАЗ после schema.sql,
-- заменив адрес на тот, с которым вы создали пользователя в Supabase → Authentication → Users.
update public.profiles
set role = 'owner', is_active = true
where email = 'ВАШ_EMAIL@example.com';

-- Add RLS policies for anonymous access

-- Users table - allow select/insert/update for own record
CREATE POLICY "Allow select own user" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow insert own user" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own user" ON public.users FOR UPDATE USING (true);

-- Profiles table - allow all for any user
CREATE POLICY "Allow select profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);

-- Conversations table - allow all operations (guest mode)
CREATE POLICY "Allow select conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Allow insert conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update conversations" ON public.conversations FOR UPDATE USING (true);
CREATE POLICY "Allow delete conversations" ON public.conversations FOR DELETE USING (true);

-- Messages table - allow all operations
CREATE POLICY "Allow select messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update messages" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Allow delete messages" ON public.messages FOR DELETE USING (true);

-- Generated images table - allow all operations
CREATE POLICY "Allow select images" ON public.generated_images FOR SELECT USING (true);
CREATE POLICY "Allow insert images" ON public.generated_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update images" ON public.generated_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete images" ON public.generated_images FOR DELETE USING (true);

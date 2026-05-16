import { supabase } from '../supabase';

type CreateInviteArgs = {
  group_id: number;
  email: string;
};

export const createInvite = async (args: CreateInviteArgs) => {
  const { error } = await supabase.functions.invoke('create-invite', {
    body: args,
  });
  if (error) throw error;
};

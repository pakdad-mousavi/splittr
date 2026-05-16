import { supabase } from '../supabase';

type AcceptInviteArgs = {
  token: string;
};

type AcceptInviteResponse = {
  group_id: string;
};

export const acceptInvite = async (args: AcceptInviteArgs) => {
  const { data, error } = await supabase.functions.invoke<AcceptInviteResponse>('accept-invite', {
    body: args,
  });
  if (error) throw error;
  return data;
};

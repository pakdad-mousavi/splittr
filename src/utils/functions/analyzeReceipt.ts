import { supabase } from '../supabase';

type AnalyzeReceiptArgs = {
  image: string;
  mimeType?: 'image/jpeg' | 'image/png';
};

type AnalyzeReceiptResponse = {
  items: Record<string, number>;
};

const stripBase64Prefix = (base64: string) => base64.split(',')[1] ?? base64;

export const analyzeReceipt = async (args: AnalyzeReceiptArgs) => {
  const { data, error } = await supabase.functions.invoke<AnalyzeReceiptResponse>(
    'analyze-receipt',
    {
      body: {
        ...args,
        image: stripBase64Prefix(args.image),
      },
    },
  );

  if (error) throw error;
  return data;
};

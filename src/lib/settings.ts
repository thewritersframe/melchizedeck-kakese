import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Reads a public row from site_settings (e.g. "payments"). */
export function useSiteSettings<T = Record<string, unknown>>(key: string) {
  return useQuery({
    queryKey: ["site-settings", key],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
      return (data?.value ?? {}) as T;
    },
  });
}

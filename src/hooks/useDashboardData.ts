import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  const poolsQuery = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('tvl_usd', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const tokensQuery = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('occurrences', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const marketsQuery = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const stats = {
    totalPools: poolsQuery.data?.length || 0,
    totalTvl: poolsQuery.data?.reduce((sum, pool) => sum + Number(pool.tvl_usd || 0), 0) || 0,
    totalVolume24h: poolsQuery.data?.reduce((sum, pool) => sum + Number(pool.volume_24h_usd || 0), 0) || 0,
    waxPools: poolsQuery.data?.filter(pool => pool.is_wax_pair).length || 0,
    uniqueTokens: tokensQuery.data?.length || 0,
  };

  return {
    pools: poolsQuery.data || [],
    tokens: tokensQuery.data || [],
    markets: marketsQuery.data || [],
    stats,
    isLoading: poolsQuery.isLoading || tokensQuery.isLoading || marketsQuery.isLoading,
    error: poolsQuery.error || tokensQuery.error || marketsQuery.error,
  };
};
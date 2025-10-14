import { MetricCard } from "@/components/dashboard/MetricCard";
import { PoolsTable } from "@/components/dashboard/PoolsTable";
import { TopTokens } from "@/components/dashboard/TopTokens";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Coins,
  RefreshCw,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Index = () => {
  const { pools, tokens, stats, isLoading } = useDashboardData();
  const [isFetching, setIsFetching] = useState(false);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const handleFetchData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-wax-data');
      
      if (error) throw error;
      
      toast.success("Dados atualizados com sucesso!", {
        description: `${data.stats.tokens} tokens, ${data.stats.alcor_pools + data.stats.waxonedge_pools} pools coletados`
      });
      
      // Refresh queries
      window.location.reload();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erro ao atualizar dados", {
        description: error instanceof Error ? error.message : "Tente novamente"
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                WAX Tools Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoramento em tempo real dos mercados WAX
              </p>
            </div>
            <Button 
              onClick={handleFetchData}
              disabled={isFetching}
              className="bg-primary hover:bg-primary/90 glow-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Pools"
            value={stats.totalPools}
            icon={<BarChart3 className="h-6 w-6" />}
            trend="neutral"
          />
          <MetricCard
            title="TVL Total"
            value={formatCurrency(stats.totalTvl)}
            icon={<Wallet className="h-6 w-6" />}
            trend="up"
            change={12.5}
          />
          <MetricCard
            title="Volume 24h"
            value={formatCurrency(stats.totalVolume24h)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="up"
            change={8.3}
          />
          <MetricCard
            title="Tokens Únicos"
            value={stats.uniqueTokens}
            icon={<Coins className="h-6 w-6" />}
            trend="neutral"
          />
        </div>

        {/* Pools Table and Top Tokens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PoolsTable pools={pools} isLoading={isLoading} />
          </div>
          <div>
            <TopTokens tokens={tokens} isLoading={isLoading} />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 text-primary">Pools WAX</h3>
            <p className="text-3xl font-bold mb-2">{stats.waxPools}</p>
            <p className="text-sm text-muted-foreground">
              Pools contendo o token WAX
            </p>
          </div>
          <div className="p-6 rounded-xl bg-secondary/10 border border-secondary/20">
            <h3 className="font-semibold text-lg mb-2 text-secondary">DEXs Monitoradas</h3>
            <p className="text-3xl font-bold mb-2">5</p>
            <p className="text-sm text-muted-foreground">
              Alcor, Taco, Defibox, Nefty, Adex
            </p>
          </div>
          <div className="p-6 rounded-xl bg-accent/10 border border-accent/20">
            <h3 className="font-semibold text-lg mb-2 text-accent">Última Atualização</h3>
            <p className="text-xl font-bold mb-2">Tempo Real</p>
            <p className="text-sm text-muted-foreground">
              Dados atualizados a cada 30 segundos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
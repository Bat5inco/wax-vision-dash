import { MetricCard } from "@/components/dashboard/MetricCard";
import { PoolsTable } from "@/components/dashboard/PoolsTable";
import { TopTokens } from "@/components/dashboard/TopTokens";
import { MarketsTable } from "@/components/dashboard/MarketsTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Coins,
  RefreshCw,
  Activity,
  Layers,
  Store
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Index = () => {
  const { pools, tokens, markets, stats, isLoading } = useDashboardData();
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

        {/* Tabs Navigation */}
        <Tabs defaultValue="pools" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="pools" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Pools</span>
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span>Mercados</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span>Tokens</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pools" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <PoolsTable pools={pools} isLoading={isLoading} />
              </div>
              <div>
                <Card className="p-6 card-gradient border-border/50">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total de Pools</p>
                      <p className="text-2xl font-bold">{stats.totalPools}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pools WAX</p>
                      <p className="text-2xl font-bold">{stats.waxPools}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">TVL Total</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.totalTvl)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="markets" className="mt-6">
            <MarketsTable markets={markets} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="tokens" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopTokens tokens={tokens} isLoading={isLoading} />
              </div>
              <div>
                <Card className="p-6 card-gradient border-border/50">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Resumo de Tokens
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tokens Únicos</p>
                      <p className="text-2xl font-bold">{stats.uniqueTokens}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Token WAX</p>
                      <p className="text-lg font-medium text-accent">eosio.token</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Footer */}
        <Card className="p-6 card-gradient border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center gap-2 justify-center md:justify-start">
                <Store className="h-5 w-5" />
                DEXs Monitoradas
              </h3>
              <p className="text-2xl font-bold mb-2">Waxonedge, Alcor</p>
              <p className="text-sm text-muted-foreground">
                Coletando dados de múltiplas exchanges descentralizadas
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2 text-accent flex items-center gap-2 justify-center">
                <Activity className="h-5 w-5" />
                Atualização Automática
              </h3>
              <p className="text-2xl font-bold mb-2">30 segundos</p>
              <p className="text-sm text-muted-foreground">
                Dados sincronizados automaticamente
              </p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-semibold text-lg mb-2 text-secondary flex items-center gap-2 justify-center md:justify-end">
                <BarChart3 className="h-5 w-5" />
                Blockchain
              </h3>
              <p className="text-2xl font-bold mb-2">WAX</p>
              <p className="text-sm text-muted-foreground">
                Monitoramento completo do ecossistema
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;
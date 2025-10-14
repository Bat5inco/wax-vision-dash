-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  precision INTEGER DEFAULT 4,
  occurrences INTEGER DEFAULT 1,
  is_wax BOOLEAN DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pools table
CREATE TABLE IF NOT EXISTS public.pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pair_key TEXT NOT NULL UNIQUE,
  dex_source TEXT NOT NULL,
  
  token0_contract TEXT NOT NULL REFERENCES public.tokens(contract),
  token0_symbol TEXT NOT NULL,
  token1_contract TEXT NOT NULL REFERENCES public.tokens(contract),
  token1_symbol TEXT NOT NULL,
  
  reserve0 NUMERIC(30, 8) DEFAULT 0,
  reserve1 NUMERIC(30, 8) DEFAULT 0,
  tvl_usd NUMERIC(20, 2) DEFAULT 0,
  volume_24h_usd NUMERIC(20, 2) DEFAULT 0,
  
  price NUMERIC(30, 10) DEFAULT 0,
  price_change_24h NUMERIC(10, 4) DEFAULT 0,
  
  is_wax_pair BOOLEAN DEFAULT false,
  has_arbitrage BOOLEAN DEFAULT false,
  
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create markets table
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pair_key TEXT NOT NULL UNIQUE,
  dex_source TEXT NOT NULL,
  
  token0_contract TEXT NOT NULL,
  token0_symbol TEXT NOT NULL,
  token1_contract TEXT NOT NULL,
  token1_symbol TEXT NOT NULL,
  
  last_price_int NUMERIC(30, 0),
  price NUMERIC(30, 10) DEFAULT 0,
  last_side TEXT,
  
  is_wax_pair BOOLEAN DEFAULT false,
  
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pool_metrics table for historical data
CREATE TABLE IF NOT EXISTS public.pool_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  
  tvl_usd NUMERIC(20, 2) DEFAULT 0,
  volume_24h_usd NUMERIC(20, 2) DEFAULT 0,
  price NUMERIC(30, 10) DEFAULT 0,
  
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pools_dex_source ON public.pools(dex_source);
CREATE INDEX IF NOT EXISTS idx_pools_is_wax_pair ON public.pools(is_wax_pair);
CREATE INDEX IF NOT EXISTS idx_pools_tvl_usd ON public.pools(tvl_usd DESC);
CREATE INDEX IF NOT EXISTS idx_pools_volume_24h ON public.pools(volume_24h_usd DESC);
CREATE INDEX IF NOT EXISTS idx_pools_last_updated ON public.pools(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_is_wax ON public.tokens(is_wax);
CREATE INDEX IF NOT EXISTS idx_tokens_occurrences ON public.tokens(occurrences DESC);
CREATE INDEX IF NOT EXISTS idx_pool_metrics_pool_id ON public.pool_metrics(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_metrics_recorded_at ON public.pool_metrics(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for everyone - public data)
CREATE POLICY "Allow public read access on tokens"
  ON public.tokens FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on pools"
  ON public.pools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on markets"
  ON public.markets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on pool_metrics"
  ON public.pool_metrics FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pools_updated_at
  BEFORE UPDATE ON public.pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
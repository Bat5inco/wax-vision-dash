import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaxonedgePool {
  src: string;
  token0: {
    contract: string;
    symbol: { ticker: string; precision: number };
  };
  token1: {
    contract: string;
    symbol: { ticker: string; precision: number };
  };
  reserve0: number;
  reserve1: number;
}

interface AlcorPool {
  tokenA: {
    contract: string;
    symbol: string;
  };
  tokenB: {
    contract: string;
    symbol: string;
  };
  tvlUSD?: number;
  volumeUSD24?: number;
}

interface WaxonedgeMarket {
  src: string;
  token0: {
    contract: string;
    symbol: { ticker: string; precision: number };
  };
  token1: {
    contract: string;
    symbol: { ticker: string; precision: number };
  };
  lastPrice?: number;
  lastSide?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting data collection from WAX APIs...');

    // Fetch data from Waxonedge Pools API
    console.log('Fetching Waxonedge pools...');
    const waxonedgeResponse = await fetch('https://api01.waxonedge.app/pools/');
    const waxonedgePools: WaxonedgePool[] = await waxonedgeResponse.json();
    console.log(`Fetched ${waxonedgePools.length} pools from Waxonedge`);

    // Fetch data from Alcor API
    console.log('Fetching Alcor pools...');
    const alcorResponse = await fetch('https://wax.alcor.exchange/api/v2/swap/pools');
    const alcorPools: AlcorPool[] = await alcorResponse.json();
    console.log(`Fetched ${alcorPools.length} pools from Alcor`);

    // Fetch markets data
    console.log('Fetching markets data...');
    const marketsResponse = await fetch('https://api01.waxonedge.app/markets/');
    const markets: WaxonedgeMarket[] = await marketsResponse.json();
    console.log(`Fetched ${markets.length} markets`);

    // Process and insert tokens
    const tokenSet = new Map();
    
    // Extract tokens from Waxonedge pools
    waxonedgePools.forEach(pool => {
      const contract0 = pool.token0.contract;
      const contract1 = pool.token1.contract;
      
      if (!tokenSet.has(contract0)) {
        tokenSet.set(contract0, {
          contract: contract0,
          symbol: pool.token0.symbol.ticker,
          precision: pool.token0.symbol.precision,
          is_wax: contract0 === 'eosio.token' && pool.token0.symbol.ticker === 'WAX',
          occurrences: 1
        });
      } else {
        tokenSet.get(contract0).occurrences++;
      }
      
      if (!tokenSet.has(contract1)) {
        tokenSet.set(contract1, {
          contract: contract1,
          symbol: pool.token1.symbol.ticker,
          precision: pool.token1.symbol.precision,
          is_wax: contract1 === 'eosio.token' && pool.token1.symbol.ticker === 'WAX',
          occurrences: 1
        });
      } else {
        tokenSet.get(contract1).occurrences++;
      }
    });

    // Extract tokens from Alcor pools
    alcorPools.forEach(pool => {
      const contractA = pool.tokenA.contract;
      const contractB = pool.tokenB.contract;
      
      if (!tokenSet.has(contractA)) {
        tokenSet.set(contractA, {
          contract: contractA,
          symbol: pool.tokenA.symbol,
          precision: 8,
          is_wax: contractA === 'eosio.token',
          occurrences: 1
        });
      } else {
        tokenSet.get(contractA).occurrences++;
      }
      
      if (!tokenSet.has(contractB)) {
        tokenSet.set(contractB, {
          contract: contractB,
          symbol: pool.tokenB.symbol,
          precision: 8,
          is_wax: contractB === 'eosio.token',
          occurrences: 1
        });
      } else {
        tokenSet.get(contractB).occurrences++;
      }
    });

    const tokens = Array.from(tokenSet.values());
    console.log(`Inserting ${tokens.length} unique tokens...`);
    
    // Upsert tokens
    const { error: tokensError } = await supabase
      .from('tokens')
      .upsert(tokens, { onConflict: 'contract' });

    if (tokensError) {
      console.error('Error inserting tokens:', tokensError);
    } else {
      console.log('Tokens inserted successfully');
    }

    // Process and insert pools from Waxonedge
    const waxonedgePoolsMap = new Map();
    waxonedgePools.forEach(pool => {
      const [token0, token1] = [pool.token0.contract, pool.token1.contract].sort();
      const pairKey = `${token0}|${token1}|${pool.src}`;
      const isWaxPair = pool.token0.contract === 'eosio.token' || pool.token1.contract === 'eosio.token';
      
      // Only keep one entry per unique pair_key
      if (!waxonedgePoolsMap.has(pairKey)) {
        waxonedgePoolsMap.set(pairKey, {
          pair_key: pairKey,
          dex_source: pool.src,
          token0_contract: pool.token0.contract,
          token0_symbol: pool.token0.symbol.ticker,
          token1_contract: pool.token1.contract,
          token1_symbol: pool.token1.symbol.ticker,
          reserve0: pool.reserve0,
          reserve1: pool.reserve1,
          tvl_usd: 0,
          volume_24h_usd: 0,
          price: pool.reserve1 / pool.reserve0,
          is_wax_pair: isWaxPair,
          has_arbitrage: false,
          last_updated: new Date().toISOString()
        });
      }
    });
    const waxonedgePoolsData = Array.from(waxonedgePoolsMap.values());

    console.log(`Inserting ${waxonedgePoolsData.length} pools from Waxonedge...`);
    const { error: waxonedgePoolsError } = await supabase
      .from('pools')
      .upsert(waxonedgePoolsData, { onConflict: 'pair_key' });

    if (waxonedgePoolsError) {
      console.error('Error inserting Waxonedge pools:', waxonedgePoolsError);
    } else {
      console.log('Waxonedge pools inserted successfully');
    }

    // Process and insert pools from Alcor
    const alcorPoolsMap = new Map();
    alcorPools.forEach(pool => {
      const [tokenA, tokenB] = [pool.tokenA.contract, pool.tokenB.contract].sort();
      const pairKey = `${tokenA}|${tokenB}|alcor`;
      const isWaxPair = pool.tokenA.contract === 'eosio.token' || pool.tokenB.contract === 'eosio.token';
      
      // Only keep one entry per unique pair_key
      if (!alcorPoolsMap.has(pairKey)) {
        alcorPoolsMap.set(pairKey, {
          pair_key: pairKey,
          dex_source: 'alcor',
          token0_contract: pool.tokenA.contract,
          token0_symbol: pool.tokenA.symbol,
          token1_contract: pool.tokenB.contract,
          token1_symbol: pool.tokenB.symbol,
          reserve0: 0,
          reserve1: 0,
          tvl_usd: pool.tvlUSD || 0,
          volume_24h_usd: pool.volumeUSD24 || 0,
          price: 0,
          is_wax_pair: isWaxPair,
          has_arbitrage: false,
          last_updated: new Date().toISOString()
        });
      }
    });
    const alcorPoolsData = Array.from(alcorPoolsMap.values());

    console.log(`Inserting ${alcorPoolsData.length} pools from Alcor...`);
    const { error: alcorPoolsError } = await supabase
      .from('pools')
      .upsert(alcorPoolsData, { onConflict: 'pair_key' });

    if (alcorPoolsError) {
      console.error('Error inserting Alcor pools:', alcorPoolsError);
    } else {
      console.log('Alcor pools inserted successfully');
    }

    // Process and insert markets
    const marketsMap = new Map();
    markets.forEach(market => {
      const [token0, token1] = [market.token0.contract, market.token1.contract].sort();
      const pairKey = `${token0}|${token1}|${market.src}`;
      const isWaxPair = market.token0.contract === 'eosio.token' || market.token1.contract === 'eosio.token';
      const precision = market.token0.symbol.precision - market.token1.symbol.precision;
      const price = market.lastPrice ? market.lastPrice / Math.pow(10, precision) : 0;
      
      // Only keep one entry per unique pair_key
      if (!marketsMap.has(pairKey)) {
        marketsMap.set(pairKey, {
          pair_key: pairKey,
          dex_source: market.src,
          token0_contract: market.token0.contract,
          token0_symbol: market.token0.symbol.ticker,
          token1_contract: market.token1.contract,
          token1_symbol: market.token1.symbol.ticker,
          last_price_int: market.lastPrice || 0,
          price: price,
          last_side: market.lastSide,
          is_wax_pair: isWaxPair,
          last_updated: new Date().toISOString()
        });
      }
    });
    const marketsData = Array.from(marketsMap.values());

    console.log(`Inserting ${marketsData.length} markets...`);
    const { error: marketsError } = await supabase
      .from('markets')
      .upsert(marketsData, { onConflict: 'pair_key' });

    if (marketsError) {
      console.error('Error inserting markets:', marketsError);
    } else {
      console.log('Markets inserted successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data collection completed',
        stats: {
          tokens: tokens.length,
          waxonedge_pools: waxonedgePoolsData.length,
          alcor_pools: alcorPoolsData.length,
          markets: marketsData.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in fetch-wax-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
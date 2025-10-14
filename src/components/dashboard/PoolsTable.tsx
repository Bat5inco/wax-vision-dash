import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pool {
  id: string;
  pair_key: string;
  token0_symbol: string;
  token1_symbol: string;
  dex_source: string;
  tvl_usd: number;
  volume_24h_usd: number;
  price: number;
  is_wax_pair: boolean;
  has_arbitrage: boolean;
}

interface PoolsTableProps {
  pools: Pool[];
  isLoading?: boolean;
}

export const PoolsTable = ({ pools, isLoading }: PoolsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Pool>("tvl_usd");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Pool) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredPools = pools
    .filter(pool =>
      pool.token0_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token1_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.dex_source.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * modifier;
      }
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  return (
    <Card className="card-gradient border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient">Pools</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Par</TableHead>
                <TableHead className="text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("dex_source")}
                    className="hover:text-primary"
                  >
                    DEX
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("tvl_usd")}
                    className="hover:text-primary"
                  >
                    TVL
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("volume_24h_usd")}
                    className="hover:text-primary"
                  >
                    Volume 24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("price")}
                    className="hover:text-primary"
                  >
                    Preço
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando pools...
                  </TableCell>
                </TableRow>
              ) : filteredPools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum pool encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPools.map((pool) => (
                  <TableRow key={pool.id} className="border-border/50 hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{pool.token0_symbol}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground">{pool.token1_symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {pool.dex_source.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${formatNumber(pool.tvl_usd)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${formatNumber(pool.volume_24h_usd)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {pool.price.toFixed(6)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pool.is_wax_pair && (
                          <Badge variant="outline" className="border-accent/50 text-accent">
                            WAX
                          </Badge>
                        )}
                        {pool.has_arbitrage && (
                          <Badge variant="outline" className="border-secondary/50 text-secondary">
                            ARB
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
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

interface Market {
  id: string;
  pair_key: string;
  token0_symbol: string;
  token1_symbol: string;
  dex_source: string;
  price: number;
  last_side: string | null;
  is_wax_pair: boolean;
}

interface MarketsTableProps {
  markets: Market[];
  isLoading?: boolean;
}

export const MarketsTable = ({ markets, isLoading }: MarketsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Market>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Market) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredMarkets = markets
    .filter(market =>
      market.token0_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.token1_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.dex_source.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <Card className="card-gradient border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gradient">Mercados</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar mercados..."
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
                    onClick={() => handleSort("price")}
                    className="hover:text-primary"
                  >
                    Preço
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-muted-foreground">Última Operação</TableHead>
                <TableHead className="text-muted-foreground">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando mercados...
                  </TableCell>
                </TableRow>
              ) : filteredMarkets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum mercado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredMarkets.map((market) => (
                  <TableRow key={market.id} className="border-border/50 hover:bg-muted/30 transition-smooth">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{market.token0_symbol}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground">{market.token1_symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {market.dex_source.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {market.price ? market.price.toFixed(8) : '0.00000000'}
                    </TableCell>
                    <TableCell>
                      {market.last_side ? (
                        <Badge 
                          variant="outline" 
                          className={market.last_side === 'buy' ? 'border-accent/50 text-accent' : 'border-destructive/50 text-destructive'}
                        >
                          {market.last_side.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {market.is_wax_pair && (
                        <Badge variant="outline" className="border-accent/50 text-accent">
                          WAX
                        </Badge>
                      )}
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

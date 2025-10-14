import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Token {
  id: string;
  symbol: string;
  contract: string;
  occurrences: number;
  is_wax: boolean;
}

interface TopTokensProps {
  tokens: Token[];
  isLoading?: boolean;
}

export const TopTokens = ({ tokens, isLoading }: TopTokensProps) => {
  const topTokens = tokens
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return (
    <Card className="p-6 card-gradient border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">Top Tokens</h2>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">Carregando tokens...</p>
        ) : topTokens.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">Nenhum token encontrado</p>
        ) : (
          topTokens.map((token, index) => (
            <div
              key={token.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index === 0 ? 'bg-accent/20 text-accent' :
                  index === 1 ? 'bg-secondary/20 text-secondary' :
                  index === 2 ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{token.symbol}</p>
                    {token.is_wax && (
                      <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                        WAX
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                    {token.contract}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{token.occurrences}</p>
                <p className="text-xs text-muted-foreground">pools</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  Phone,
  Building2,
  Clock,
  RefreshCw,
  Unplug,
  Shield,
  TrendingUp,
  BadgeCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useActiveWaba } from "@/hooks/use-active-waba";

const StatusConexao = () => {
  const { activeWaba } = useActiveWaba();

  const connectionData = activeWaba
    ? {
    connected: true,
        wabaId: activeWaba.wabaId,
        phoneNumberId: activeWaba.phoneId,
        phoneNumber: activeWaba.displayNumber,
        displayName: activeWaba.displayNumber,
        status: activeWaba.webhookVerified ? "active" : "pending",
        lastSync: activeWaba.updatedAt || "—",
        businessVerified: activeWaba.webhookVerified,
    accountType: "Business",
      }
    : {
        connected: false,
        wabaId: "—",
        phoneNumberId: "—",
        phoneNumber: "—",
        displayName: "—",
        status: "disconnected",
        lastSync: "—",
        businessVerified: false,
        accountType: "—",
  };

  const qualityData = {
    rating: connectionData.connected ? 80 : 0,
    status: (connectionData.connected ? "green" : "red") as "green" | "yellow" | "red",
  };

  const tierData = {
    current: connectionData.connected ? "Ativo" : "Offline",
    currentLimit: connectionData.connected ? 10000 : 0,
    nextTier: connectionData.connected ? "Expansão" : "Conectar",
    nextTierLimit: connectionData.connected ? 100000 : 0,
    progress: connectionData.connected ? 65 : 0,
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case "green":
        return { bg: "bg-success/20", text: "text-success", label: "Verde" };
      case "yellow":
        return { bg: "bg-warning/20", text: "text-warning", label: "Amarelo" };
      case "red":
        return { bg: "bg-destructive/20", text: "text-destructive", label: "Vermelho" };
      default:
        return { bg: "bg-muted/20", text: "text-muted-foreground", label: "Desconhecido" };
    }
  };

  const getQualityMessage = (status: string) => {
    switch (status) {
      case "green":
        return "Sua conta está com excelente reputação.";
      case "yellow":
        return "Atenção: risco moderado, evite marketing agressivo.";
      case "red":
        return "Sua conta está em risco de bloqueio temporário.";
      default:
        return "";
    }
  };

  const quality = getQualityColor(qualityData.status);

  const handleReconnect = () => {
    toast({
      title: "Reconectando...",
      description: "Verificando status com a Meta",
    });
  };

  const handleDisconnect = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Desconexão será habilitada em breve",
      variant: "destructive",
    });
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status da Conexão</h1>
        <p className="text-muted-foreground mt-1">
          Informações da sua Conta Oficial do WhatsApp (WABA)
        </p>
      </div>

      {/* Card 1 - Status da Conexão */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {connectionData.connected ? (
                <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-[#25D366]" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                  <WifiOff className="h-8 w-8 text-destructive" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">WhatsApp Business API</h2>
                  <Badge
                    className={
                      connectionData.connected
                        ? "bg-[#25D366] hover:bg-[#25D366]"
                        : "bg-destructive"
                    }
                  >
                    {connectionData.connected ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mt-1">
                  {connectionData.phoneNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Última sincronização: {connectionData.lastSync}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReconnect}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconectar WhatsApp Oficial
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDisconnect}
              >
                <Unplug className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 2 - Qualidade da Conta */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${quality.text}`} />
              Qualidade da Conta (Quality Rating)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${quality.bg} flex items-center justify-center`}>
                  <span className={`text-xl font-bold ${quality.text}`}>
                    {qualityData.rating}%
                  </span>
                </div>
                <div>
                  <Badge className={`${quality.bg} ${quality.text} border-0`}>
                    {quality.label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pontuação</span>
                <span className={`font-medium ${quality.text}`}>
                  {qualityData.rating}%
                </span>
              </div>
              <Progress value={qualityData.rating} className={quality.bg} />
              <p className="text-sm text-muted-foreground">
                {getQualityMessage(qualityData.status)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Capacidade de Envio (Tier) */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Capacidade de Envio (Tier)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {tierData.current}
                  </span>
                </div>
                <div>
                  <p className="font-medium">Tier Atual</p>
                  <p className="text-sm text-muted-foreground">
                    {tierData.currentLimit.toLocaleString()} mensagens/dia
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso para {tierData.nextTier}</span>
                <span className="font-medium">{tierData.progress}%</span>
              </div>
              <Progress value={tierData.progress} />
              <p className="text-sm text-muted-foreground">
                Próximo tier: {tierData.nextTier} ({tierData.nextTierLimit.toLocaleString()} mensagens/dia)
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <p><strong>Tiers disponíveis:</strong> 50 → 250 → 1k → 10k → 100k mensagens/dia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card 4 - Detalhes da Conta */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Detalhes da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                WABA ID
              </div>
              <p className="font-mono text-lg">{connectionData.wabaId}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Phone Number ID
              </div>
              <p className="font-mono text-lg">{connectionData.phoneNumberId}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Nome Exibido
              </div>
              <p className="text-lg font-medium">{connectionData.displayName}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="h-4 w-4" />
                Verificação do Business
              </div>
              <Badge
                className={
                  connectionData.businessVerified
                    ? "bg-success/20 text-success border-0"
                    : "bg-warning/20 text-warning border-0"
                }
              >
                {connectionData.businessVerified ? "Verificado" : "Pendente"}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Tipo da Conta
              </div>
              <p className="text-lg font-medium">{connectionData.accountType}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Última Sincronização
              </div>
              <p className="text-lg">{connectionData.lastSync}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informação Adicional */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-[#25D366] mt-0.5" />
            <div>
              <p className="text-sm font-medium">Conexão Ativa</p>
              <p className="text-sm text-muted-foreground">
                {connectionData.connected
                  ? "Sua Conta Oficial do WhatsApp está conectada e pronta para enviar e receber mensagens."
                  : "Conecte sua conta para ativar o envio e recebimento de mensagens."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusConexao;

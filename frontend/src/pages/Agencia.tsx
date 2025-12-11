import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  Phone,
  Activity,
} from "lucide-react";
import { useActiveWaba } from "@/hooks/use-active-waba";

const Agencia = () => {
  const { shops } = useActiveWaba();

  const empresas = shops.map((shop) => {
    const waba = shop.waba?.[0];
    return {
      id: shop.id,
      nome: shop.name,
      status: waba ? "connected" : "pending",
      wabaId: waba?.wabaId || null,
      numero: waba?.displayNumber || null,
      ultimaAtividade: waba ? "Conectado" : "Aguardando conexão",
      mensagensHoje: 0,
    };
  });

  const stats = {
    connected: empresas.filter((e) => e.status === "connected").length,
    pending: empresas.filter((e) => e.status === "pending").length,
    total: empresas.length,
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header com visual azul destacado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-lg shadow-[#0EA5E9]/25">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0EA5E9]">
              Módulo Agência
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie múltiplas empresas de clientes em um só lugar
            </p>
          </div>
        </div>
        <Button className="bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E9]/25">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#0EA5E9]/10 to-transparent border-[#0EA5E9]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empresas Conectadas</p>
                <h3 className="text-3xl font-bold mt-2 text-[#0EA5E9]">
                  {stats.connected}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aguardando Conexão</p>
                <h3 className="text-3xl font-bold mt-2 text-warning">
                  {stats.pending}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0EA5E9]/10 to-transparent border-[#0EA5E9]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Empresas</p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#0EA5E9]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card className="bg-card border-[#0EA5E9]/20">
        <CardHeader className="border-b border-[#0EA5E9]/10">
          <CardTitle className="flex items-center gap-2 text-[#0EA5E9]">
            <Building2 className="h-5 w-5" />
            Empresas Gerenciadas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {empresas.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#0EA5E9]/5 flex items-center justify-center border border-[#0EA5E9]/20">
                    <Building2 className="h-7 w-7 text-[#0EA5E9]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-lg">{empresa.nome}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {empresa.numero ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {empresa.numero}
                        </span>
                      ) : (
                        <span className="text-warning">Sem número conectado</span>
                      )}
                      {empresa.status === "connected" && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5" />
                          {empresa.mensagensHoje} mensagens hoje
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {empresa.ultimaAtividade}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    className={
                      empresa.status === "connected"
                        ? "bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30 font-medium"
                        : "bg-warning/20 text-warning border-warning/30 font-medium"
                    }
                  >
                    {empresa.status === "connected" ? "Conectado" : "Pendente"}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9]/50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-[#0EA5E9]/10 via-[#0EA5E9]/5 to-transparent border-[#0EA5E9]/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/20 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-[#0EA5E9]" />
            </div>
            <div>
              <p className="font-semibold text-[#0EA5E9]">Módulo Agência</p>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie todas as Contas Oficiais do WhatsApp dos seus clientes a partir de um único painel.
                Adicione novas empresas, monitore conexões e acompanhe a atividade de cada conta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agencia;

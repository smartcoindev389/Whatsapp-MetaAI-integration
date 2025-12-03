import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import {
  Plus,
  Play,
  Pause,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";

const Campaigns = () => {
  const [wabaAccountId, setWabaAccountId] = useState<string | null>(null);

  useEffect(() => {
    api.getShops()
      .then((shops) => {
        if (shops.length > 0 && shops[0].waba && shops[0].waba.length > 0) {
          setWabaAccountId(shops[0].waba[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', wabaAccountId],
    queryFn: () => wabaAccountId ? api.getCampaigns(wabaAccountId) : Promise.resolve([]),
    enabled: !!wabaAccountId,
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-primary/20 text-primary border-primary/30";
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "scheduled":
        return "bg-info/20 text-info border-info/30";
      case "paused":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const calculateProgress = (sent: number, total: number) => {
    return total > 0 ? (sent / total) * 100 : 0;
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your messaging campaigns
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <h3 className="text-2xl font-bold mt-1">1</h3>
              </div>
              <Play className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <h3 className="text-2xl font-bold mt-1">1</h3>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold mt-1">1</h3>
              </div>
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <h3 className="text-2xl font-bold mt-1">43.4K</h3>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No campaigns yet</div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign: any) => (
          <Card
            key={campaign.id}
            className="bg-card border-border hover:shadow-glow transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(campaign.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.contactCount.toLocaleString()} recipients
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {campaign.status === "running" ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  ) : campaign.status === "scheduled" ? (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Start Now
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    View Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              {campaign.status === "running" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {campaign.sentCount.toLocaleString()} /{" "}
                      {campaign.contactCount.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(campaign.sentCount, campaign.contactCount)}
                    className="h-2"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{campaign.sentCount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {campaign.deliveredCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-info">
                    {campaign.readCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">
                    {campaign.failedCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;

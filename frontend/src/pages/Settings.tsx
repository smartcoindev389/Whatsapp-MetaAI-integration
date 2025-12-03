import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, integrations, and platform configuration
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Tenant Name</Label>
                <Input id="tenant-name" defaultValue="My Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Contact Email</Label>
                <Input id="tenant-email" type="email" defaultValue="contact@mycompany.com" />
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Real-time Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive instant notifications for new messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-assign Conversations</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign new conversations to available agents
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure webhook endpoints to receive real-time events from WhatsApp
              </p>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input value="https://api.yourplatform.com/webhooks/meta" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Verify Token</Label>
                <Input value="your_verify_token_here" readOnly />
              </div>
              <Button variant="outline">Regenerate Token</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

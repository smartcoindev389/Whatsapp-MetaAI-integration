import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Phone,
  Webhook,
  Settings as SettingsIcon,
} from "lucide-react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    api.getShops()
      .then((shops) => {
        if (shops.length > 0) {
          setShopId(shops[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const { data: signupData, isLoading: signupLoading } = useQuery({
    queryKey: ['embedded-signup', shopId],
    queryFn: () => shopId ? api.getEmbeddedSignupUrl(shopId) : Promise.resolve({ url: '' }),
    enabled: !!shopId && currentStep === 1,
  });

  const steps = [
    {
      id: 1,
      title: "Connect Meta Account",
      description: "Authenticate with Facebook/Meta to access WhatsApp Business API",
      icon: LinkIcon,
      status: "completed",
    },
    {
      id: 2,
      title: "Select WABA & Phone",
      description: "Choose your WhatsApp Business Account and phone number",
      icon: Phone,
      status: "current",
    },
    {
      id: 3,
      title: "Configure Webhooks",
      description: "Set up webhook URL to receive messages and events",
      icon: Webhook,
      status: "pending",
    },
    {
      id: 4,
      title: "Review & Complete",
      description: "Review permissions and finalize setup",
      icon: SettingsIcon,
      status: "pending",
    },
  ];

  const connectedAccounts = [
    {
      id: "1",
      name: "My Business WABA",
      waba_id: "123456789012345",
      phone_numbers: [
        { id: "p1", number: "+55 11 98765-4321", verified: true, status: "active" },
        { id: "p2", number: "+55 21 91234-5678", verified: true, status: "active" },
      ],
      status: "active",
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Embedded Signup</h1>
        <p className="text-muted-foreground mt-1">
          Connect your WhatsApp Business Account via Meta's Embedded Signup flow
        </p>
      </div>

      {/* Steps Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step.status === "completed"
                        ? "bg-primary text-primary-foreground"
                        : step.status === "current"
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-3 text-center max-w-[150px]">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-4 transition-colors ${
                      step.status === "completed" ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Step {currentStep}: Select WABA & Phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose the WhatsApp Business Account (WABA) and phone number you want to connect to
              this platform. You can connect multiple phone numbers from the same WABA.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Required Permissions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  whatsapp_business_messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  whatsapp_business_management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  business_management
                </li>
              </ul>
            </div>
            {signupData?.url && (
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={() => window.location.href = signupData.url}
              >
                Connect Meta Account
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Connected Accounts</span>
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="p-4 bg-muted/30 rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{account.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      WABA ID: {account.waba_id}
                    </p>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {account.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Connected Phone Numbers:
                  </p>
                  {account.phone_numbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex items-center justify-between p-2 bg-background rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm">{phone.number}</span>
                        {phone.verified && (
                          <CheckCircle2 className="h-3 w-3 text-success" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {phone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {connectedAccounts.length === 0 && (
              <div className="text-center py-8">
                <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No accounts connected yet. Click "Connect New" to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;

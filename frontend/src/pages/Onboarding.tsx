import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Phone,
  Webhook,
  Settings as SettingsIcon,
} from "lucide-react";
import translations from "@/i18n/pt-BR.json";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const t = translations.onboarding;

  const steps = [
    {
      id: 1,
      title: t.step1.title,
      description: t.step1.description,
      icon: LinkIcon,
      status: "completed",
    },
    {
      id: 2,
      title: t.step2.title,
      description: t.step2.description,
      icon: Phone,
      status: "current",
    },
    {
      id: 3,
      title: t.step3.title,
      description: t.step3.description,
      icon: Webhook,
      status: "pending",
    },
    {
      id: 4,
      title: t.step4.title,
      description: t.step4.description,
      icon: SettingsIcon,
      status: "pending",
    },
  ];

  const connectedAccounts = [
    {
      id: "1",
      name: "Minha Empresa WABA",
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Passo {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t.requiredPermissions}</h4>
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
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              {t.continueNextStep}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t.connectedAccounts}</span>
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                {t.connectNew}
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
                    {t.connectedPhoneNumbers}
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
                <p className="text-sm text-muted-foreground">{t.noAccounts}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;

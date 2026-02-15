"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Check, Percent, Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppSettings } from "@/lib/storage";
import { currencies } from "@/lib/currency";

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function SettingsScreen({
  settings,
  onUpdate,
  onBack,
  showToast,
}: SettingsScreenProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onUpdate(localSettings);
    showToast("Configuracion guardada");
    onBack();
  };

  const toggleTheme = () => {
    const newTheme: "light" | "dark" =
      localSettings.theme === "light" ? "dark" : "light";
    const updatedSettings = { ...localSettings, theme: newTheme };
    setLocalSettings(updatedSettings);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex flex-col h-dvh">
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-6 safe-top shrink-0">
        <div className="max-w-md mx-auto mt-4">
          <h1 className="text-2xl font-bold tracking-tight">Configuracion</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Personaliza la app
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-md mx-auto w-full scroll-smooth-touch scrollbar-hide">
        <div className="space-y-3">
          {/* Toggle de tema */}
          <Card className="shadow-sm animate-slide-up">
            <CardContent className="p-5">
              <div
                className="flex items-center justify-between cursor-pointer touch-feedback rounded-lg -m-1 p-1"
                onClick={toggleTheme}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    {localSettings.theme === "light" ? (
                      <Sun className="h-5 w-5 text-primary" />
                    ) : (
                      <Moon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Tema</Label>
                    <p className="text-xs text-muted-foreground">
                      {localSettings.theme === "light"
                        ? "Modo claro"
                        : "Modo oscuro"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className="h-12 w-12 rounded-xl bg-transparent touch-feedback"
                  aria-label="Toggle theme"
                >
                  {localSettings.theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selector de moneda */}
          <Card
            className="shadow-sm animate-slide-up"
            style={{ animationDelay: "50ms" }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Moneda</Label>
                  <p className="text-xs text-muted-foreground">
                    Selecciona tu moneda
                  </p>
                </div>
              </div>
              <Select
                value={localSettings.currency}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, currency: value })
                }
              >
                <SelectTrigger className="h-14 text-base rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem
                      key={curr.code}
                      value={curr.code}
                      className="py-3"
                    >
                      {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Porcentaje de servicio */}
          <Card
            className="shadow-sm animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="service" className="text-base font-semibold">
                    Porcentaje de Servicio
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Propina o servicio por defecto
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="service"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  value={localSettings.servicePercent}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setLocalSettings({ ...localSettings, servicePercent: 0 });
                      return;
                    }
                    const numValue = Number.parseInt(value);
                    if (
                      !Number.isNaN(numValue) &&
                      numValue >= 0 &&
                      numValue <= 100
                    ) {
                      setLocalSettings({
                        ...localSettings,
                        servicePercent: numValue,
                      });
                    }
                  }}
                  className="h-14 text-base text-center rounded-xl flex-1"
                />
                <span className="text-2xl font-semibold text-muted-foreground w-8">
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="shrink-0 bg-background border-t pb-[90px]">
        <div className="max-w-md mx-auto px-5 py-3">
          <Button
            onClick={handleSave}
            className="w-full h-12 text-base font-semibold rounded-2xl touch-feedback shadow-lg shadow-primary/25"
          >
            <Check className="mr-2 h-5 w-5" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

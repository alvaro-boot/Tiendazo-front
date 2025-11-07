"use client";

import { MapPin, Phone, Mail } from "lucide-react";

interface ContactSectionProps {
  store: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    template: string;
  };
  config?: {
    title?: string;
    showAddress?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
  };
}

export function ContactSection({
  store,
  theme,
  config = {},
}: ContactSectionProps) {
  const {
    title = "Contacto",
    showAddress = true,
    showPhone = true,
    showEmail = true,
  } = config;

  return (
    <footer 
      id="contacto"
      className="border-t mt-12 sm:mt-16 lg:mt-20"
      style={{
        borderColor: theme.template === 'MODERN' ? 'rgba(255,255,255,0.2)' :
                    theme.template === 'MINIMALIST' ? '#e5e5e5' :
                    theme.accentColor,
        backgroundColor: theme.template === 'MODERN' ? theme.primaryColor :
                         theme.template === 'MINIMALIST' ? theme.backgroundColor :
                         theme.primaryColor,
        color: theme.template === 'MODERN' || theme.template === 'ELEGANT' ? 'white' : theme.textColor,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Información de la Tienda */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">{store.name}</h3>
            <p className="text-sm opacity-90">Tu tienda de confianza</p>
          </div>
          
          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">{title}</h3>
            <div className="space-y-2 text-sm opacity-90">
              {showAddress && store.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{store.address}</span>
                </div>
              )}
              {showPhone && store.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a 
                    href={`tel:${store.phone}`}
                    className="hover:underline"
                    style={{ 
                      color: theme.template === 'MODERN' || theme.template === 'ELEGANT' 
                        ? 'white' 
                        : theme.primaryColor 
                    }}
                  >
                    {store.phone}
                  </a>
                </div>
              )}
              {showEmail && store.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a 
                    href={`mailto:${store.email}`}
                    className="hover:underline"
                    style={{ 
                      color: theme.template === 'MODERN' || theme.template === 'ELEGANT' 
                        ? 'white' 
                        : theme.primaryColor 
                    }}
                  >
                    {store.email}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Copyright */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Información</h3>
            <p className="text-sm opacity-90">
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </p>
            {theme.template === 'ELEGANT' && (
              <p className="text-xs opacity-75 mt-2">
                Diseñado con elegancia y dedicación
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}


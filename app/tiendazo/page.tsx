"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Globe2,
  BarChart3,
  Users,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: ShoppingCart,
    title: "POS + eCommerce",
    description:
      "Control de inventario en tiempo real, facturación electrónica y tienda online en un mismo lugar.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel Unificado",
    description:
      "Dashboards dinámicos con métricas financieras, ventas, clientes y operaciones en vivo.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Empresarial",
    description:
      "Autenticación robusta, roles por niveles y cumplimiento con normativas locales.",
  },
  {
    icon: Globe2,
    title: "Experiencias Multitienda",
    description:
      "Sitios personalizados para cada marca con temas, dominios y pasarelas de pago integradas.",
  },
];

const modules = [
  {
    icon: Layers,
    title: "Gestión Operativa Total",
    description:
      "Inventarios multilocal, compras, proveedores, logística y envíos automatizados.",
  },
  {
    icon: Users,
    title: "Clientes 360°",
    description:
      "CRM integrado con campañas, fidelización, cupones y soporte omnicanal.",
  },
  {
    icon: BarChart3,
    title: "Analítica y Finanzas",
    description:
      "Reportes inteligentes, conciliaciones, control contable y proyecciones en minutos.",
  },
];

export default function TiendazoLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,91,255,0.25),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(6,231,255,0.2),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(255,63,214,0.18),_transparent_42%)]">
      <div className="absolute inset-0 backdrop-blur-[80px] bg-white/6" />
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Hero */}
        <header className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#06e7ff]" />
                <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">
                  Prisma Dev presenta
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-[3.4rem]">
                Tiendazo: el sistema de gestión y comercio electrónico que impulsa
                tu ecosistema retail.
              </h1>
              <p className="text-base text-white/80 sm:text-lg lg:text-xl">
                Diseñado por Prisma Dev para cadenas, franquicias y emprendedores que
                necesitan unificar operaciones físicas y digitales. Controla tu negocio con
                precisión, personaliza la experiencia de tus clientes y crece sin límites.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-start sm:gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#2d5bff] via-[#06e7ff] to-[#ff3fd6] text-white shadow-[0_15px_40px_rgba(45,91,255,0.3)] hover:shadow-[0_18px_45px_rgba(6,231,255,0.35)]"
                >
                  Solicitar demostración
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white/30 bg-white/5 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/marketplace">Explorar tiendas creadas con Tiendazo</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left text-white/70 sm:grid-cols-4">
                <div>
                  <p className="text-3xl font-semibold text-white">+12k</p>
                  <p className="text-xs uppercase tracking-wide">Órdenes procesadas / día</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">99.99%</p>
                  <p className="text-xs uppercase tracking-wide">Disponibilidad en la nube</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">65+</p>
                  <p className="text-xs uppercase tracking-wide">Integraciones listas</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p className="text-xs uppercase tracking-wide">Soporte Prisma Dev</p>
                </div>
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
              <div className="absolute inset-0 rounded-[36px] bg-white/10 blur-3xl" />
              <Card className="relative w-full overflow-hidden border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                <CardContent className="space-y-6 p-8 text-white">
                  <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                    Arquitectura Prisma
                  </p>
                  <h2 className="text-2xl font-semibold leading-tight">
                    Orquesta tus tiendas físicas, marketplace y micro sitios en un mismo panel.
                  </h2>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-sm text-white/80">
                      “Tiendazo nos dio visibilidad real de todo el inventario,
                      pasamos de 4 plataformas distintas a un ecosistema único.”
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#06e7ff] to-[#ff3fd6]" />
                      <div>
                        <p className="text-sm font-semibold text-white">Laura Méndez</p>
                        <p className="text-xs text-white/60">COO - Prisma Dev Retail Labs</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
                    <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
                      <p className="font-semibold text-white">3N+</p>
                      <p className="mt-1 text-xs uppercase tracking-wide">
                        Multicanalidad nativa
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
                      <p className="font-semibold text-white">+45%</p>
                      <p className="mt-1 text-xs uppercase tracking-wide">
                        Crecimiento en conversión
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Ecosistema end-to-end
                      </p>
                      <p className="mt-2 text-sm text-white">
                        POS, marketplace, marketing, logística y finanzas conectados por diseño.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        {/* Highlights */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-white/10 bg-white/10 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(13,38,76,0.35)] backdrop-blur-xl"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d5bff]/30 via-[#06e7ff]/40 to-[#ff3fd6]/40 text-white shadow-inner shadow-black/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-sm text-white/75">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
          <div className="mb-10 text-center lg:text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-white/70">
              Arquitectura integral
            </span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Módulos especializados para cada área de tu negocio
            </h2>
            <p className="mt-3 text-base text-white/70 sm:max-w-2xl">
              Tiendazo centraliza procesos críticos en pilares que puedes activar según tu
              estrategia: operaciones, relación con clientes y analítica avanzada.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              {modules.map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  className="border-white/10 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/12"
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-2xl bg-gradient-to-br from-[#06e7ff]/30 via-[#2d5bff]/40 to-[#ff3fd6]/40 p-3 text-white shadow-inner">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                      <p className="text-sm text-white/75">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-white/10 bg-white/10 p-0 backdrop-blur-xl">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-8 text-white">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Hecho por Prisma Dev
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight">
                    Integraciones nativas con ecosistema financiero, logística e inteligencia de
                    datos.
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#06e7ff]" />
                    Pasarelas PayU, Wompi, Stripe, MercadoPago.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2d5bff]" />
                    Validación DIAN, facturación electrónica y CUFE.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff3fd6]" />
                    Envíos inteligentes con Servientrega, Coordinadora y Envia.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#b547ff]" />
                    Data Lake y analítica avanzada con paneles personalizables.
                  </li>
                </ul>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/80">
                    “Prisma Dev implementó Tiendazo en solo 6 semanas. Ahora cada tienda tiene su
                    web propia, POS conectado y reportes financieros automáticos.”
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/60">
                    Caso de éxito: Prisma Commerce Labs
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA final */}
        <footer className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8">
          <div className="overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-8 shadow-[0_25px_65px_rgba(13,38,76,0.35)] backdrop-blur-2xl sm:p-12 lg:p-16">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className="space-y-6 text-white">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Comienza hoy con Tiendazo y crece junto a Prisma Dev.
                </h2>
                <p className="text-base text-white/75 sm:max-w-xl">
                  Nuestro equipo implementa tu plataforma, capacita a tu equipo y migra tus datos
                  mientras tú te enfocas en la expansión. Agenda una consultoría y descubre cómo
                  acelerar tu transformación digital.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#06e7ff] via-[#2d5bff] to-[#b547ff] text-white shadow-[0_15px_45px_rgba(6,231,255,0.35)]"
                  >
                    Hablar con Prisma Dev
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto border border-white/30 bg-white/5 text-white hover:bg-white/10"
                  >
                    Descargar brochure
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#06e7ff] via-[#2d5bff] to-[#ff3fd6]" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                      Prisma Dev Services
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      Implementación llave en mano
                    </h3>
                  </div>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  <li>• Roadmap estratégico y despliegue progresivo.</li>
                  <li>• Integraciones personalizadas y migración de datos.</li>
                  <li>• Mesa de soporte 24/7 y monitoreo de SLA.</li>
                </ul>
                <div className="mt-6 rounded-xl border border-white/15 bg-white/8 p-4 text-xs uppercase tracking-wide text-white/65">
                  Tiendazo es parte del ecosistema Prisma Commerce, diseñado y soportado por Prisma Dev.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


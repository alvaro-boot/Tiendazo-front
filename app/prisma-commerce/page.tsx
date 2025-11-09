"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Cpu,
  Cloud,
  Lock,
  Sparkles,
  Server,
  Terminal,
  Gauge,
  BarChart3,
  Layers,
  Wand2,
  ShieldCheck,
  ShoppingCart,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const glowPanel =
  "rounded-3xl border border-white/10 bg-white/10/5 backdrop-blur-[50px] shadow-[0_35px_80px_-30px_rgba(108,99,255,0.45)]";

const featureItems = [
  {
    icon: ShoppingCart,
    title: "Comercio Unificado",
    description:
      "Gestiona pedidos, catálogo, promociones, marketplaces y tiendas físicas desde una sola vista maestra.",
  },
  {
    icon: Boxes,
    title: "Inventario Cuántico",
    description:
      "Sincronización automatizada entre bodegas, sucursales y canales digitales con ajustes inteligentes.",
  },
  {
    icon: Gauge,
    title: "Inteligencia Operativa",
    description:
      "Dashboards en tiempo real con insights de ventas, logística, rotación y márgenes por tienda.",
  },
  {
    icon: Lock,
    title: "Seguridad Prisma",
    description:
      "Roles avanzados, auditoría completa, cifrado extremo a extremo y cumplimiento fiscal regional.",
  },
];

const moduleItems = [
  {
    title: "Orquestador Prisma",
    description:
      "Automatiza flujos de picking, packing, facturación y logística con integraciones listas para uso.",
    icon: Server,
  },
  {
    title: "Motor de Experiencias",
    description:
      "Creador visual de mini sitios, personalización por segmentos y campañas omnicanal conectadas.",
    icon: Sparkles,
  },
  {
    title: "Núcleo Financiero",
    description:
      "Facturación electrónica, conciliaciones bancarias, reportes a contabilidad y control de impuestos.",
    icon: BarChart3,
  },
  {
    title: "Prisma Shield",
    description:
      "Matriz de permisos, alertas de riesgo, monitoreo de SLA y respuesta ante incidentes 24/7.",
    icon: ShieldCheck,
  },
];

export default function PrismaCommercePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0E1A] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(108,99,255,0.35),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(0,255,255,0.25),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(255,0,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27192%27 height=%27192%27 viewBox=%270%200%20192%20192%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23ffffff0f%27 fill-opacity=%270.4%27%3E%3Ccircle cx=%2796%27 cy=%2796%27 r=%272%27/%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="relative z-10">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-24 sm:px-8 lg:flex-row lg:items-center lg:pt-32">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-[18px]">
              <Wand2 className="h-4 w-4 text-[#00FFFF]" />
              <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                Prisma Dev presenta
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.07] sm:text-5xl lg:text-[3.6rem]">
              Prisma Commerce: el núcleo digital que impulsa tu retail en cada dimensión.
            </h1>
            <p className="text-base text-white/80 sm:text-lg lg:text-xl">
              Una suite orquestada por Prisma Dev que combina comercio omnicanal, inventario
              cuántico, analítica avanzada y una arquitectura cloud-native lista para escalar sin
              freno.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#6C63FF] via-[#00FFFF] to-[#FF00FF] text-white shadow-[0_25px_60px_rgba(0,255,255,0.25)] hover:shadow-[0_28px_70px_rgba(255,0,255,0.32)]"
              >
                Solicitar tour guiado
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto border border-white/20 bg-white/5 text-white/85 hover:bg-white/10"
              >
                Descargar overview técnico
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/70 sm:grid-cols-4">
              <div className="space-y-2 rounded-3xl bg-white/5 p-4 backdrop-blur-[45px]">
                <p className="text-3xl font-semibold text-white">30+</p>
                <p className="text-xs uppercase tracking-wide">Países operando</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-white/5 p-4 backdrop-blur-[45px]">
                <p className="text-3xl font-semibold text-white">99.98%</p>
                <p className="text-xs uppercase tracking-wide">Disponibilidad cloud</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-white/5 p-4 backdrop-blur-[45px]">
                <p className="text-3xl font-semibold text-white">45 ms</p>
                <p className="text-xs uppercase tracking-wide">Tiempo medio respuesta</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-white/5 p-4 backdrop-blur-[45px]">
                <p className="text-3xl font-semibold text-white">∞</p>
                <p className="text-xs uppercase tracking-wide">Escalabilidad multi-tienda</p>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-[38px] bg-gradient-to-br from-[#6C63FF]/25 via-[#00FFFF]/20 to-[#FF00FF]/20 blur-3xl" />
              <div className={`relative overflow-hidden border-white/10 bg-white/8 ${glowPanel}`}>
                <CardContent className="space-y-6 p-8">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <p className="tracking-[0.35em] uppercase">Prisma Runtime</p>
                    <Cloud className="h-5 w-5 text-[#00FFFF]" />
                  </div>
                  <h2 className="text-2xl font-semibold leading-snug text-white">
                    Microservicios orquestados, pipelines de datos y eventos en tiempo real.
                  </h2>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 backdrop-blur-2xl">
                    <p className="text-sm">
                      “Prisma Commerce reemplazó 7 herramientas aisladas. Ahora cada venta, stock y
                      campaña fluye en un solo sistema.”
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00FFFF]" />
                      <div>
                        <p className="font-semibold text-white">Santiago Ríos</p>
                        <p>Director de Innovación - Prisma Dev</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Motor</p>
                      <p className="mt-2 text-white">API GraphQL + eventos Kafka</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Cloud</p>
                      <p className="mt-2 text-white">AWS, Azure o GCP multi región</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Observabilidad</p>
                      <p className="mt-2 text-white">Logs, métricas y traces con IA</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/50">Integraciones</p>
                      <p className="mt-2 text-white">ERP, POS, CRM, pasarelas +</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-white/10 bg-white/5/5 p-[1px] backdrop-blur-[50px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_75px_rgba(0,0,0,0.35)]"
              >
                <CardContent className="h-full space-y-4 rounded-[28px] border border-white/10 bg-[#10162A]/70 px-6 py-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/40 via-[#00FFFF]/35 to-[#FF00FF]/35 text-white shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-white/75">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
          <div className="mb-12 text-center lg:text-left">
            <label className="text-xs uppercase tracking-[0.35em] text-white/70">
              Arquitectura Prisma Commerce
            </label>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Capas modulares, eventos en streaming y control total.
            </h2>
            <p className="mt-4 max-w-3xl text-base text-white/75">
              Prisma Commerce se construye sobre una arquitectura hexagonal, con microservicios
              desacoplados que se comunican vía GraphQL y event streaming. Cada módulo se acopla a
              tu estrategia sin fricción.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="border-white/10 bg-white/5/5 backdrop-blur-[45px]">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center gap-3 text-white/70">
                  <Cpu className="h-5 w-5 text-[#FF00FF]" />
                  <p className="text-sm tracking-[0.25em] uppercase">Capa central</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {moduleItems.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="rounded-3xl border border-white/10 bg-[#141C32]/80 p-5">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/40 to-[#00FFFF]/35">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                      <p className="mt-2 text-sm text-white/75">{description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="border-white/10 bg-white/5/5 backdrop-blur-[45px]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span className="uppercase tracking-[0.3em]">Datos y AI</span>
                    <Terminal className="h-5 w-5 text-[#6C63FF]" />
                  </div>
                  <p className="text-base leading-relaxed text-white/80">
                    Pipelines ETL gestionados, data lake, modelos de predicción de demanda y motor
                    de recomendaciones activados por Prisma AI Studio.
                  </p>
                  <ul className="space-y-3 text-sm text-white/70">
                    <li>• Forecast de inventarios y reabastecimiento automático.</li>
                    <li>• Segmentación de clientes y campañas omnicanal.</li>
                    <li>• Monitor QR y panel financiero con insights accionables.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5/5 backdrop-blur-[45px]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3 text-white/70">
                    <Layers className="h-5 w-5 text-[#00FFFF]" />
                    <p className="text-sm uppercase tracking-[0.3em]">Playbooks Prisma Dev</p>
                  </div>
                  <p className="text-sm text-white/75">
                    Librería de mejores prácticas para retail, delivery, marketplaces y franquicias.
                    Activa módulos y flujos listos para ejecutarse en días, no en meses.
                  </p>
                  <Link
                    href="#contacto"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00FFFF] hover:text-[#6C63FF]"
                  >
                    Conocer roadmaps <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-8" id="contacto">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/5/5 p-[1px] shadow-[0_35px_85px_rgba(0,0,0,0.45)] backdrop-blur-[55px]">
            <div className="rounded-[34px] bg-[#10162A]/75 px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-6 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Prisma Dev Services
                  </p>
                  <h2 className="text-3xl font-semibold sm:text-4xl">
                    Lanza Prisma Commerce con acompañamiento estratégico end-to-end.
                  </h2>
                  <p className="text-base text-white/75 sm:max-w-xl">
                    Nuestro equipo diseña arquitectura, integra sistemas legados, migra datos y
                    opera tu plataforma con SLA respaldado por expertos.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-[#6C63FF] via-[#00FFFF] to-[#FF00FF] text-white shadow-[0_20px_60px_rgba(0,255,255,0.3)]"
                    >
                      Agendar consultoría
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-full sm:w-auto border border-white/20 bg-white/5 text-white/85 hover:bg-white/10"
                      asChild
                    >
                      <Link href="/contact">Hablar con Prisma Dev</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/75 backdrop-blur-[55px]">
                  <h3 className="text-lg font-semibold text-white">Plan de despliegue prisma</h3>
                  <ul className="mt-4 space-y-3">
                    <li>1. Discovery tecnológico y roadmap por fases.</li>
                    <li>2. Integración de POS, ERP, marketplaces y logística.</li>
                    <li>3. Formación del equipo y activación de analytics.</li>
                    <li>4. Soporte 24/7 con monitoreo y mejoras continuas.</li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.25em] text-white/60">
                    Prisma Commerce es un producto insignia del ecosistema Prisma Dev.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/20 py-10 backdrop-blur-[40px]">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-white/60 sm:flex-row sm:px-8">
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Prisma Dev</p>
              <p>© {new Date().getFullYear()} Prisma Commerce. All rights reserved.</p>
            </div>
            <div className="flex gap-4 text-white/60">
              <Link href="/privacy" className="hover:text-[#00FFFF]">
                Privacidad
              </Link>
              <Link href="/legal" className="hover:text-[#00FFFF]">
                Legal
              </Link>
              <Link href="/status" className="hover:text-[#00FFFF]">
                Status
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}


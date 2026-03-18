import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import SeoHubSection from "@/components/SeoHubSection";
import PersonalizedNextStep from "@/components/PersonalizedNextStep";
import SEOHead from "@/components/SEOHead";
import StickyProofBar from "@/components/StickyProofBar";
import DeferredSection from "@/components/DeferredSection";
import { organizationSchema, websiteSchema, faqSchema, localBusinessSchema } from "@/lib/seo-schemas";
import { SITE_URL } from "@/lib/site";

// Below-fold components — lazy loaded
const StatsSection = lazy(() => import("@/components/StatsSection"));
const PurposeSection = lazy(() => import("@/components/PurposeSection"));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const TrustCredentials = lazy(() => import("@/components/TrustCredentials"));
const LegalServicesSection = lazy(() => import("@/components/LegalServicesSection"));
const MortgageCalculator = lazy(() => import("@/components/MortgageCalculator"));
const NewsletterSignup = lazy(() => import("@/components/NewsletterSignup"));
const HomeContactSection = lazy(() => import("@/components/HomeContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Legado Inmobiliaria | Propiedades de Lujo en Benidorm y Costa Blanca"
        description="Tu boutique inmobiliaria. Más de 900 propiedades exclusivas en Benidorm, Alicante y la Costa Blanca, y propiedades seleccionadas en destinos internacionales."
        canonical={SITE_URL}
        jsonLd={[organizationSchema, websiteSchema, faqSchema, localBusinessSchema]}
      />
      <StickyProofBar />
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <PersonalizedNextStep
        title="A more relevant homepage for each returning buyer"
        description="If you've already explored Finestrat, mortgage guidance, Benidorm apartments or specific homes, this section helps you resume the right route instead of showing the same generic starting point again."
      />
      <Suspense fallback={null}>
        <DeferredSection minHeight={180}>
          <StatsSection />
        </DeferredSection>
        <DeferredSection minHeight={560}>
          <PurposeSection />
        </DeferredSection>
        <DeferredSection minHeight={460}>
          <WhyChooseUs />
        </DeferredSection>
        <DeferredSection minHeight={420}>
          <LegalServicesSection />
        </DeferredSection>
        <DeferredSection minHeight={520}>
          <TrustCredentials />
        </DeferredSection>
        <DeferredSection minHeight={420}>
          <MortgageCalculator />
        </DeferredSection>
        <DeferredSection minHeight={380}>
          <SeoHubSection
            title="Find the right route, then move into real property pages"
            description="Start from the main Alicante province landing, jump into the strongest area routes and use the guides only when they help you shortlist faster. The goal is always to reach concrete homes and their enquiry forms with more confidence."
          />
        </DeferredSection>
        <DeferredSection minHeight={260}>
          <NewsletterSignup source="home" />
        </DeferredSection>
        <DeferredSection minHeight={320}>
          <HomeContactSection />
        </DeferredSection>
        <DeferredSection minHeight={420}>
          <Testimonials />
        </DeferredSection>
        <DeferredSection minHeight={260}>
          <Footer />
        </DeferredSection>
      </Suspense>
    </main>
  );
};

export default Index;

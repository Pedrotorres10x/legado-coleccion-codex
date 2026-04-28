import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Critical path — load eagerly
import Index from "./pages/Index";

// Everything else — lazy loaded (code-split)
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const SeoLandingPage = lazy(() => import("./pages/SeoLandingPage"));
const SeoGuidePage = lazy(() => import("./pages/SeoGuidePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPush = lazy(() => import("./pages/AdminPush"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSEO = lazy(() => import("./pages/AdminSEO"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminNewsletter = lazy(() => import("./pages/AdminNewsletter"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));

const GuiaResidentes = lazy(() => import("./pages/GuiaResidentes"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));
const PushNotificationModal = lazy(() => import("./components/PushNotificationModal"));
import ContentProtection from "./components/ContentProtection";
import NavigationGuard from "./components/NavigationGuard";
import PageTracker from "./components/PageTracker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — avoid refetching on every mount
      gcTime: 30 * 60 * 1000,         // 30 min cache
      refetchOnWindowFocus: false,     // don't refetch on tab switch
      retry: 1,                        // one retry only
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ContentProtection />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationGuard />
        <PageTracker />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/property-for-sale-alicante-province" element={<SeoLandingPage slug="property-for-sale-alicante-province" />} />
            <Route path="/property-for-sale-benidorm" element={<SeoLandingPage slug="property-for-sale-benidorm" />} />
            <Route path="/property-for-sale-altea" element={<SeoLandingPage slug="property-for-sale-altea" />} />
            <Route path="/property-for-sale-finestrat" element={<SeoLandingPage slug="property-for-sale-finestrat" />} />
            <Route path="/property-for-sale-alicante-city" element={<SeoLandingPage slug="property-for-sale-alicante-city" />} />
            <Route path="/property-for-sale-orihuela-costa" element={<SeoLandingPage slug="property-for-sale-orihuela-costa" />} />
            <Route path="/property-for-sale-torrevieja" element={<SeoLandingPage slug="property-for-sale-torrevieja" />} />
            <Route path="/apartments-for-sale-benidorm" element={<SeoLandingPage slug="apartments-for-sale-benidorm" />} />
            <Route path="/sea-view-apartments-benidorm" element={<SeoLandingPage slug="sea-view-apartments-benidorm" />} />
            <Route path="/property-under-200k-benidorm" element={<SeoLandingPage slug="property-under-200k-benidorm" />} />
            <Route path="/villas-for-sale-altea" element={<SeoLandingPage slug="villas-for-sale-altea" />} />
            <Route path="/new-build-property-finestrat" element={<SeoLandingPage slug="new-build-property-finestrat" />} />
            <Route path="/new-build-property-orihuela-costa" element={<SeoLandingPage slug="new-build-property-orihuela-costa" />} />
            <Route path="/property-for-sale-villamartin" element={<SeoLandingPage slug="property-for-sale-villamartin" />} />
            <Route path="/property-for-sale-la-zenia" element={<SeoLandingPage slug="property-for-sale-la-zenia" />} />
            <Route path="/property-for-sale-cabo-roig" element={<SeoLandingPage slug="property-for-sale-cabo-roig" />} />
            <Route path="/property-for-sale-campoamor" element={<SeoLandingPage slug="property-for-sale-campoamor" />} />
            <Route path="/property-for-sale-playa-de-san-juan" element={<SeoLandingPage slug="property-for-sale-playa-de-san-juan" />} />
            <Route path="/property-for-sale-el-campello" element={<SeoLandingPage slug="property-for-sale-el-campello" />} />
            <Route path="/property-for-sale-santa-pola" element={<SeoLandingPage slug="property-for-sale-santa-pola" />} />
            <Route path="/property-for-sale-guardamar-del-segura" element={<SeoLandingPage slug="property-for-sale-guardamar-del-segura" />} />
            <Route path="/property-for-sale-ciudad-quesada-rojales" element={<SeoLandingPage slug="property-for-sale-ciudad-quesada-rojales" />} />
            <Route path="/property-for-sale-rojales" element={<SeoLandingPage slug="property-for-sale-rojales" />} />
            <Route path="/property-for-sale-pilar-de-la-horadada" element={<SeoLandingPage slug="property-for-sale-pilar-de-la-horadada" />} />
            <Route path="/property-for-sale-san-miguel-de-salinas" element={<SeoLandingPage slug="property-for-sale-san-miguel-de-salinas" />} />
            <Route path="/property-for-sale-villajoyosa" element={<SeoLandingPage slug="property-for-sale-villajoyosa" />} />
            <Route path="/property-for-sale-la-nucia" element={<SeoLandingPage slug="property-for-sale-la-nucia" />} />
            <Route path="/property-for-sale-alfaz-del-pi" element={<SeoLandingPage slug="property-for-sale-alfaz-del-pi" />} />
            <Route path="/property-for-sale-calpe" element={<SeoLandingPage slug="property-for-sale-calpe" />} />
            <Route path="/property-for-sale-moraira" element={<SeoLandingPage slug="property-for-sale-moraira" />} />
            <Route path="/property-for-sale-javea" element={<SeoLandingPage slug="property-for-sale-javea" />} />
            <Route path="/property-for-sale-denia" element={<SeoLandingPage slug="property-for-sale-denia" />} />
            <Route path="/best-areas-to-buy-property-in-alicante-province" element={<SeoGuidePage slug="best-areas-to-buy-property-in-alicante-province" />} />
            <Route path="/guides/how-to-buy-property-in-alicante-as-a-foreigner" element={<SeoGuidePage slug="guides/how-to-buy-property-in-alicante-as-a-foreigner" />} />
            <Route path="/guides/mortgage-in-spain-for-non-residents" element={<SeoGuidePage slug="guides/mortgage-in-spain-for-non-residents" />} />
            <Route path="/guides/legal-process-for-buying-property-in-spain" element={<SeoGuidePage slug="guides/legal-process-for-buying-property-in-spain" />} />
            <Route path="/propiedad/:slug" element={<PropertyDetail />} />
            {/* Retrocompatibilidad: UUID directo sin slug */}
            <Route path="/propiedad/:slug/*" element={<PropertyDetail />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/aviso-legal" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/push" element={<AdminPush />} />
            <Route path="/admin/seo" element={<AdminSEO />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/gracias" element={<ThankYou />} />
            <Route path="/guia-residentes" element={<GuiaResidentes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <Suspense fallback={null}>
          <CookieBanner />
          <PushNotificationModal />
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

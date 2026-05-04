import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { seoLandingSlugs } from "@/lib/seoLandingPages";
import { seoGuidePages } from "@/lib/seoGuidePages";

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

const PropertySlugRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/propiedad/${slug}`} replace />;
};

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
            {seoLandingSlugs.map((slug) => (
              <Route key={slug} path={`/${slug}`} element={<SeoLandingPage slug={slug} />} />
            ))}
            {Object.keys(seoGuidePages).map((slug) => (
              <Route key={slug} path={`/${slug}`} element={<SeoGuidePage slug={slug} />} />
            ))}
            <Route path="/propiedad/:slug" element={<PropertyDetail />} />
            {/* Retrocompatibilidad: strip any trailing path segments → canonical URL */}
            <Route path="/propiedad/:slug/*" element={<PropertySlugRedirect />} />
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

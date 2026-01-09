import { AppProvider, useApp } from '@/contexts/AppContext';
import { Navbar } from '@/components/Navbar';
import { MusicPlayerBar } from '@/components/MusicPlayerBar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@/lib/utils';
import React, { Suspense, lazy, memo, useEffect, useState, useMemo } from 'react';

// Lazy load all components for better performance
const Dashboard = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })));
const Notes = lazy(() => import('@/components/Notes').then(m => ({ default: m.Notes })));
const Prompts = lazy(() => import('@/components/Prompts').then(m => ({ default: m.Prompts })));
const Snippets = lazy(() => import('@/components/Snippets').then(m => ({ default: m.Snippets })));
const Cheatsheet = lazy(() => import('@/components/Cheatsheet').then(m => ({ default: m.Cheatsheet })));
const Kanban = lazy(() => import('@/components/Kanban').then(m => ({ default: m.Kanban })));
const Passwords = lazy(() => import('@/components/Passwords').then(m => ({ default: m.Passwords })));
const Contacts = lazy(() => import('@/components/Contacts').then(m => ({ default: m.Contacts })));
const Checklists = lazy(() => import('@/components/Checklists').then(m => ({ default: m.Checklists })));
const Finance = lazy(() => import('@/components/Finance').then(m => ({ default: m.Finance })));
const Diary = lazy(() => import('@/components/Diary').then(m => ({ default: m.Diary })));
const Draft = lazy(() => import('@/components/Draft').then(m => ({ default: m.Draft })));
const Favorites = lazy(() => import('@/components/Favorites').then(m => ({ default: m.Favorites })));
const Wellness = lazy(() => import('@/components/Wellness').then(m => ({ default: m.Wellness })));
const Settings = lazy(() => import('@/components/Settings').then(m => ({ default: m.Settings })));
const MusicPlayer = lazy(() => import('@/components/MusicPlayer').then(m => ({ default: m.MusicPlayer })));
const Budgets = lazy(() => import('@/components/Budgets').then(m => ({ default: m.Budgets })));
const Pricing = lazy(() => import('@/components/Pricing').then(m => ({ default: m.Pricing })));
const Stock = lazy(() => import('@/components/Stock').then(m => ({ default: m.Stock })));
const TechSheet = lazy(() => import('@/components/TechSheet').then(m => ({ default: m.TechSheet })));
const Tutorial = lazy(() => import('@/components/Tutorial'));

// Loading fallback component
const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

// Component map for cleaner rendering
const COMPONENT_MAP: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: Dashboard,
  tutorial: Tutorial,
  favorites: Favorites,
  notes: Notes,
  prompts: Prompts,
  snippets: Snippets,
  cheatsheet: Cheatsheet,
  kanban: Kanban,
  checklists: Checklists,
  passwords: Passwords,
  contacts: Contacts,
  orcamentos: Budgets,
  precificador: Pricing,
  estoque: Stock,
  fichatecnica: TechSheet,
  finance: Finance,
  diary: Diary,
  wellness: Wellness,
  musica: MusicPlayer,
  draft: Draft,
  settings: Settings,
};

const MainContent = memo(() => {
  const { currentTab, state, setCurrentTab } = useApp();

  // Redirect to dashboard if module is disabled
  useEffect(() => {
    if (!state.enabledModules.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, state.enabledModules, setCurrentTab]);

  const Component = useMemo(() => COMPONENT_MAP[currentTab], [currentTab]);

  if (!Component) {
    return <Dashboard />;
  }

  return (
    <main className="container py-6">
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </main>
  );
});
MainContent.displayName = 'MainContent';

const Index = () => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(() => {
    const saved = localStorage.getItem('mini-player-visible');
    return saved !== 'false';
  });

  useEffect(() => {
    const checkVisibility = () => {
      const saved = localStorage.getItem('mini-player-visible');
      setIsPlayerVisible(saved !== 'false');
    };
    
    // Listen only to storage events (from other tabs)
    window.addEventListener('storage', checkVisibility);
    
    return () => {
      window.removeEventListener('storage', checkVisibility);
    };
  }, []);

  return (
    <AppProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <MusicPlayerBar />
          <AppSidebar />
          <SidebarInset className={cn("flex-1", isPlayerVisible ? "pt-[70px]" : "pt-[25px]")}>
            <Navbar />
            <MainContent />
          </SidebarInset>
        </div>
        <CommandPalette />
      </SidebarProvider>
    </AppProvider>
  );
};

export default Index;
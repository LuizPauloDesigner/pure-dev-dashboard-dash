import { AppProvider, useApp } from '@/contexts/AppContext';
import { Navbar } from '@/components/Navbar';
import { MusicPlayerBar } from '@/components/MusicPlayerBar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@/lib/utils';
import React, { memo, useEffect, useState } from 'react';

// Direct imports for instant loading
import { Dashboard } from '@/components/Dashboard';
import { Notes } from '@/components/Notes';
import { Prompts } from '@/components/Prompts';
import { Snippets } from '@/components/Snippets';
import { Cheatsheet } from '@/components/Cheatsheet';
import { Kanban } from '@/components/Kanban';
import { Passwords } from '@/components/Passwords';
import { Contacts } from '@/components/Contacts';
import { Checklists } from '@/components/Checklists';
import { Finance } from '@/components/Finance';
import { Diary } from '@/components/Diary';
import { Draft } from '@/components/Draft';
import { Favorites } from '@/components/Favorites';
import { Wellness } from '@/components/Wellness';
import { Settings } from '@/components/Settings';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Budgets } from '@/components/Budgets';
import { Pricing } from '@/components/Pricing';
import { Stock } from '@/components/Stock';
import { TechSheet } from '@/components/TechSheet';
import Tutorial from '@/components/Tutorial';

// Component map for cleaner rendering
const COMPONENT_MAP: Record<string, React.ComponentType> = {
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

  const Component = COMPONENT_MAP[currentTab] || Dashboard;

  return (
    <main className="container py-6">
      <Component />
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
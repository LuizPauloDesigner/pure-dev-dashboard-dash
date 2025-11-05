import { AppProvider, useApp } from '@/contexts/AppContext';
import { Navbar } from '@/components/Navbar';
import { MusicPlayerBar } from '@/components/MusicPlayerBar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@/lib/utils';
import React from 'react';

const MainContent = () => {
  const { currentTab } = useApp();

  return (
    <main className="container py-6">
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'favorites' && <Favorites />}
      {currentTab === 'notes' && <Notes />}
      {currentTab === 'prompts' && <Prompts />}
      {currentTab === 'snippets' && <Snippets />}
      {currentTab === 'cheatsheet' && <Cheatsheet />}
      {currentTab === 'kanban' && <Kanban />}
      {currentTab === 'checklists' && <Checklists />}
      {currentTab === 'passwords' && <Passwords />}
      {currentTab === 'contacts' && <Contacts />}
      {currentTab === 'orcamentos' && <Budgets />}
      {currentTab === 'precificador' && <Pricing />}
      {currentTab === 'finance' && <Finance />}
      {currentTab === 'diary' && <Diary />}
      {currentTab === 'wellness' && <Wellness />}
      {currentTab === 'musica' && <MusicPlayer />}
      {currentTab === 'draft' && <Draft />}
      {currentTab === 'settings' && <Settings />}
    </main>
  );
};

const Index = () => {
  const [isPlayerVisible, setIsPlayerVisible] = React.useState(() => {
    const saved = localStorage.getItem('mini-player-visible');
    return saved !== 'false';
  });

  React.useEffect(() => {
    const checkVisibility = () => {
      const saved = localStorage.getItem('mini-player-visible');
      setIsPlayerVisible(saved !== 'false');
    };
    
    window.addEventListener('storage', checkVisibility);
    const interval = setInterval(checkVisibility, 100);
    
    return () => {
      window.removeEventListener('storage', checkVisibility);
      clearInterval(interval);
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

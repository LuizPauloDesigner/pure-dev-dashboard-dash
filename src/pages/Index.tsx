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
import { Finance } from '@/components/Finance';
import { Diary } from '@/components/Diary';
import { Draft } from '@/components/Draft';
import { Favorites } from '@/components/Favorites';
import { Wellness } from '@/components/Wellness';
import { Settings } from '@/components/Settings';
import { CommandPalette } from '@/components/CommandPalette';

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
        {currentTab === 'passwords' && <Passwords />}
        {currentTab === 'contacts' && <Contacts />}
        {currentTab === 'finance' && <Finance />}
      {currentTab === 'diary' && <Diary />}
      {currentTab === 'wellness' && <Wellness />}
      {currentTab === 'draft' && <Draft />}
      {currentTab === 'settings' && <Settings />}
    </main>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Navbar />
            <MusicPlayerBar />
            <MainContent />
          </SidebarInset>
        </div>
        <CommandPalette />
      </SidebarProvider>
    </AppProvider>
  );
};

export default Index;

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Star,
  FileText,
  Sparkles,
  Code,
  BookOpen,
  Columns,
  Lock,
  User,
  DollarSign,
  Calendar,
  FileEdit,
  Settings,
  Heart,
  LucideIcon,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon | string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wellness', label: 'Bem-Estar', icon: Heart },
  { id: 'favorites', label: 'Favoritos', icon: Star },
  { id: 'notes', label: 'Notas', icon: FileText },
  { id: 'prompts', label: 'Prompts IA', icon: Sparkles },
  { id: 'snippets', label: 'Snippets', icon: Code },
  { id: 'cheatsheet', label: 'Cheatsheet', icon: BookOpen },
  { id: 'kanban', label: 'Kanban', icon: Columns },
  { id: 'passwords', label: 'Senhas', icon: Lock },
  { id: 'contacts', label: 'Contatos', icon: User },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'diary', label: 'Diário', icon: Calendar },
  { id: 'draft', label: 'Rascunho', icon: FileEdit },
  { id: 'settings', label: 'Config', icon: Settings },
];

export function AppSidebar() {
  const { currentTab, setCurrentTab } = useApp();
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'justify-center' : ''}>
            {isCollapsed ? '📋' : 'Central de Comando'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                const IconComponent = typeof item.icon !== 'string' ? item.icon : null;
                const iconString = typeof item.icon === 'string' ? item.icon : null;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setCurrentTab(item.id);
                        // Fechar sidebar em mobile após selecionar
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      {IconComponent ? (
                        <IconComponent className="h-4 w-4" />
                      ) : (
                        <span className="text-base mr-2">{iconString}</span>
                      )}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

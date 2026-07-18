import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
    const closeSidebar = useCallback(() => setIsOpen(false), []);

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

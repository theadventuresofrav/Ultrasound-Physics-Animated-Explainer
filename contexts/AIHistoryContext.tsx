
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { AIHistoryItem } from '../types';
import { supabase } from '../lib/supabaseClient';

const AI_HISTORY_STORAGE_KEY = 'echoMastersAIHistory';

interface AIHistoryContextType {
    history: AIHistoryItem[];
    addHistoryItem: (item: Omit<AIHistoryItem, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
}

const AIHistoryContext = createContext<AIHistoryContextType | undefined>(undefined);

export const AIHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<AIHistoryItem[]>([]);

    useEffect(() => {
        const initializeHistory = async () => {
            // 1. Try to load from Supabase
            try {
                const { data, error } = await supabase
                    .from('ai_history')
                    .select('*')
                    .order('timestamp', { ascending: false });

                if (data && !error) {
                    console.log("Cloud Sync: AI History retrieved from Supabase.");
                    setHistory(data);
                    return;
                }
            } catch (err) {
                console.warn("Supabase History Link: Handshake failed.");
            }

            // 2. Fallback to local
            try {
                const storedHistory = localStorage.getItem(AI_HISTORY_STORAGE_KEY);
                if (storedHistory) {
                    setHistory(JSON.parse(storedHistory));
                }
            } catch (error) {
                console.error("Failed to load AI history from localStorage", error);
            }
        };

        initializeHistory();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(AI_HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save AI history to localStorage", error);
        }
    }, [history]);

    const addHistoryItem = useCallback(async (item: Omit<AIHistoryItem, 'id' | 'timestamp'>) => {
        const newItem: AIHistoryItem = {
            ...item,
            id: `ai-hist-${Date.now()}`,
            timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev]);

        // Mirror to Cloud
        try {
            await supabase.from('ai_history').insert(newItem);
        } catch (e) {
            // Network silent fail
        }
    }, []);

    const clearHistory = useCallback(async () => {
        if (window.confirm("Are you sure you want to clear all saved AI content? This will also wipe the cloud database.")) {
            setHistory([]);
            try {
                // Delete all history from cloud
                await supabase.from('ai_history').delete().neq('id', 'void');
            } catch (e) {
                console.error("Cloud Wipe Failed");
            }
        }
    }, []);

    return (
        <AIHistoryContext.Provider value={{ history, addHistoryItem, clearHistory }}>
            {children}
        </AIHistoryContext.Provider>
    );
};

export const useAIHistory = (): AIHistoryContextType => {
    const context = useContext(AIHistoryContext);
    if (context === undefined) {
        throw new Error('useAIHistory must be used within an AIHistoryProvider');
    }
    return context;
};

import React, { useState, useEffect } from "react";
import { ChevronRight, Send, Bot } from "lucide-react";
import { useRecoilValue } from "recoil";
import { getRecoil } from "recoil-nexus";
import { userAtom } from "../state/userAtom";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE = import.meta.env.VITE_BE_URL ?? 'http://localhost:3333';

interface AIAssistantProps {
  documentId: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIAssistant({ documentId, isOpen, onToggle }: AIAssistantProps) {
  const user = useRecoilValue(userAtom);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    // Constrain width between 250px and 600px
    const constrainedWidth = Math.max(250, Math.min(600, newWidth));
    setSidebarWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      const response = await fetch(API_BASE + `/api/documents/${documentId}/ai-query`, {
        method: 'POST',
        headers: {
        "Authorization": `Bearer ${getRecoil(userAtom)?.token}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI query error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-md text-sm"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-20 right-0 z-50 h-12 w-12 bg-[var(--sidebar)] border border-[var(--sidebar-border)] rounded-l-md flex items-center justify-center text-white hover:bg-[var(--sidebar-hover)] transition-all duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Toggle AI Assistant"
      >
        <Bot size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-16 right-0 h-[calc(100%-64px)] bg-[var(--sidebar)] text-white border-l border-[var(--sidebar-border)] transition-all duration-200 ease-in-out ${
          isOpen ? '' : 'w-0'
        }`}
        style={{ width: isOpen ? `${sidebarWidth}px` : '0px' }}
        aria-label="AI Assistant"
      >
        {/* Resize Handle */}
        {isOpen && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--sidebar-border)] hover:bg-[var(--accent)] cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />
        )}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-[var(--sidebar-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="text-sm font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white"
              aria-label="Close AI Assistant"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <p>Ask me anything about your code!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    <div className="text-sm">
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--sidebar-border)] p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your code..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-[var(--accent)]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="px-3 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
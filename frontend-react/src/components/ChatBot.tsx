import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Minimize2, Maximize2, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useChatStore } from '@/store/useChatStore';
import { GEMINI_API_KEY, DATABASE_URL, isGeminiEnabled, isDatabaseEnabled } from '@/config/env';
import { useLocation } from 'react-router-dom';

// Initialize Gemini API with validation
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

if (isGeminiEnabled()) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

// System prompt for the financial AI assistant
const SYSTEM_PROMPT = `You are a helpful financial AI assistant for FinTechForge, a comprehensive financial platform. Your role is to:
1. Help users navigate the website and understand features
2. Provide information about financial tools and services
3. Answer questions about:
   - Market data and analysis
   - Stock and crypto heatmaps
   - Currency conversion
   - Financial news
   - Portfolio tracking
   - AI-powered insights
4. Guide users through onboarding and account features
5. Explain financial concepts in simple terms
Keep responses concise, professional, and focused on financial topics. If asked about non-financial topics, politely redirect to financial matters.
Always maintain a helpful and friendly tone while being professional.`;

// Use the system prompt in chat initialization
const createChatPrompt = (contextChunks: string[]) => `
${SYSTEM_PROMPT}

Context:
${contextChunks.join('\n\n')}

Respond professionally using only financial domain knowledge.
If the topic is unclear or irrelevant, politely redirect the user.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatBot() {
  const location = useLocation();
  const { setChatOpen } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your FinTechForge AI assistant. How can I help you with your financial needs today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChatHistory = () => {
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your FinTechForge AI assistant. How can I help you with your financial needs today?',
      timestamp: Date.now()
    }]);
    localStorage.removeItem('chatHistory');
    toast.success('Chat history cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isGeminiEnabled()) {
      toast.error('Gemini API key is missing. ChatBot functionality is not available.');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      let contextChunks: string[] = [];

      if (isDatabaseEnabled()) {
        try {
          const res = await fetch(`${DATABASE_URL}/chroma-search?q=${encodeURIComponent(userMessage)}`);
          if (res.ok) {
            contextChunks = await res.json();
          }
        } catch (error) {
          console.warn('Failed to fetch context chunks:', error);
        }
      }

      const dynamicPrompt = createChatPrompt(contextChunks);

      const conversationHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      if (!model) {
        throw new Error('Gemini model is not initialized');
      }

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: dynamicPrompt }] },
          ...conversationHistory,
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      setChatOpen(next);
      return next;
    });
    if (!isOpen) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hide chatbot on 404/NotFound page and other non-existing pages
  const shouldHideChatBot = () => {
    const currentPath = location.pathname;
    
    // Define all valid routes explicitly
    const validRoutes = [
      '/',
      '/News',
      '/map',
      '/About',
      '/Features', 
      '/Premium',
      '/Pricing',
      '/Community',
      '/profile',
      '/education',
      '/Login',
      '/SignUp',
      '/verifymail',
      '/forgot-password',
      // Dashboard routes
      '/dashboard',
      '/dashboard/news',
      '/dashboard/analysis',
      '/dashboard/finance-chatbot',
      '/dashboard/currencyconvertor',
      '/dashboard/stock-heatmap',
      '/dashboard/crypto-heatmap',
      '/dashboard/etf-heatmap',
      '/dashboard/forex-heatmap',
      '/dashboard/portfolio'
    ];
    
    // Check for exact matches first
    if (validRoutes.includes(currentPath)) {
      return false;
    }
    
    // Check for dynamic routes with parameters
    const dynamicRoutePatterns = [
      /^\/verifymail\/[^/]+$/, // /verifymail/:verificationToken
      /^\/reset-password\/[^/]+$/ // /reset-password/:resetToken
    ];
    
    const matchesDynamicRoute = dynamicRoutePatterns.some(pattern => 
      pattern.test(currentPath)
    );
    
    // If it matches a dynamic route, don't hide chatbot
    if (matchesDynamicRoute) {
      return false;
    }
    
    // If we get here, it's likely a 404 page - hide chatbot
    return true;
  };
  
  // Don't render chatbot if it should be hidden
  if (shouldHideChatBot()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, stiffness: 200, damping: 25 }}
            className={cn(
              "fixed bottom-6 right-4 z-[10000]",
              "w-[90vw] sm:w-[400px] rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl",
              isMinimized ? "h-[60px]" : "h-[70vh]"
            )}
            style={{
              minHeight: isMinimized ? '60px' : '280px',
              maxHeight: isMinimized ? '60px' : '90vh',
            }}
          >
            {/* Header - Clean blue matching landing page */}
            <div className="flex items-center justify-between p-4 bg-blue-500 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-full bg-white/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm">FinTech AI</span>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                  onClick={clearChatHistory}
                  title="Clear chat history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                  onClick={toggleMinimize}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                  onClick={toggleChat}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <ScrollArea
                  ref={scrollAreaRef}
                  className="flex-1 p-4 bg-gray-50 dark:bg-gray-950"
                  style={{ height: '40vh' }}
                >
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex flex-col gap-1",
                          message.role === 'user' ? 'items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl p-3 text-sm",
                            message.role === 'user'
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {message.role === 'assistant' && (
                              <div className="shrink-0 mt-0.5">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Bot className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="flex-1 leading-relaxed">{message.content}</div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground px-2">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Bot className="w-2.5 h-2.5 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about markets, investments..."
                      className="flex-1 text-sm border-gray-200 dark:border-gray-700"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-blue-500 hover:bg-blue-600 h-9 w-9 shrink-0"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button - Clean blue */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            onClick={toggleChat}
            className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

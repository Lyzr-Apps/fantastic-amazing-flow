'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Send, Menu, X, Copy, Check } from 'lucide-react'

// Types
interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Sample initial conversations for demo
const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'How to learn React',
    messages: [
      {
        id: 'msg-1',
        type: 'user',
        content: 'What is the best way to learn React?',
        timestamp: new Date(Date.now() - 86400000 * 5),
      },
      {
        id: 'msg-2',
        type: 'assistant',
        content:
          'Learning React is best approached through hands-on practice. Start with the official React documentation, then work on small projects like a todo app or calculator. Focus on understanding components, props, and hooks before moving to state management.',
        timestamp: new Date(Date.now() - 86400000 * 5),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'conv-2',
    title: 'Web development roadmap',
    messages: [
      {
        id: 'msg-3',
        type: 'user',
        content: 'What should I learn to become a web developer?',
        timestamp: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: 'msg-4',
        type: 'assistant',
        content:
          'A solid web development foundation includes: HTML & CSS for structure and styling, JavaScript for interactivity, a framework like React or Vue, backend knowledge (Node.js, databases), and version control with Git. Build projects throughout your learning journey.',
        timestamp: new Date(Date.now() - 86400000 * 3),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'conv-3',
    title: 'JavaScript async patterns',
    messages: [
      {
        id: 'msg-5',
        type: 'user',
        content: 'Explain async/await vs promises',
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
      {
        id: 'msg-6',
        type: 'assistant',
        content:
          'Async/await is syntactic sugar over Promises that makes asynchronous code look more synchronous and readable. Promises return a value that resolves or rejects, while async/await lets you write code that looks like synchronous code but actually waits for async operations. Both do the same thing under the hood.',
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
]

const WELCOME_SUGGESTIONS = [
  'Tell me about web development best practices',
  'How do I optimize website performance?',
  'Explain the difference between REST and GraphQL',
  'What are design patterns in software development?',
]

// Message bubble component
function MessageBubble({
  message,
  onCopy,
  isCopied,
}: {
  message: Message
  onCopy: (id: string) => void
  isCopied: string | null
}) {
  const isUser = message.type === 'user'

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 relative group ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-slate-200 text-slate-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-slate-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <button
          onClick={() => onCopy(message.id)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy message"
        >
          {isCopied === message.id ? (
            <Check size={14} className="text-white" />
          ) : (
            <Copy size={14} className="text-white" />
          )}
        </button>
      </div>
    </div>
  )
}

// Conversation card component
function ConversationCard({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation
  active: boolean
  onClick: () => void
}) {
  const preview =
    conversation.messages.length > 0
      ? conversation.messages[conversation.messages.length - 1].content.slice(
          0,
          50
        ) + '...'
      : 'New conversation'

  const timeAgo = getTimeAgo(conversation.updatedAt)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
        active
          ? 'bg-blue-100 border border-blue-300'
          : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
      }`}
    >
      <p
        className={`font-medium text-sm truncate ${
          active ? 'text-blue-900' : 'text-slate-900'
        }`}
      >
        {conversation.title}
      </p>
      <p className="text-xs text-slate-500 truncate mt-1">{preview}</p>
      <p className="text-xs text-slate-400 mt-1">{timeAgo}</p>
    </button>
  )
}

// Loading animation component
function LoadingDots() {
  return (
    <div className="flex gap-1 items-center">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-100" />
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-200" />
    </div>
  )
}

// Utility function to format time
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

// Main component
export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    SAMPLE_CONVERSATIONS
  )
  const [currentConversationId, setCurrentConversationId] = useState<string>(
    SAMPLE_CONVERSATIONS[0].id
  )
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setSidebarOpen(window.innerWidth >= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }, 0)
      }
    }
  }, [currentConversationId, conversations])

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) ||
    conversations[0]

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setConversations((prevConversations) =>
      prevConversations.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date(),
          }
        }
        return conv
      })
    )

    setInputValue('')
    setLoading(true)

    try {
      // Build conversation context - last 10 messages for context
      const recentMessages = currentConversation.messages.slice(-10)
      const conversationHistory = recentMessages
        .map(
          (msg) =>
            `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        )
        .join('\n')

      const fullContext = conversationHistory
        ? `${conversationHistory}\nUser: ${inputValue}`
        : `User: ${inputValue}`

      // Call Chat Assistant Agent via API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullContext,
          agent_id: '69395cb41f3e985c1e3679c7',
        }),
      })

      const data = await response.json()

      let assistantContent = 'I apologize, but I encountered an error processing your request.'

      if (data.success && data.response) {
        // Handle multiple response formats
        assistantContent =
          data.response?.response ||
          data.response?.message ||
          (typeof data.response === 'string' ? data.response : null) ||
          assistantContent
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.id === currentConversationId) {
            // Update title if it's the first message
            const title =
              conv.messages.length === 1
                ? userMessage.content.slice(0, 50)
                : conv.title

            return {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              title,
              updatedAt: new Date(),
            }
          }
          return conv
        })
      )
    } catch (error) {
      console.error('Error calling agent:', error)

      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            }
          }
          return conv
        })
      )
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          type: 'assistant',
          content: 'Hello! I am your AI assistant. How can I help you today?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newConversation.id)

    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleCopyMessage = (messageId: string) => {
    const message = currentConversation.messages.find((m) => m.id === messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    }
  }

  const isWelcomeState = currentConversation.messages.length === 1

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } border-r border-slate-200 bg-slate-50 flex flex-col ${
          isMobile && !sidebarOpen ? 'absolute' : 'relative'
        } z-50 h-full`}
      >
        {sidebarOpen && (
          <>
            <div className="p-4 border-b border-slate-200">
              <Button
                onClick={handleNewChat}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus size={18} className="mr-2" />
                New Chat
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  Conversation History
                </p>
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    active={conversation.id === currentConversationId}
                    onClick={() => {
                      setCurrentConversationId(conversation.id)
                      if (isMobile) {
                        setSidebarOpen(false)
                      }
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900">Chat Assistant</h1>
              <p className="text-xs text-slate-500">
                {getTimeAgo(currentConversation.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-6 overflow-hidden"
        >
          <div className="max-w-4xl mx-auto">
            {currentConversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
                isCopied={copiedMessageId}
              />
            ))}

            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="bg-slate-200 text-slate-900 rounded-lg rounded-bl-none p-3">
                  <LoadingDots />
                </div>
              </div>
            )}

            {isWelcomeState && !loading && (
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Welcome to Chat Assistant
                </h2>
                <p className="text-slate-600 mb-6">
                  Ask me anything and I will do my best to help you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {WELCOME_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(suggestion)
                      }}
                      className="p-4 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-colors"
                    >
                      <p className="text-sm text-slate-700 font-medium">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
              <Button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

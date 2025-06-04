import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Clock10Icon } from "lucide-react";
import useMutation from "@/hooks/useMutation";
import { marked } from "marked";
import { CHATBOT_MESSAGES, OBJECTION_HANDLER } from "@/imports/api";

// const AVATAR_SIZE = 2;

const ChatBot = ({ contact_id, deal_id }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "assistant" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { mutate, loading } = useMutation();
  const { mutate: mutate2 } = useMutation();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), text: inputValue, sender: "user" },
      ]);

      // Simulate assistant response (replace with actual API call later)
      const res = await mutate({
        url: OBJECTION_HANDLER,
        method: "POST",
        data: {
          objection_text: inputValue.trim(),
          contact_id,
          deal_id,
        },
      });
      if (res?.success) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 1,
            text: res?.data?.data?.data,
            sender: "assistant",
          },
        ]);
        mutate2({
          url: CHATBOT_MESSAGES,
          method: "POST",
          data: {
            message_user: inputValue.trim(),
            message_assistant: res?.data?.data?.data,
            history,
          },
        });
      }

      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-2xl bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> DealSensei ChatBot
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Ask me anything about deals, contacts, or sales best practices!
          </p>
        </div>
        <Button
          onClick={() => setHistory(!history)}
          variant={history ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-1 rounded-full transition-all ${
            history ? "" : "hover:text-foreground"
          }`}
          title={history ? "Disable Chat History" : "Enable Chat History"}
        >
          <Clock10Icon className="h-4 w-4" />
          <span className="text-xs">
            {history ? "History On" : "History Off"}
          </span>
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-grow px-4 py-6 space-y-4 bg-muted/50">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            {message.sender === "assistant" && (
              <div className="flex-shrink-0">
                <div className="bg-primary/10 rounded-full p-1">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 mb-2 text-sm shadow-sm border transition-colors ${
                message.sender === "assistant"
                  ? "bg-background text-foreground border-border"
                  : "bg-primary text-primary-foreground border-primary"
              }`}
            >
              {message.sender === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: marked(message.text) }}
                />
              ) : (
                message.text
              )}
            </div>
            {message.sender === "user" && (
              <div className="flex-shrink-0">
                <div className="bg-muted rounded-full p-1">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      {/* Input Area */}
      <div className="p-4 border-t bg-background flex items-center gap-2 sticky bottom-0 z-20 shadow-inner">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-grow mr-2 rounded-full px-4 py-2 shadow-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          onClick={handleSendMessage}
          aria-label="Send message"
          className="rounded-full px-3 py-2 bg-primary hover:bg-primary/90 shadow-md"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
export default ChatBot;

import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';

interface ChatMessage {
    id: number;
    sender: 'user' | 'system';
    text: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 1, sender: 'system', text: "Hi there! How can I help you today? Send a message and we'll get back to you via WhatsApp." }
    ]);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const whatsappUrl = `https://wa.me/message/SBQP4JNPZE6ZC1?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: message }]);
        setMessage('');
    };
    
    const handleAttach = () => {
        setChatHistory(prev => [...prev, { 
            id: Date.now(), 
            sender: 'system', 
            text: "To send a screenshot, please paste it directly into the WhatsApp chat." 
        }]);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 focus:ring-blue-500 z-50"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <XIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in">
                    <header className="bg-stone-50 dark:bg-slate-900 p-4 flex justify-between items-center rounded-t-lg border-b border-stone-200 dark:border-slate-700">
                        <h3 className="font-bold text-stone-800 dark:text-slate-200">Support Chat</h3>
                        <button onClick={toggleChat} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </header>
                    
                    <div ref={chatBodyRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-stone-50 dark:bg-slate-900/50">
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-slate-600'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="p-3 border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
                        <div className="flex items-center bg-stone-100 dark:bg-slate-700 border border-stone-200 dark:border-slate-600 rounded-full pr-2">
                            <button onClick={handleAttach} className="p-2 text-stone-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Attach file">
                                <PaperclipIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-grow bg-transparent p-2 text-stone-800 dark:text-slate-200 focus:outline-none placeholder-stone-400 dark:placeholder-slate-400"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="p-2 text-white rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-stone-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                                aria-label="Send message"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
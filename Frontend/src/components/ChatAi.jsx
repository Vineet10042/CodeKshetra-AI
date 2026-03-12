import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Copy, Check, Edit2, Bot } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ initialCode, language }) => {
    const [code, setCode] = useState(initialCode);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-5 rounded-2xl overflow-hidden bg-[#0d0d0d] border border-neutral-800 w-full text-left shadow-2xl ring-1 ring-white/10 group">
            <div className="bg-[#1a1a1a] px-4 py-3 flex justify-between items-center text-xs font-mono text-neutral-400 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span className="uppercase tracking-widest font-semibold ml-2 text-neutral-300">{language || 'text'}</span>
                </div>
                <div className="flex gap-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 ${isEditing ? 'text-green-400 bg-green-400/10' : ''}`}
                    >
                        <Edit2 size={14} />
                        {isEditing ? 'Done' : 'Edit'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={`hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 ${copied ? 'text-green-400' : ''}`}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            <div className="p-4 text-[14px] text-neutral-100 font-mono overflow-x-auto custom-scrollbar">
                {isEditing ? (
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-transparent outline-none resize-y font-mono leading-relaxed text-neutral-100 selection:bg-primary/30"
                        rows={Math.max(3, code.split('\n').length)}
                        spellCheck={false}
                    />
                ) : (
                    <SyntaxHighlighter
                        language={language || 'javascript'}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: 0,
                            background: 'transparent',
                            fontSize: '14px',
                            lineHeight: '1.6',
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};

const MessageContent = ({ text }) => {
    if (!text) return " ";

    // Split by markdown code block syntax
    const parts = text.split("```");

    return (
        <div className="whitespace-pre-wrap flex flex-col w-full min-w-0 text-[15px] leading-relaxed">
            {parts.map((part, index) => {
                // Even indices are natural text outside of code blocks
                if (index % 2 === 0) {
                    return <span key={index}>{part}</span>;
                }

                // Odd indices are code blocks inside ```
                const firstNewLine = part.indexOf('\n');
                let language = '';
                let code = part;

                if (firstNewLine !== -1) {
                    language = part.substring(0, firstNewLine).trim();
                    code = part.substring(firstNewLine + 1).replace(/\n$/, ''); // Remove trailing newline
                }

                return <CodeBlock key={index} initialCode={code} language={language} />;
            })}
        </div>
    );
};

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            parts: [{ text: `Hello! I'm your AI coding assistant. Ask me anything about the "${problem?.title || 'current'}" problem, and I'll be happy to help you with hints, explanations, or code review!` }]
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (isLoading || !data.message.trim()) return;

        const newUserMessage = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, newUserMessage];

        setMessages(updatedMessages);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data?.message || " " }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message || "Error from AI Chatbot";
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: errorMessage }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[85vh] min-h-[500px] bg-base-100/40 backdrop-blur-2xl rounded-3xl border border-base-300 shadow-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 custom-scrollbar scroll-smooth">
                <div className="max-w-4xl mx-auto space-y-8 flex flex-col pb-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex w-full gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "model" && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 mt-1 border border-primary/20 shadow-sm">
                                    <Bot size={20} className="text-primary" />
                                </div>
                            )}

                            <div className={`max-w-[90%] md:max-w-[85%] ${msg.role === "user"
                                ? "bg-gradient-to-br from-primary to-primary-focus text-primary-content rounded-3xl rounded-tr-sm px-6 py-4 shadow-md"
                                : "bg-base-200/60 backdrop-blur-md text-base-content rounded-3xl rounded-tl-sm px-6 py-4 shadow-sm border border-base-300/50"
                                }`}>
                                <MessageContent text={msg.parts[0]?.text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex w-full gap-4 justify-start animate-in fade-in duration-300">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 mt-1 border border-primary/20 shadow-sm">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div className="bg-base-200/60 backdrop-blur-md text-base-content rounded-3xl rounded-tl-sm px-6 py-4 shadow-sm border border-base-300/50 flex items-center">
                                <span className="loading loading-dots loading-md text-primary/70"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="bg-base-100/80 backdrop-blur-xl p-4 lg:p-6 border-t border-base-300">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="relative flex items-center group"
                    >
                        <input
                            placeholder="Message AI Assistant..."
                            className="w-full bg-base-200/50 hover:bg-base-200/80 text-base-content placeholder-base-content/50 rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-base-200 border border-base-300 shadow-sm transition-all duration-300 text-[15px]"
                            disabled={isLoading}
                            autoComplete="off"
                            {...register("message", { required: true, minLength: 1 })}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary text-primary-content rounded-full hover:bg-primary-focus hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary transition-all duration-200 flex items-center justify-center shadow-md shadow-primary/30"
                            disabled={isLoading}
                        >
                            <Send size={18} className="translate-x-[1px]" />
                        </button>
                    </form>
                    <div className="text-center text-xs text-base-content/40 mt-3 font-medium tracking-wide">
                        AI can make mistakes. Consider verifying important information.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatAi;
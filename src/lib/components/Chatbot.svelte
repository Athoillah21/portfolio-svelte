<script lang="ts">
    import { marked } from "marked";
    import DOMPurify from "dompurify";

    let isOpen = $state(false);
    let input = $state("");
    let sending = $state(false);
    let messages = $state<{ role: "user" | "assistant"; content: string }[]>(
        [],
    );
    let chatContainer: HTMLDivElement;

    function renderMd(text: string): string {
        const html = marked.parse(text, { async: false }) as string;
        return DOMPurify.sanitize(html);
    }

    function scrollToBottom() {
        setTimeout(() => {
            if (chatContainer)
                chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 50);
    }

    async function sendMessage() {
        const text = input.trim();
        if (!text || sending) return;

        messages.push({ role: "user", content: text });
        input = "";
        sending = true;
        scrollToBottom();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                messages.push({ role: "assistant", content: data.reply });
            } else {
                messages.push({
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble responding right now. Please try again!",
                });
            }
        } catch {
            messages.push({
                role: "assistant",
                content: "Network error. Please check your connection.",
            });
        } finally {
            sending = false;
            scrollToBottom();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen && messages.length === 0) {
            messages.push({
                role: "assistant",
                content:
                    "Hi! 👋 I'm Athoillah's AI assistant. Ask me anything about his projects, skills, or experience!",
            });
        }
    }
</script>

<!-- Floating Chat Button -->
<button
    onclick={toggleChat}
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
    style="background: linear-gradient(135deg, #7c3aed, #a855f7); box-shadow: 0 4px 20px rgba(124,58,237,0.4);"
    title="Chat with AI Assistant"
>
    <span class="material-symbols-outlined text-white text-2xl">
        {isOpen ? "close" : "auto_awesome"}
    </span>
</button>

<!-- Chat Window -->
{#if isOpen}
    <div
        class="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden flex flex-col"
        style="height: 480px; background: rgba(10,10,20,0.95); border: 1px solid rgba(147,51,234,0.3); box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(147,51,234,0.1); backdrop-filter: blur(20px);"
    >
        <!-- Header -->
        <div
            class="px-4 py-3 flex items-center gap-3 shrink-0"
            style="background: linear-gradient(135deg, rgba(88,28,135,0.5), rgba(147,51,234,0.3)); border-bottom: 1px solid rgba(147,51,234,0.2);"
        >
            <div
                class="w-9 h-9 rounded-full flex items-center justify-center"
                style="background: rgba(147,51,234,0.3); border: 1px solid rgba(147,51,234,0.5);"
            >
                <span class="material-symbols-outlined text-purple-400 text-lg"
                    >smart_toy</span
                >
            </div>
            <div class="flex-1">
                <p class="text-white text-sm font-medium leading-tight">
                    AI Assistant
                </p>
                <p class="text-purple-300 text-xs">Powered by DeepSeek</p>
            </div>
            <button
                onclick={toggleChat}
                class="text-gray-400 hover:text-white transition-colors"
            >
                <span class="material-symbols-outlined text-xl">close</span>
            </button>
        </div>

        <!-- Messages -->
        <div
            bind:this={chatContainer}
            class="flex-1 overflow-y-auto p-4 space-y-3"
            style="scrollbar-width: thin; scrollbar-color: rgba(147,51,234,0.3) transparent;"
        >
            {#each messages as msg}
                <div
                    class="flex {msg.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'}"
                >
                    <div
                        class="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed chat-bubble"
                        style={msg.role === "user"
                            ? "background: rgba(147,51,234,0.4); color: white; border-radius: 18px 18px 4px 18px;"
                            : "background: rgba(255,255,255,0.08); color: #e5e7eb; border-radius: 18px 18px 18px 4px;"}
                    >
                        {#if msg.role === "assistant"}
                            {@html renderMd(msg.content)}
                        {:else}
                            {msg.content}
                        {/if}
                    </div>
                </div>
            {/each}

            {#if sending}
                <div class="flex justify-start">
                    <div
                        class="px-4 py-3 rounded-2xl text-sm"
                        style="background: rgba(255,255,255,0.08); border-radius: 18px 18px 18px 4px;"
                    >
                        <span class="inline-flex gap-1">
                            <span
                                class="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                                style="animation-delay: 0ms;"
                            ></span>
                            <span
                                class="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                                style="animation-delay: 150ms;"
                            ></span>
                            <span
                                class="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                                style="animation-delay: 300ms;"
                            ></span>
                        </span>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Input -->
        <div
            class="px-3 py-3 shrink-0"
            style="border-top: 1px solid rgba(255,255,255,0.08);"
        >
            <div
                class="flex items-center gap-2 rounded-xl px-3 py-2"
                style="background: rgba(31,41,55,0.8); border: 1px solid rgba(55,65,81,0.8);"
            >
                <input
                    type="text"
                    bind:value={input}
                    onkeydown={handleKeydown}
                    placeholder="Ask about Athoillah..."
                    disabled={sending}
                    class="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                />
                <button
                    onclick={sendMessage}
                    disabled={sending || !input.trim()}
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style="background: rgba(147,51,234,0.5);"
                >
                    <span class="material-symbols-outlined text-white text-base"
                        >send</span
                    >
                </button>
            </div>
        </div>
    </div>
{/if}

<script lang="ts">
    let name = $state("");
    let email = $state("");
    let subject = $state("");
    let message = $state("");
    let errorMsg = $state("");

    function handleSubmit(e: Event) {
        e.preventDefault();
        errorMsg = "";

        if (
            !name.trim() ||
            !email.trim() ||
            !subject.trim() ||
            !message.trim()
        ) {
            errorMsg = "Please fill in all fields.";
            return;
        }

        const recipient = "muhammadathoillah62@gmail.com";
        const body = `Hi Athoillah,\n\n${message.trim()}\n\n---\nFrom: ${name.trim()}\nEmail: ${email.trim()}`;
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoUrl;
    }
</script>

<svelte:head>
    <title>Contact - Athoillah's Portfolio</title>
</svelte:head>

<div
    class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center"
    style="min-height: calc(100vh - 200px);"
>
    <h1
        class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-4 sm:mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 text-center"
    >
        Get in Touch
    </h1>
    <p
        class="text-gray-400 text-center max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base px-4"
    >
        Have a project in mind or want to discuss database solutions? I'd love
        to hear from you.
    </p>

    <div class="w-full max-w-xl">
        <div class="card-glass" data-glow style="--base: 270; --sat: 80;">
            <form onsubmit={handleSubmit}>
                <div class="mb-6">
                    <label
                        for="name"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Name</label
                    >
                    <input
                        type="text"
                        id="name"
                        bind:value={name}
                        required
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-colors"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1); color: white;"
                        placeholder="Your name"
                    />
                </div>
                <div class="mb-6">
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Email</label
                    >
                    <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-colors"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1); color: white;"
                        placeholder="your.email@example.com"
                    />
                </div>
                <div class="mb-6">
                    <label
                        for="subject"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Subject</label
                    >
                    <input
                        type="text"
                        id="subject"
                        bind:value={subject}
                        required
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-colors"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1); color: white;"
                        placeholder="What's this about?"
                    />
                </div>
                <div class="mb-8">
                    <label
                        for="message"
                        class="block text-sm font-medium text-gray-300 mb-2"
                        >Message</label
                    >
                    <textarea
                        id="message"
                        bind:value={message}
                        rows="5"
                        required
                        class="w-full px-4 py-3 rounded-lg text-white outline-none transition-colors resize-none"
                        style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1); color: white;"
                        placeholder="Your message..."
                    ></textarea>
                </div>

                {#if errorMsg}
                    <p class="text-red-400 text-sm mb-4">{errorMsg}</p>
                {/if}

                <button type="submit" class="shiny-cta" style="width: 100%;">
                    <span class="flex items-center justify-center">
                        <span class="material-symbols-outlined mr-2">send</span>
                        Send Message
                    </span>
                </button>
            </form>
        </div>

        <!-- Contact Info -->
        <div
            class="mt-12 flex flex-col md:flex-row justify-center items-center gap-8 text-gray-400"
        >
            <a
                href="mailto:muhammadathoillah62@gmail.com"
                class="flex items-center hover:text-white transition-colors no-underline text-gray-400"
            >
                <span class="material-symbols-outlined mr-2 text-purple-400"
                    >mail</span
                >
                muhammadathoillah62@gmail.com
            </a>
            <a
                href="https://linkedin.com/in/muhammadathoillah"
                target="_blank"
                class="flex items-center hover:text-white transition-colors no-underline text-gray-400"
            >
                <i class="fab fa-linkedin mr-2 text-purple-400"></i>
                LinkedIn
            </a>
            <a
                href="https://github.com/Athoillah21"
                target="_blank"
                class="flex items-center hover:text-white transition-colors no-underline text-gray-400"
            >
                <i class="fab fa-github mr-2 text-purple-400"></i>
                GitHub
            </a>
        </div>
    </div>
</div>

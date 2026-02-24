<script lang="ts">
    import { marked } from "marked";
    import DOMPurify from "dompurify";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    let { data } = $props();

    interface Note {
        id: string;
        title: string;
        content: string;
        createdAt: number;
        updatedAt: number;
    }

    let notes = $state<Note[]>(data.notes);
    let currentNoteId = $state<string | null>(null);
    let isEditing = $state(false);
    let editTitle = $state("");
    let editContent = $state("");
    let activeTab = $state<"write" | "preview">("write");
    let sidebarVisible = $state(true);
    let saving = $state(false);
    let showConfirm = $state(false);
    let deleting = $state(false);

    let currentNote = $derived(
        notes.find((n) => n.id === currentNoteId) || null,
    );
    let renderedContent = $derived(
        currentNote
            ? DOMPurify.sanitize(marked.parse(currentNote.content) as string)
            : "",
    );
    let previewContent = $derived(
        editContent
            ? DOMPurify.sanitize(marked.parse(editContent) as string)
            : '<p style="color:#6b7280;font-style:italic;">Nothing to preview</p>',
    );

    function formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
        if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
        if (diff < 604800000) return Math.floor(diff / 86400000) + "d ago";
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    function getPreview(content: string): string {
        const text = content.replace(/[#*_`\[\]]/g, "").trim();
        return text.length > 50 ? text.substring(0, 50) + "..." : text;
    }

    function viewNote(noteId: string) {
        currentNoteId = noteId;
        isEditing = false;
    }

    function openEditor(noteId: string | null = null) {
        isEditing = true;
        activeTab = "write";
        if (noteId) {
            const note = notes.find((n) => n.id === noteId);
            if (note) {
                currentNoteId = noteId;
                editTitle = note.title;
                editContent = note.content;
            }
        } else {
            currentNoteId = null;
            editTitle = "";
            editContent = "";
        }
    }

    async function saveNote() {
        if (!editTitle.trim()) return;
        saving = true;

        const now = Date.now();
        if (currentNoteId) {
            const idx = notes.findIndex((n) => n.id === currentNoteId);
            if (idx !== -1) {
                notes[idx] = {
                    ...notes[idx],
                    title: editTitle,
                    content: editContent,
                    updatedAt: now,
                };
            }
        } else {
            const newNote: Note = {
                id:
                    "note-" +
                    now +
                    "-" +
                    Math.random().toString(36).substr(2, 9),
                title: editTitle,
                content: editContent,
                createdAt: now,
                updatedAt: now,
            };
            notes = [newNote, ...notes];
            currentNoteId = newNote.id;
        }

        try {
            const note = notes.find((n) => n.id === currentNoteId);
            if (note) {
                await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(note),
                });
            }
        } catch (e) {
            console.warn("Could not save to DB, note saved locally");
        } finally {
            saving = false;
        }
        isEditing = false;
    }

    function requestDeleteNote() {
        if (!currentNoteId) return;
        showConfirm = true;
    }

    async function confirmDeleteNote() {
        if (!currentNoteId) return;
        deleting = true;
        try {
            await fetch(`/api/notes?id=${currentNoteId}`, { method: "DELETE" });
        } catch (e) {
            console.warn("Could not delete from DB");
        } finally {
            deleting = false;
            showConfirm = false;
        }
        notes = notes.filter((n) => n.id !== currentNoteId);
        currentNoteId = notes.length > 0 ? notes[0].id : null;
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
    }

    function toggleSidebar() {
        sidebarVisible = !sidebarVisible;
    }
</script>

<svelte:head>
    <title>Notes - Athoillah's Portfolio</title>
</svelte:head>

<div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <h1
        class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 text-center"
    >
        My Notes
    </h1>

    <div class="flex gap-6 max-w-7xl mx-auto relative">
        <!-- Left Sidebar -->
        {#if sidebarVisible}
            <div
                class="hidden lg:block w-80 shrink-0 transition-all duration-500 ease-out"
            >
                <div class="sticky top-24">
                    <div
                        class="rounded-xl overflow-hidden"
                        style="background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <!-- Header -->
                        <div
                            class="w-full flex items-center justify-between px-4 py-3 border-b"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1);"
                        >
                            <div class="flex items-center gap-2">
                                <span
                                    class="material-symbols-outlined text-purple-400 text-lg"
                                    >description</span
                                >
                                <span class="text-white font-medium text-sm"
                                    >Notes</span
                                >
                            </div>
                            <span
                                class="text-xs px-2 py-0.5 rounded-full"
                                style="background: rgba(147,51,234,0.5); color: #e9d5ff;"
                                >{notes.length}</span
                            >
                        </div>

                        <!-- Add Note -->
                        <div
                            class="p-3 border-b"
                            style="border-color: rgba(255,255,255,0.1);"
                        >
                            <button
                                onclick={() => openEditor()}
                                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all duration-300"
                            >
                                <span class="material-symbols-outlined text-lg"
                                    >add</span
                                >
                                <span class="font-medium">New Note</span>
                            </button>
                        </div>

                        <!-- Notes List -->
                        <div class="max-h-[50vh] overflow-y-auto">
                            <div class="p-3 space-y-2">
                                {#if notes.length === 0}
                                    <p
                                        class="text-gray-500 text-sm text-center py-4"
                                    >
                                        No notes yet
                                    </p>
                                {:else}
                                    {#each notes as note}
                                        <button
                                            onclick={() => viewNote(note.id)}
                                            class="w-full group flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 text-left border"
                                            style="background: {currentNoteId ===
                                            note.id
                                                ? 'rgba(147,51,234,0.3)'
                                                : 'transparent'}; border-color: {currentNoteId ===
                                            note.id
                                                ? 'rgba(147,51,234,0.3)'
                                                : 'transparent'};"
                                        >
                                            <span
                                                class="material-symbols-outlined text-purple-400 text-lg mt-0.5"
                                                >article</span
                                            >
                                            <div class="flex-1 min-w-0">
                                                <h4
                                                    class="text-sm font-medium text-white truncate"
                                                >
                                                    {note.title}
                                                </h4>
                                                <p
                                                    class="text-xs text-gray-500 truncate mt-0.5"
                                                >
                                                    {getPreview(note.content)}
                                                </p>
                                                <span
                                                    class="text-xs text-gray-600 mt-1 block"
                                                    >{formatDate(
                                                        note.updatedAt,
                                                    )}</span
                                                >
                                            </div>
                                        </button>
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    </div>

                    <button
                        onclick={toggleSidebar}
                        class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-all text-sm"
                        style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <span class="material-symbols-outlined text-sm"
                            >chevron_left</span
                        >
                        Hide Panel
                    </button>
                </div>
            </div>
        {/if}

        <!-- Mobile Sidebar Toggle -->
        <button
            onclick={toggleSidebar}
            class="lg:hidden fixed bottom-6 left-6 z-30 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg transition-all duration-300"
            style="backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
            title="Toggle notes list"
        >
            <span class="material-symbols-outlined"
                >{sidebarVisible ? "close" : "format_list_bulleted"}</span
            >
        </button>

        <!-- Show Sidebar Button (desktop) -->
        {#if !sidebarVisible}
            <button
                onclick={toggleSidebar}
                class="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-r-xl shadow-lg transition-all duration-300"
                style="backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
            >
                <span class="material-symbols-outlined">chevron_right</span>
            </button>
        {/if}

        <!-- Main Notes Area -->
        <div class="flex-1">
            <div class="min-h-[60vh]">
                <!-- Empty State -->
                {#if !currentNote && !isEditing}
                    <div
                        class="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-up"
                    >
                        <div
                            class="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                            style="background: rgba(147,51,234,0.2);"
                        >
                            <span
                                class="material-symbols-outlined text-5xl text-purple-400"
                                >edit_note</span
                            >
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-2">
                            No Note Selected
                        </h3>
                        <p class="text-gray-400 mb-6 max-w-md">
                            Select a note from the sidebar or create a new one
                            to get started
                        </p>
                        <button
                            onclick={() => openEditor()}
                            class="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all"
                        >
                            <span class="material-symbols-outlined">add</span>
                            Create Your First Note
                        </button>
                    </div>
                {/if}

                <!-- View Mode -->
                {#if currentNote && !isEditing}
                    <div
                        class="rounded-xl overflow-hidden animate-scale-in"
                        style="background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <div
                            class="flex items-center justify-between px-6 py-4 border-b"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1);"
                        >
                            <h2 class="text-xl font-semibold text-white">
                                {currentNote.title}
                            </h2>
                            <div class="flex items-center gap-2">
                                <button
                                    onclick={() => openEditor(currentNoteId)}
                                    class="p-2 rounded-lg text-purple-400 hover:text-purple-300 transition-all"
                                    title="Edit"
                                    style="background: transparent;"
                                >
                                    <span class="material-symbols-outlined"
                                        >edit</span
                                    >
                                </button>
                                <button
                                    onclick={requestDeleteNote}
                                    class="p-2 rounded-lg text-red-400 hover:text-red-300 transition-all"
                                    title="Delete"
                                    style="background: transparent;"
                                >
                                    <span class="material-symbols-outlined"
                                        >delete</span
                                    >
                                </button>
                            </div>
                        </div>
                        <div class="p-6 markdown-preview">
                            {@html renderedContent}
                        </div>
                        <div
                            class="px-6 py-3 text-xs text-gray-500 border-t"
                            style="border-color: rgba(255,255,255,0.1);"
                        >
                            Last updated: {new Date(
                                currentNote.updatedAt,
                            ).toLocaleString()}
                        </div>
                    </div>
                {/if}

                <!-- Edit Mode -->
                {#if isEditing}
                    <div
                        class="rounded-xl overflow-hidden animate-scale-in"
                        style="background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <div
                            class="flex items-center justify-between px-6 py-4 border-b"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1);"
                        >
                            <input
                                type="text"
                                bind:value={editTitle}
                                placeholder="Note Title..."
                                class="text-xl font-semibold text-white outline-none flex-1"
                                style="background: transparent; border: none; color: white;"
                            />
                            <div class="flex items-center gap-2">
                                <button
                                    onclick={saveNote}
                                    disabled={saving}
                                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
                                >
                                    {#if saving}
                                        <span
                                            class="material-symbols-outlined text-sm animate-spin"
                                            >progress_activity</span
                                        >
                                        Saving...
                                    {:else}
                                        <span
                                            class="material-symbols-outlined text-sm"
                                            >save</span
                                        >
                                        Save
                                    {/if}
                                </button>
                                <button
                                    onclick={cancelEdit}
                                    class="p-2 rounded-lg text-gray-400 hover:text-white transition-all"
                                    title="Cancel"
                                    style="background: transparent;"
                                >
                                    <span class="material-symbols-outlined"
                                        >close</span
                                    >
                                </button>
                            </div>
                        </div>
                        <!-- Tabs -->
                        <div
                            class="flex border-b"
                            style="border-color: rgba(255,255,255,0.1);"
                        >
                            <button
                                onclick={() => (activeTab = "write")}
                                class="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                                style="color: {activeTab === 'write'
                                    ? 'white'
                                    : '#9ca3af'}; background: {activeTab ===
                                'write'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'transparent'}; border-bottom: {activeTab ===
                                'write'
                                    ? '2px solid #a855f7'
                                    : '2px solid transparent'};"
                            >
                                <span
                                    class="material-symbols-outlined text-sm align-middle mr-1"
                                    >edit</span
                                > Write
                            </button>
                            <button
                                onclick={() => (activeTab = "preview")}
                                class="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                                style="color: {activeTab === 'preview'
                                    ? 'white'
                                    : '#9ca3af'}; background: {activeTab ===
                                'preview'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'transparent'}; border-bottom: {activeTab ===
                                'preview'
                                    ? '2px solid #a855f7'
                                    : '2px solid transparent'};"
                            >
                                <span
                                    class="material-symbols-outlined text-sm align-middle mr-1"
                                    >visibility</span
                                > Preview
                            </button>
                        </div>
                        <!-- Editor -->
                        {#if activeTab === "write"}
                            <div class="p-4">
                                <textarea
                                    bind:value={editContent}
                                    placeholder="Write your note in Markdown..."
                                    class="w-full h-[50vh] text-gray-300 outline-none resize-none font-mono text-sm leading-relaxed"
                                    style="background: transparent; border: none; color: #d1d5db;"
                                ></textarea>
                            </div>
                        {:else}
                            <div
                                class="p-6 h-[50vh] overflow-y-auto markdown-preview"
                            >
                                {@html previewContent}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<ConfirmModal
    bind:show={showConfirm}
    title="Delete Note"
    message={`Are you sure you want to delete "${currentNote?.title}"? This action cannot be undone.`}
    confirmLabel="Delete"
    variant="danger"
    loading={deleting}
    onconfirm={confirmDeleteNote}
    oncancel={() => {
        showConfirm = false;
    }}
/>

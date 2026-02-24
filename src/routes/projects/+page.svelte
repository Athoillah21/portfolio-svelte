<script lang="ts">
    import { page } from "$app/stores";
    import {
        Database,
        Brain,
        BarChart3,
        ShieldCheck,
        Sparkles,
        Server,
        Mail,
        Send,
        Cloud,
        FileSearch,
        User,
        Heart,
    } from "lucide-svelte";
    import AdminModal from "$lib/components/AdminModal.svelte";
    import Toast from "$lib/components/Toast.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    let { data } = $props();
    $effect(() => {
        projects = data.projects;
    });

    const user = $derived($page.data.user);

    const iconMap: Record<string, typeof Database> = {
        database: Database,
        brain: Brain,
        "bar-chart-3": BarChart3,
        "shield-check": ShieldCheck,
        sparkles: Sparkles,
        server: Server,
        mail: Mail,
        send: Send,
        cloud: Cloud,
        "file-search": FileSearch,
        user: User,
        heart: Heart,
    };

    const iconOptions = [
        "database",
        "brain",
        "bar-chart-3",
        "shield-check",
        "sparkles",
        "server",
        "mail",
        "send",
        "cloud",
        "file-search",
        "user",
        "heart",
    ];

    let projects = $state(data.projects);
    let sidebarVisible = $state(true);
    let showModal = $state(false);
    let editingProject = $state<any>(null);
    let saving = $state(false);
    let showConfirm = $state(false);
    let pendingDelete = $state<any>(null);
    let deleting = $state(false);
    let generating = $state(false);

    // Form state
    let formTitle = $state("");
    let formDesc = $state("");
    let formIcon = $state("database");
    let formTags = $state("");
    let formGithub = $state("");
    let formMedium = $state("");

    // Toast
    let toastMsg = $state("");
    let toastType = $state<"success" | "error" | "info">("success");
    let toastVisible = $state(false);

    function toast(
        msg: string,
        type: "success" | "error" | "info" = "success",
    ) {
        toastMsg = msg;
        toastType = type;
        toastVisible = true;
        setTimeout(() => (toastVisible = false), 3000);
    }

    function toggleSidebar() {
        sidebarVisible = !sidebarVisible;
    }

    async function generateWithAI() {
        if (!formGithub.trim()) {
            toast("Please enter a GitHub URL first", "error");
            return;
        }
        generating = true;
        try {
            const res = await fetch("/api/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ githubUrl: formGithub.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.description) formDesc = data.description;
                if (data.tags?.length) formTags = data.tags.join(", ");
                toast("AI generated description & tags!", "success");
            } else {
                const err = await res.json();
                toast(err.error || "Failed to generate", "error");
            }
        } catch {
            toast("Network error", "error");
        } finally {
            generating = false;
        }
    }

    function scrollToProject(index: number) {
        const cards = document.querySelectorAll("#projects-container > div");
        if (cards[index]) {
            cards[index].scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            cards[index].classList.add("ring-2", "ring-purple-500");
            setTimeout(
                () =>
                    cards[index].classList.remove("ring-2", "ring-purple-500"),
                2000,
            );
        }
    }

    function openAddModal() {
        editingProject = null;
        formTitle = "";
        formDesc = "";
        formIcon = "database";
        formTags = "";
        formGithub = "";
        formMedium = "";
        showModal = true;
    }

    function openEditModal(project: any) {
        editingProject = project;
        formTitle = project.title;
        formDesc = project.description;
        formIcon = project.icon || "database";
        formTags = (project.tags || []).join(", ");
        formGithub = project.githubUrl || "";
        formMedium = project.mediumUrl || "";
        showModal = true;
    }

    async function saveProject() {
        if (!formTitle.trim()) return;
        saving = true;
        const payload = {
            id: editingProject?.id || undefined,
            title: formTitle.trim(),
            description: formDesc.trim(),
            icon: formIcon,
            tags: formTags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean),
            githubUrl: formGithub.trim(),
            mediumUrl: formMedium.trim(),
            status: "published",
            sortOrder: editingProject?.sortOrder ?? projects.length + 1,
        };

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const result = await res.json();
                if (editingProject) {
                    const idx = projects.findIndex(
                        (p: any) => p.id === editingProject.id,
                    );
                    if (idx !== -1)
                        projects[idx] = { ...projects[idx], ...payload };
                    toast("Project updated successfully");
                } else {
                    projects = [...projects, { ...payload, id: result.id }];
                    toast("Project added successfully");
                }
                showModal = false;
            } else {
                toast("Failed to save project", "error");
            }
        } catch (e) {
            toast("Network error", "error");
        } finally {
            saving = false;
        }
    }

    function requestDelete(project: any) {
        pendingDelete = project;
        showConfirm = true;
    }

    async function confirmDelete() {
        if (!pendingDelete) return;
        deleting = true;
        try {
            const res = await fetch(`/api/projects?id=${pendingDelete.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                projects = projects.filter(
                    (p: any) => p.id !== pendingDelete.id,
                );
                toast("Project deleted");
            } else {
                toast("Failed to delete", "error");
            }
        } catch (e) {
            toast("Network error", "error");
        } finally {
            deleting = false;
            showConfirm = false;
            pendingDelete = null;
        }
    }

    // === Drag and Drop ===
    let dragIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    function handleDragStart(index: number) {
        dragIndex = index;
    }

    function handleDragOver(e: DragEvent, index: number) {
        e.preventDefault();
        dragOverIndex = index;
    }

    function handleDragLeave() {
        dragOverIndex = null;
    }

    async function handleDrop(targetIndex: number) {
        if (dragIndex === null || dragIndex === targetIndex) {
            dragIndex = null;
            dragOverIndex = null;
            return;
        }

        // Reorder the array
        const item = projects[dragIndex];
        const newProjects = [...projects];
        newProjects.splice(dragIndex, 1);
        newProjects.splice(targetIndex, 0, item);
        projects = newProjects;

        dragIndex = null;
        dragOverIndex = null;

        // Persist new order to API
        const order = projects.map((p: any, i: number) => ({
            id: p.id,
            sortOrder: i + 1,
        }));

        try {
            const res = await fetch("/api/projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order }),
            });
            if (res.ok) {
                toast("Order saved", "info");
            } else {
                toast("Failed to save order", "error");
            }
        } catch {
            toast("Network error saving order", "error");
        }
    }

    function handleDragEnd() {
        dragIndex = null;
        dragOverIndex = null;
    }
</script>

<svelte:head>
    <title>Projects - Athoillah's Portfolio</title>
</svelte:head>

<Toast message={toastMsg} type={toastType} bind:visible={toastVisible} />

<div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <div class="flex items-center justify-center gap-4 mb-8 sm:mb-10">
        <h1
            class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400"
        >
            My Projects
        </h1>
        {#if user}
            <button
                onclick={openAddModal}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3); color: #c084fc;"
                onmouseenter={(e) => {
                    e.currentTarget.style.background = "rgba(147,51,234,0.4)";
                }}
                onmouseleave={(e) => {
                    e.currentTarget.style.background = "rgba(147,51,234,0.2)";
                }}
            >
                <span class="material-symbols-outlined text-sm">add</span> Add Project
            </button>
        {/if}
    </div>

    <div class="flex gap-6 max-w-7xl mx-auto relative">
        <!-- Left Sidebar -->
        {#if sidebarVisible}
            <div
                class="hidden lg:block w-72 shrink-0 transition-all duration-500 ease-out"
            >
                <div class="sticky top-24">
                    <div
                        class="rounded-xl"
                        style="background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <div
                            class="w-full flex items-center justify-between px-4 py-3 border-b"
                            style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1);"
                        >
                            <div class="flex items-center gap-2">
                                <span
                                    class="material-symbols-outlined text-purple-400 text-lg"
                                    >list</span
                                >
                                <span class="text-white font-medium text-sm"
                                    >Projects</span
                                >
                            </div>
                            <span
                                class="text-xs px-2 py-0.5 rounded-full"
                                style="background: rgba(147,51,234,0.5); color: #e9d5ff;"
                                >{projects.length}</span
                            >
                        </div>
                        <div class="max-h-[60vh] overflow-y-auto">
                            <div class="p-3 space-y-1">
                                {#each projects as project, index}
                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                    <div
                                        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent transition-all duration-200 group cursor-pointer text-left {dragOverIndex ===
                                        index
                                            ? 'ring-1 ring-purple-500'
                                            : ''}"
                                        style="background: transparent; opacity: {dragIndex ===
                                        index
                                            ? 0.4
                                            : 1};"
                                        draggable={user ? "true" : "false"}
                                        ondragstart={() =>
                                            user && handleDragStart(index)}
                                        ondragover={(e) =>
                                            user && handleDragOver(e, index)}
                                        ondragleave={() =>
                                            user && handleDragLeave()}
                                        ondrop={() => user && handleDrop(index)}
                                        ondragend={() =>
                                            user && handleDragEnd()}
                                        onclick={() => scrollToProject(index)}
                                        onmouseenter={(e) => {
                                            e.currentTarget.style.background =
                                                "rgba(147,51,234,0.3)";
                                        }}
                                        onmouseleave={(e) => {
                                            e.currentTarget.style.background =
                                                "transparent";
                                        }}
                                    >
                                        {#if user}
                                            <span
                                                class="material-symbols-outlined text-xs cursor-grab"
                                                style="color: rgba(255,255,255,0.25);"
                                                >drag_indicator</span
                                            >
                                        {/if}
                                        <span
                                            class="text-purple-400 font-mono text-xs"
                                            >{String(index + 1).padStart(
                                                2,
                                                "0",
                                            )}</span
                                        >
                                        <span
                                            class="text-gray-300 group-hover:text-white transition-colors flex-1 truncate text-sm"
                                            >{project.title}</span
                                        >
                                    </div>
                                {/each}
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
                        > Hide Panel
                    </button>
                </div>
            </div>
        {/if}

        {#if !sidebarVisible}
            <!-- Show Panel button — inline where sidebar was -->
            <div class="hidden lg:block shrink-0">
                <div class="sticky top-24">
                    <button
                        onclick={toggleSidebar}
                        class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all duration-300"
                        style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);"
                    >
                        <span class="material-symbols-outlined text-sm"
                            >chevron_right</span
                        >
                        Show Panel
                    </button>
                </div>
            </div>
        {/if}

        <!-- Projects Grid -->
        <div class="flex-1">
            <div
                id="projects-container"
                class="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {#each projects as project, index}
                    <div
                        class="project-card overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 group/card relative {dragOverIndex ===
                        index
                            ? 'ring-2 ring-purple-500 scale-[1.02]'
                            : ''}"
                        style="background: rgba(17,24,39,0.9); border: 1px solid rgba(255,255,255,0.08); --base: 270; --sat: 80; opacity: {dragIndex ===
                        index
                            ? 0.4
                            : 1}; {user ? 'cursor: grab;' : ''}"
                        data-glow
                        draggable={user ? "true" : "false"}
                        ondragstart={() => user && handleDragStart(index)}
                        ondragover={(e) => user && handleDragOver(e, index)}
                        ondragleave={() => user && handleDragLeave()}
                        ondrop={() => user && handleDrop(index)}
                        ondragend={() => user && handleDragEnd()}
                        role={user ? "listitem" : undefined}
                    >
                        <!-- Admin controls overlay -->
                        {#if user}
                            <div
                                class="absolute top-3 left-3 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                            >
                                <span
                                    class="material-symbols-outlined text-lg cursor-grab"
                                    style="color: rgba(255,255,255,0.4);"
                                    title="Drag to reorder">drag_indicator</span
                                >
                            </div>
                            <div
                                class="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
                            >
                                <button
                                    onclick={() => openEditModal(project)}
                                    class="p-2 rounded-lg transition-all"
                                    style="background: rgba(147,51,234,0.8); backdrop-filter: blur(8px); color: white;"
                                    title="Edit"
                                >
                                    <span
                                        class="material-symbols-outlined text-sm"
                                        >edit</span
                                    >
                                </button>
                                <button
                                    onclick={() => requestDelete(project)}
                                    class="p-2 rounded-lg transition-all"
                                    style="background: rgba(239,68,68,0.8); backdrop-filter: blur(8px); color: white;"
                                    title="Delete"
                                >
                                    <span
                                        class="material-symbols-outlined text-sm"
                                        >delete</span
                                    >
                                </button>
                            </div>
                        {/if}

                        <!-- Icon Section (lighter bg) -->
                        <div
                            class="w-full flex items-center justify-center py-12 px-8"
                            style="background: linear-gradient(180deg, rgba(31,41,55,0.6) 0%, rgba(17,24,39,0.3) 100%);"
                        >
                            <div
                                class="w-24 h-24 rounded-full flex items-center justify-center"
                                style="background: rgba(147,51,234,0.12); border: 1.5px solid rgba(147,51,234,0.25);"
                            >
                                {#if project.icon && iconMap[project.icon]}
                                    {@const IconComponent =
                                        iconMap[project.icon]}
                                    <IconComponent
                                        class="w-12 h-12 text-purple-400"
                                    />
                                {:else}
                                    <span
                                        class="material-symbols-outlined text-5xl text-purple-400"
                                        >code</span
                                    >
                                {/if}
                            </div>
                        </div>

                        <!-- Content Section -->
                        <div
                            class="px-6 pb-6 pt-5"
                            style="border-top: 1px solid rgba(255,255,255,0.06);"
                        >
                            <h3 class="text-xl font-semibold mb-3 text-white">
                                {project.title}
                            </h3>
                            <p
                                class="text-gray-400 text-sm mb-5 leading-relaxed"
                            >
                                {project.description}
                            </p>

                            <!-- Tags -->
                            <div class="flex flex-wrap gap-2 mb-5">
                                {#each project.tags as tag}
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-medium"
                                        style="background: rgba(88,28,135,0.3); color: #c084fc; border: 1px solid rgba(147,51,234,0.35);"
                                        >{tag}</span
                                    >
                                {/each}
                            </div>

                            <!-- Links -->
                            <div
                                class="flex items-center gap-5 pt-1"
                                style="border-top: 1px solid rgba(255,255,255,0.06);"
                            >
                                {#if project.mediumUrl}
                                    <a
                                        href={project.mediumUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors text-sm pt-4 no-underline"
                                    >
                                        <span
                                            class="material-symbols-outlined text-base"
                                            >open_in_new</span
                                        >
                                        View Project
                                    </a>
                                {/if}
                                {#if project.githubUrl}
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm pt-4 no-underline"
                                    >
                                        <i class="fab fa-github"></i>
                                        Source Code
                                    </a>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Project Modal -->
<AdminModal
    show={showModal}
    title={editingProject ? "Edit Project" : "Add New Project"}
    onclose={() => (showModal = false)}
>
    <div class="space-y-5">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Title</label
            >
            <input
                type="text"
                bind:value={formTitle}
                placeholder="Project title"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2"
                    >GitHub URL</label
                >
                <input
                    type="url"
                    bind:value={formGithub}
                    placeholder="https://github.com/..."
                    class="w-full px-4 py-3 rounded-lg text-white outline-none text-sm"
                    style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2"
                    >Demo URL</label
                >
                <input
                    type="url"
                    bind:value={formMedium}
                    placeholder="https://..."
                    class="w-full px-4 py-3 rounded-lg text-white outline-none text-sm"
                    style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
                />
            </div>
        </div>
        <div>
            <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-300"
                    >Description</label
                >
                <button
                    type="button"
                    onclick={generateWithAI}
                    disabled={generating || !formGithub.trim()}
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style="background: linear-gradient(135deg, rgba(147,51,234,0.3), rgba(59,130,246,0.3)); border: 1px solid rgba(147,51,234,0.4); color: #c084fc;"
                    title={!formGithub.trim()
                        ? "Enter a GitHub URL first"
                        : "Generate description & tags using AI"}
                >
                    {#if generating}
                        <span
                            class="material-symbols-outlined text-sm animate-spin"
                            >progress_activity</span
                        >
                        Analyzing...
                    {:else}
                        <span class="material-symbols-outlined text-sm"
                            >auto_awesome</span
                        >
                        Generate with AI
                    {/if}
                </button>
            </div>
            <textarea
                bind:value={formDesc}
                rows="3"
                placeholder="Short description — or use AI to generate from GitHub"
                class="w-full px-4 py-3 rounded-lg text-white outline-none resize-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            ></textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Icon</label
            >
            <div class="grid grid-cols-6 gap-2">
                {#each iconOptions as icon}
                    <button
                        onclick={() => (formIcon = icon)}
                        class="p-2.5 rounded-lg flex items-center justify-center transition-all"
                        style="background: {formIcon === icon
                            ? 'rgba(147,51,234,0.4)'
                            : 'rgba(31,41,55,1)'}; border: 1px solid {formIcon ===
                        icon
                            ? 'rgba(147,51,234,0.6)'
                            : 'rgba(55,65,81,1)'};"
                        title={icon}
                    >
                        {#if iconMap[icon]}
                            {@const Ic = iconMap[icon]}
                            <Ic class="w-5 h-5 text-purple-400" />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Tags <span class="text-gray-500">(comma separated)</span
                ></label
            >
            <input
                type="text"
                bind:value={formTags}
                placeholder="Python, PostgreSQL, Automation"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div class="flex gap-3 pt-2">
            <button
                onclick={saveProject}
                disabled={saving}
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
            >
                {#if saving}
                    <span class="material-symbols-outlined text-sm animate-spin"
                        >progress_activity</span
                    >
                    Saving...
                {:else}
                    <span class="material-symbols-outlined text-sm">save</span>
                    {editingProject ? "Update Project" : "Add Project"}
                {/if}
            </button>
            <button
                onclick={() => (showModal = false)}
                class="px-4 py-3 rounded-lg text-gray-400 hover:text-white transition-colors"
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);"
            >
                Cancel
            </button>
        </div>
    </div>
</AdminModal>

<ConfirmModal
    bind:show={showConfirm}
    title="Delete Project"
    message={`Are you sure you want to delete "${pendingDelete?.title}"? This action cannot be undone.`}
    confirmLabel="Delete"
    variant="danger"
    loading={deleting}
    onconfirm={confirmDelete}
    oncancel={() => {
        showConfirm = false;
        pendingDelete = null;
    }}
/>

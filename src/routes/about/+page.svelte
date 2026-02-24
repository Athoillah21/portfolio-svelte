<script lang="ts">
    import { page } from "$app/stores";
    import AdminModal from "$lib/components/AdminModal.svelte";
    import Toast from "$lib/components/Toast.svelte";

    let { data } = $props();
    const user = $derived($page.data.user);

    let bio = $state(data.bio);
    let skills = $state<string[]>(data.skills);
    let cvUrl = $state(data.cvUrl);
    let workExperience = $state(data.workExperience);
    let education = $state(data.education);

    // Modal state
    let showBioModal = $state(false);
    let showWorkModal = $state(false);
    let showEduModal = $state(false);
    let editBio = $state("");
    let editSkills = $state("");
    let editCvUrl = $state("");
    let editWork = $state({
        id: null as number | null,
        title: "",
        company: "",
        period: "",
        description: "",
    });
    let editEdu = $state({
        id: null as number | null,
        degree: "",
        institution: "",
        period: "",
    });

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

    function openBioModal() {
        editBio = bio;
        editSkills = skills.join(", ");
        editCvUrl = cvUrl;
        showBioModal = true;
    }

    async function saveBio() {
        try {
            const res = await fetch("/api/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bio: editBio,
                    skills: editSkills
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    cvUrl: editCvUrl,
                }),
            });
            if (res.ok) {
                bio = editBio;
                skills = editSkills
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                cvUrl = editCvUrl;
                showBioModal = false;
                toast("Profile updated");
            } else toast("Failed to update", "error");
        } catch (e) {
            toast("Network error", "error");
        }
    }

    function openWorkModal(job?: any) {
        editWork = job
            ? {
                  id: job.id,
                  title: job.title,
                  company: job.company,
                  period: job.period,
                  description: job.description || "",
              }
            : { id: null, title: "", company: "", period: "", description: "" };
        showWorkModal = true;
    }

    async function saveWork() {
        if (!editWork.title.trim()) return;
        try {
            const res = await fetch("/api/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workExperience: [editWork] }),
            });
            if (res.ok) {
                if (editWork.id) {
                    workExperience = workExperience.map((w: any) =>
                        w.id === editWork.id ? { ...editWork } : w,
                    );
                } else {
                    workExperience = [
                        ...workExperience,
                        { ...editWork, id: Date.now() },
                    ];
                }
                showWorkModal = false;
                toast(editWork.id ? "Experience updated" : "Experience added");
            } else toast("Failed to save", "error");
        } catch (e) {
            toast("Network error", "error");
        }
    }

    function openEduModal(edu?: any) {
        editEdu = edu
            ? {
                  id: edu.id,
                  degree: edu.degree,
                  institution: edu.institution,
                  period: edu.period,
              }
            : { id: null, degree: "", institution: "", period: "" };
        showEduModal = true;
    }

    async function saveEdu() {
        if (!editEdu.degree.trim()) return;
        try {
            const res = await fetch("/api/about", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ education: [editEdu] }),
            });
            if (res.ok) {
                if (editEdu.id) {
                    education = education.map((e: any) =>
                        e.id === editEdu.id ? { ...editEdu } : e,
                    );
                } else {
                    education = [...education, { ...editEdu, id: Date.now() }];
                }
                showEduModal = false;
                toast(editEdu.id ? "Education updated" : "Education added");
            } else toast("Failed to save", "error");
        } catch (e) {
            toast("Network error", "error");
        }
    }
</script>

<svelte:head>
    <title>About - Athoillah's Portfolio</title>
</svelte:head>

<Toast message={toastMsg} type={toastType} bind:visible={toastVisible} />

<div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- About Me Section -->
    <section class="w-full max-w-3xl mx-auto mb-12 sm:mb-16">
        <h1
            class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 text-center"
        >
            About Me
        </h1>
        <div
            class="card-glass relative group/card"
            data-glow
            style="--base: 270; --sat: 80;"
        >
            {#if user}
                <button
                    onclick={openBioModal}
                    class="absolute top-4 right-4 z-10 p-2 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                    style="background: rgba(147,51,234,0.8); backdrop-filter: blur(8px); color: white;"
                    title="Edit Profile"
                >
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
            {/if}

            {#each bio.split("\n\n") as paragraph}
                <p class="text-lg leading-relaxed text-gray-300 mb-4">
                    {paragraph}
                </p>
            {/each}
            <div class="mt-8 pt-6 border-t border-gray-700">
                <h3 class="text-lg font-medium text-white mb-4">
                    Areas of Expertise
                </h3>
                <div class="flex flex-wrap gap-3">
                    {#each skills as skill}
                        <span
                            class="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                            >{skill}</span
                        >
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- Resume Section -->
    <section class="w-full max-w-3xl mx-auto">
        <h2
            class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400 text-center"
        >
            Resume
        </h2>
        <div class="card-glass" data-glow style="--base: 270; --sat: 80;">
            <!-- Work Experience -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3
                        class="text-xl font-medium text-white flex items-center"
                    >
                        <span
                            class="material-symbols-outlined mr-2 text-purple-400"
                            >work</span
                        > Work Experience
                    </h3>
                    {#if user}
                        <button
                            onclick={() => openWorkModal()}
                            class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                            style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3); color: #c084fc;"
                            onmouseenter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(147,51,234,0.4)")}
                            onmouseleave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(147,51,234,0.2)")}
                        >
                            <span class="material-symbols-outlined text-xs"
                                >add</span
                            > Add
                        </button>
                    {/if}
                </div>
                <div class="space-y-6">
                    {#each workExperience as job}
                        <div
                            class="pl-4 border-l-2 border-purple-500 relative group/item"
                        >
                            {#if user}
                                <button
                                    onclick={() => openWorkModal(job)}
                                    class="absolute -right-1 top-0 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                                    style="background: rgba(147,51,234,0.6); color: white;"
                                >
                                    <span
                                        class="material-symbols-outlined text-xs"
                                        >edit</span
                                    >
                                </button>
                            {/if}
                            <div
                                class="flex flex-col md:flex-row md:justify-between md:items-start mb-2"
                            >
                                <div>
                                    <h4 class="text-lg font-medium text-white">
                                        {job.title}
                                    </h4>
                                    <p class="text-purple-400">{job.company}</p>
                                </div>
                                <span class="text-sm text-gray-400 mt-1 md:mt-0"
                                    >{job.period}</span
                                >
                            </div>
                            {#if job.description}
                                <p class="text-gray-400">{job.description}</p>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="h-px bg-gray-700 my-8"></div>

            <!-- Education -->
            <div class="mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3
                        class="text-xl font-medium text-white flex items-center"
                    >
                        <span
                            class="material-symbols-outlined mr-2 text-purple-400"
                            >school</span
                        > Education
                    </h3>
                    {#if user}
                        <button
                            onclick={() => openEduModal()}
                            class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
                            style="background: rgba(147,51,234,0.2); border: 1px solid rgba(147,51,234,0.3); color: #c084fc;"
                            onmouseenter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(147,51,234,0.4)")}
                            onmouseleave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(147,51,234,0.2)")}
                        >
                            <span class="material-symbols-outlined text-xs"
                                >add</span
                            > Add
                        </button>
                    {/if}
                </div>
                <div class="space-y-6">
                    {#each education as edu}
                        <div
                            class="pl-4 border-l-2 border-purple-500 relative group/item"
                        >
                            {#if user}
                                <button
                                    onclick={() => openEduModal(edu)}
                                    class="absolute -right-1 top-0 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                                    style="background: rgba(147,51,234,0.6); color: white;"
                                >
                                    <span
                                        class="material-symbols-outlined text-xs"
                                        >edit</span
                                    >
                                </button>
                            {/if}
                            <div
                                class="flex flex-col md:flex-row md:justify-between md:items-start mb-2"
                            >
                                <div>
                                    <h4 class="text-lg font-medium text-white">
                                        {edu.degree}
                                    </h4>
                                    <p class="text-purple-400">
                                        {edu.institution}
                                    </p>
                                </div>
                                <span class="text-sm text-gray-400 mt-1 md:mt-0"
                                    >{edu.period}</span
                                >
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            {#if cvUrl}
                <div class="flex justify-center pt-4">
                    <a
                        href={cvUrl}
                        target="_blank"
                        class="shiny-cta"
                        style="width: auto; padding: 1rem 2rem;"
                    >
                        <span class="flex items-center">
                            <span class="material-symbols-outlined mr-2"
                                >download</span
                            > Download CV
                        </span>
                    </a>
                </div>
            {/if}
        </div>
    </section>
</div>

<!-- Bio/Skills Modal -->
<AdminModal
    show={showBioModal}
    title="Edit Profile"
    onclose={() => (showBioModal = false)}
>
    <div class="space-y-5">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Bio</label
            >
            <textarea
                bind:value={editBio}
                rows="6"
                class="w-full px-4 py-3 rounded-lg text-white outline-none resize-none text-sm leading-relaxed"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            ></textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Skills <span class="text-gray-500">(comma separated)</span
                ></label
            >
            <input
                type="text"
                bind:value={editSkills}
                class="w-full px-4 py-3 rounded-lg text-white outline-none text-sm"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >CV URL</label
            >
            <input
                type="url"
                bind:value={editCvUrl}
                class="w-full px-4 py-3 rounded-lg text-white outline-none text-sm"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <button
            onclick={saveBio}
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
            <span class="material-symbols-outlined text-sm">save</span> Save Profile
        </button>
    </div>
</AdminModal>

<!-- Work Experience Modal -->
<AdminModal
    show={showWorkModal}
    title={editWork.id ? "Edit Experience" : "Add Experience"}
    onclose={() => (showWorkModal = false)}
>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Job Title</label
            >
            <input
                type="text"
                bind:value={editWork.title}
                placeholder="e.g. Database Administrator"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Company</label
            >
            <input
                type="text"
                bind:value={editWork.company}
                placeholder="e.g. Telkomsigma"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Period</label
            >
            <input
                type="text"
                bind:value={editWork.period}
                placeholder="e.g. 2023 — Present"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Description</label
            >
            <input
                type="text"
                bind:value={editWork.description}
                placeholder="Brief description"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <button
            onclick={saveWork}
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
            <span class="material-symbols-outlined text-sm">save</span>
            {editWork.id ? "Update" : "Add"} Experience
        </button>
    </div>
</AdminModal>

<!-- Education Modal -->
<AdminModal
    show={showEduModal}
    title={editEdu.id ? "Edit Education" : "Add Education"}
    onclose={() => (showEduModal = false)}
>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Degree</label
            >
            <input
                type="text"
                bind:value={editEdu.degree}
                placeholder="e.g. B.Sc, Computer Science"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Institution</label
            >
            <input
                type="text"
                bind:value={editEdu.institution}
                placeholder="e.g. Gadjah Mada University"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2"
                >Period</label
            >
            <input
                type="text"
                bind:value={editEdu.period}
                placeholder="e.g. 2017 — 2022"
                class="w-full px-4 py-3 rounded-lg text-white outline-none"
                style="background: rgba(31,41,55,1); border: 1px solid rgba(55,65,81,1);"
            />
        </div>
        <button
            onclick={saveEdu}
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
            <span class="material-symbols-outlined text-sm">save</span>
            {editEdu.id ? "Update" : "Add"} Education
        </button>
    </div>
</AdminModal>

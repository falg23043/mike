"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, Loader2, Search } from "lucide-react";
import {
    listDocumentTemplates,
    createDocumentFromTemplate,
    type DocumentTemplate,
} from "@/app/lib/mikeApi";
import type { Document } from "./types";
import { Modal } from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
    /** Called with the freshly instantiated document (attach it to the chat). */
    onInstantiated: (doc: Document) => void;
    projectId?: string | null;
    folderId?: string | null;
}

export function TemplatePickerModal({
    open,
    onClose,
    onInstantiated,
    projectId,
    folderId,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [search, setSearch] = useState("");
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setActionError(null);
        setPendingId(null);
        setLoading(true);
        setLoadError(null);
        listDocumentTemplates()
            .then((list) => setTemplates(list))
            .catch((err) => {
                console.error("Failed to load templates:", err);
                setLoadError("Could not load templates. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [open]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q),
        );
    }, [templates, search]);

    const grouped = useMemo(() => {
        const map = new Map<string, DocumentTemplate[]>();
        for (const t of filtered) {
            const arr = map.get(t.category) ?? [];
            arr.push(t);
            map.set(t.category, arr);
        }
        return Array.from(map.entries());
    }, [filtered]);

    const handlePick = async (template: DocumentTemplate) => {
        if (pendingId) return;
        setPendingId(template.id);
        setActionError(null);
        try {
            const doc = await createDocumentFromTemplate(template.id, {
                projectId: projectId ?? null,
                folderId: folderId ?? null,
            });
            onInstantiated(doc);
            onClose();
        } catch (err) {
            console.error("Failed to instantiate template:", err);
            setActionError(
                "Could not create a document from this template. Please try again.",
            );
        } finally {
            setPendingId(null);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Use a template"
            icon={<FileText className="h-5 w-5 text-gray-500" />}
            size="lg"
        >
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates…"
                        className="w-full pl-9 pr-3 h-9 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>

                {actionError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{actionError}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                ) : loadError ? (
                    <div className="flex items-center gap-2 py-10 justify-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{loadError}</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">
                        {search
                            ? "No matching templates"
                            : "No templates available"}
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {grouped.map(([category, items]) => (
                            <div key={category} className="flex flex-col gap-2">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    {category}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {items.map((t) => {
                                        const isPending = pendingId === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                disabled={!!pendingId}
                                                onClick={() => handlePick(t)}
                                                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 text-left transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <div className="mt-0.5">
                                                    {isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {t.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 line-clamp-2">
                                                        {t.description}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}

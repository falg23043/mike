/**
 * Built-in document templates ("template bank").
 *
 * These are agreement templates shipped with every account. The `.docx`
 * source blobs live in R2 under `templates/system/{id}/source.docx`
 * (see `templateStorageKey` in `lib/storage.ts`), seeded once by
 * `scripts/seed-templates.ts`.
 *
 * This registry is the single source of truth consumed by:
 *   - `scripts/seed-templates.ts` (which files to upload)
 *   - `routes/documents.ts` (GET /single-documents/templates + POST /from-template)
 *   - the frontend picker (via the GET route)
 *
 * To add a template: drop its `.docx` into `backend/templates-src/{id}.docx`,
 * add an entry here, and re-run the seed script.
 */

export interface BuiltinTemplate {
  /** Stable slug; also the R2 key segment and the seed filename stem. */
  id: string;
  /** Verbatim document name used for the instantiated doc. */
  title: string;
  /** Short line shown on the picker card. */
  description: string;
  /** Cosmetic grouping label for the picker. */
  category: string;
  /** v1: always "docx". */
  fileType: "docx";
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "employment-agreement",
    title: "Employment Agreement",
    description:
      "Standard employment offer letter. Start here and describe the role, term, and terms to adapt.",
    category: "Employment",
    fileType: "docx",
  },
  {
    id: "employment-agreement-fr",
    title: "Contrat d'emploi",
    description:
      "Lettre d'offre d'emploi standard (français). Décrivez le poste, la durée et les conditions à adapter.",
    category: "Employment",
    fileType: "docx",
  },
  {
    id: "independent-contractor-agreement",
    title: "Independent Contractor Agreement",
    description:
      "Standard independent contractor agreement. Describe the services, term, and fees to adapt.",
    category: "Commercial",
    fileType: "docx",
  },
  {
    id: "mutual-nda",
    title: "Mutual NDA",
    description:
      "Mutual confidentiality agreement for exploring a potential business relationship.",
    category: "Confidentiality",
    fileType: "docx",
  },
  {
    id: "confidentiality-ip-assignment",
    title: "Confidentiality and IP Rights Assignment Agreement",
    description:
      "Employee/contractor confidentiality and intellectual property rights assignment agreement.",
    category: "Confidentiality",
    fileType: "docx",
  },
];

export function getBuiltinTemplate(id: string): BuiltinTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

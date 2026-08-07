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
 * add an entry here (choosing an `audience`, a `language`, and either an
 * existing `agreementKey` to pair it with a translation or a new one), add
 * the `agreementKey` to `AGREEMENT_ORDER` if it's new, and re-run the seed
 * script.
 */

/** Signer-audience grouping shown in the picker, in display order. */
export const TEMPLATE_AUDIENCES = [
  "founders",
  "employees",
  "freelancers",
  "other-collaborators",
] as const;

export type TemplateAudience = (typeof TEMPLATE_AUDIENCES)[number];

export type TemplateLanguage = "en" | "fr";

/**
 * Editorial display order of agreements *within* an audience group,
 * projected to the client as `agreementOrder`. The frontend groups by
 * `audience` then `agreementKey`, pairing the `en`/`fr` variants of the
 * same agreement side by side.
 */
export const AGREEMENT_ORDER: readonly string[] = [
  "non-compete-non-solicit",
  "confidentiality-ip",
  "restricted-share",
  "employment",
  "independent-contractor",
  "mutual-nda",
];

export function agreementOrderIndex(agreementKey: string): number {
  const i = AGREEMENT_ORDER.indexOf(agreementKey);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i; // unknown keys sort last
}

export interface BuiltinTemplate {
  /** Stable slug; also the R2 key segment and the seed filename stem. */
  id: string;
  /** Verbatim document name used for the instantiated doc. */
  title: string;
  /** Short line shown on the picker card. */
  description: string;
  /** Signer-audience group heading in the picker. */
  audience: TemplateAudience;
  /** Language of the .docx body. Drives the EN/FR column and card badge. */
  language: TemplateLanguage;
  /** Shared key joining the EN and FR variants of the same agreement. */
  agreementKey: string;
  /** Language-neutral agreement name; powers cross-language search. */
  agreementLabel: string;
  /** v1: always "docx". */
  fileType: "docx";
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  // Founders
  {
    id: "non-compete-non-solicit-fr",
    title: "Entente de non-concurrence et de non-sollicitation",
    description:
      "Entente de non-concurrence et de non-sollicitation pour employés ou contractants.",
    audience: "founders",
    language: "fr",
    agreementKey: "non-compete-non-solicit",
    agreementLabel: "Non-compete & non-solicitation",
    fileType: "docx",
  },
  {
    id: "confidentiality-ip-assignment",
    title: "Confidentiality and IP Rights Assignment Agreement",
    description:
      "Employee/contractor confidentiality and intellectual property rights assignment agreement.",
    audience: "founders",
    language: "en",
    agreementKey: "confidentiality-ip",
    agreementLabel: "Confidentiality & IP assignment",
    fileType: "docx",
  },
  {
    id: "confidentiality-ip-assignment-fr",
    title: "Convention de confidentialité et de droits de propriété intellectuelle",
    description:
      "Version française de la convention de confidentialité et de cession des droits de propriété intellectuelle.",
    audience: "founders",
    language: "fr",
    agreementKey: "confidentiality-ip",
    agreementLabel: "Confidentiality & IP assignment",
    fileType: "docx",
  },
  {
    // id keeps "stock" (the .docx/R2 key must not move); agreementLabel says
    // "restricted share" to match the picker's audience-based grouping.
    id: "restricted-stock-agreement-fr",
    title: "Convention d'actions restreintes",
    description:
      "Convention d'octroi d'actions restreintes (restricted stock) pour employés ou dirigeants.",
    audience: "founders",
    language: "fr",
    agreementKey: "restricted-share",
    agreementLabel: "Restricted share agreement",
    fileType: "docx",
  },
  // Employees
  {
    id: "employment-agreement",
    title: "Employment Agreement",
    description:
      "Standard employment offer letter. Start here and describe the role, term, and terms to adapt.",
    audience: "employees",
    language: "en",
    agreementKey: "employment",
    agreementLabel: "Employment agreement",
    fileType: "docx",
  },
  {
    id: "employment-agreement-fr",
    title: "Contrat d'emploi",
    description:
      "Lettre d'offre d'emploi standard (français). Décrivez le poste, la durée et les conditions à adapter.",
    audience: "employees",
    language: "fr",
    agreementKey: "employment",
    agreementLabel: "Employment agreement",
    fileType: "docx",
  },
  // Freelancers
  {
    id: "independent-contractor-agreement",
    title: "Independent Contractor Agreement",
    description:
      "Standard independent contractor agreement. Describe the services, term, and fees to adapt.",
    audience: "freelancers",
    language: "en",
    agreementKey: "independent-contractor",
    agreementLabel: "Independent contractor agreement",
    fileType: "docx",
  },
  // Other collaborators
  {
    id: "mutual-nda",
    title: "Mutual NDA",
    description:
      "Mutual confidentiality agreement for exploring a potential business relationship.",
    audience: "other-collaborators",
    language: "en",
    agreementKey: "mutual-nda",
    agreementLabel: "Mutual NDA",
    fileType: "docx",
  },
  {
    id: "mutual-nda-fr",
    title: "Convention mutuelle de confidentialité",
    description:
      "Convention de confidentialité mutuelle pour l'exploration d'une relation d'affaires potentielle.",
    audience: "other-collaborators",
    language: "fr",
    agreementKey: "mutual-nda",
    agreementLabel: "Mutual NDA",
    fileType: "docx",
  },
];

export function getBuiltinTemplate(id: string): BuiltinTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

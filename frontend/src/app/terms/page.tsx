"use client";

const lastUpdated = "July 24, 2026";

const importantNotice = [
    "Leviat Labs is a legal information and benchmarking software application provided by Leviat Technologies Inc. (the \u201cCorporation\u201d). It provides general information, and provides access to self-help, fill-in-the-blanks forms, and does not provide legal, financial, tax, regulatory, compliance, or professional advice, and it does not create an attorney-client relationship. The Services are not provided by the law firm Leviat Legal Inc. AI-generated output may be inaccurate, incomplete, outdated, or misleading, and you are solely responsible for reviewing and verifying it before relying on it.",
];

const preamble = [
    "These Terms of Service (the \u201cTOS\u201d) govern Customer\u2019s access to and use of the Services and constitute a legally binding agreement between Customer and the Corporation. By clicking on a box indicating its acceptance, creating an Account, or accessing or using the Services, Customer confirms that it has read, understood and agrees to be bound by these TOS and any additional terms, rules and conditions issued by the Corporation from time to time. These TOS become effective upon opening an Account (the \u201cEffective Date\u201d). If Customer does not agree or cannot fulfill the obligations described in these TOS, Customer agrees to not use the Services.",
    "The Corporation may make changes to the TOS from time to time. Changes will be communicated by providing access to the revised TOS through a written communication, which will specify the date of entry into effect of the revised TOS, which entry into effect shall in no event be less than thirty (30) days after the revised TOS were provided by the Corporation. Customer will be notified of these changes, and by continuing to access or use the Services after receiving such notification, Customer acknowledges and agrees to be legally bound by the revised TOS.",
    "Customer represents and warrants that it is legally able to enter into these TOS. If Customer is entering into these TOS on behalf of an entity, Customer further represents that it has the legal authority to bind such entity. Access to the Services in violation of local laws is at Customer\u2019s own risk. Customer represents and warrants that it will comply with these TOS and applicable laws.",
];

const sections: { title: string; subsections: { subtitle?: string; body: string[] }[] }[] = [
    {
        title: "1. SERVICES",
        subsections: [
            {
                subtitle: "1.1. Use and Access to the Services",
                body: [
                    "Unless otherwise agreed in writing and subject to Customer paying all applicable Fees, if applicable, and complying with the TOS, the Corporation grants Customer a limited, non-exclusive, non-transferable and non-sublicensable right during the Term (as defined in Section 7.1) to use the Services. Customer may permit its Users, if applicable, to access and use the Services in accordance with these TOS.",
                ],
            },
            {
                subtitle: "1.2. Services Provided on a Monthly Basis",
                body: [
                    "Customer\u2019s access to and use of the Services is provided on a recurring monthly basis for the Term of the TOS, until terminated by either Party in accordance with these TOS. Customer is charged monthly for its use of the Services based on the pricing set forth in the application.",
                ],
            },
            {
                subtitle: "1.3. Service Features and Availability",
                body: [
                    "The Corporation does not represent or warrant that any particular Service will be offered indefinitely, and to the fullest extent permitted by applicable law, reserves the right to modify the Fees, payment terms, features, or options of any Service or to introduce new fees, upon reasonable notice from the Corporation to Customer when necessary.",
                ],
            },
            {
                subtitle: "1.4. Updates",
                body: [
                    "Customer acknowledges that the Services, as well as any software, platforms, or tools used by the Corporation in the provision of the Services, may be subject to ongoing updates, including fixes, upgrades, and functional improvements. In addition, the Corporation may perform scheduled or emergency maintenance. Where reasonably practicable, the Corporation will provide advance notice of any material impact on the availability of the Services. Although the Corporation will use commercially reasonable efforts to minimize any disruption, it shall not be liable for any loss or damage, whether pecuniary or otherwise, resulting from any interruption or unavailability of the Services, and hereby disclaims all liability in this regard.",
                ],
            },
        ],
    },
    {
        title: "2. COMPENSATION",
        subsections: [
            {
                subtitle: "2.1. Fees",
                body: [
                    "By using the Services, Customer agrees to pay all applicable fees set forth in the application (as well as all applicable taxes), including, without limitation, usage-based fees (the \u201cFees\u201d). Fees are non-refundable.",
                ],
            },
            {
                subtitle: "2.2. Invoicing",
                body: ["The Corporation will invoice Customer on a monthly basis for the Services."],
            },
            {
                subtitle: "2.3. Payment Method",
                body: ["Fees are payable by any payment method designated by the Corporation on its invoices."],
            },
            {
                subtitle: "2.4. Incorrect or Incomplete Payment",
                body: [
                    "If any amount owed by Customer under these TOS is more than thirty (30) days past due from the date of the relevant invoice, the Corporation may, without limiting its other rights and remedies, suspend the Services provided to Customer until such amounts have been paid in full. It is understood that any unsuccessful payment may result in termination of the Services in accordance with paragraph 7.2.",
                ],
            },
            {
                subtitle: "2.5. Taxation",
                body: [
                    "All fees payable in respect of the Services are exclusive of any taxes, fees, or duties imposed by any governmental authority. The Corporation may collect certain taxes on behalf of governmental authorities in certain jurisdictions. Customer is solely responsible for the payment of all sales, use, value-added, and other taxes, duties, or levies currently imposed or that may be imposed in the future by any governmental authority in connection with Customer\u2019s use of the Services.",
                ],
            },
        ],
    },
    {
        title: "3. CONDUCT",
        subsections: [
            {
                subtitle: "3.1. Restrictions on Use",
                body: [
                    "Customer agrees to be solely responsible for its conduct and that of Users, if any, or any third party to whom Customer has provided access to the Services, directly or indirectly, in connection with the use of the Services and Documentation, whether such access or use is authorized under these TOS or not. Any unauthorized use of the Services may result in the termination of Customer\u2019s rights to use the Services in accordance with paragraph 7.2. Customer agrees to comply with the TOS and not to (and not to attempt to) directly or indirectly, alone or with another party: (i) license, sublicense, sell, rent, transfer, grant, distribute, share, or allow third parties to use its rights or commercially exploit the Services and Documentation in any form to another party; (ii) use the Services or Documentation in a manner that would violate the TOS or applicable law; (iii) reverse engineer, decompile, disassemble, or attempt to discover the source code, object code, or underlying structure, ideas, know-how, or algorithms related to the Services (except to the extent that such restriction is prohibited by applicable law); (iv) upload, introduce, or use the Services to distribute any viruses or other malicious code, or transmit large amounts of data in a manner that could have an adverse effect on the Services; (v) copy, reproduce, aggregate, republish, download, publish, publicly display, encode, translate, transmit, distribute, sell, license, sublicense, or otherwise exploit or use for any purpose the Services and the Documentation, including all of the Corporation\u2019s Intellectual Property Rights; or (vi) commit any act, omission, or use of the Services that the Corporation, in its sole and reasonable discretion, deems inappropriate, abusive, harmful, contrary to the spirit or purpose of the Services and these TOS, or otherwise unacceptable.",
                ],
            },
            {
                subtitle: "3.2. Sensitive and Restricted Information",
                body: [
                    "Customer must not upload, submit, transmit, or store sensitive, confidential, privileged, proprietary, personally identifiable, client, or otherwise restricted information through the Services. Customer must use the Services only with non-sensitive materials and at its own risk.",
                ],
            },
            {
                subtitle: "3.3. Rights in Submitted Content",
                body: [
                    "Customer must not submit any content or input that it does not have the right to use, that violates confidentiality or privacy obligations, or that infringes intellectual property or other third-party rights.",
                ],
            },
            {
                subtitle: "3.4. Access Management",
                body: [
                    "Customer is responsible for all actions and inactions of its Users, if any, or third parties to whom it has granted access to the Services, treating them as if they were its own actions or inactions. Maintaining control of any access credentials, links, or Accounts used to access the Services, including the confidentiality of login credentials, is the responsibility of Customer.",
                ],
            },
        ],
    },
    {
        title: "4. CONFIDENTIALITY",
        subsections: [
            {
                body: [
                    "The Receiving Party shall not disclose or use any Confidential Information of the Disclosing Party for purposes outside the scope of these TOS, unless prior written consent has been obtained from the Disclosing Party. The Receiving Party agrees to protect the confidentiality of the Disclosing Party\u2019s Confidential Information in the same manner as it protects the confidentiality of its own proprietary and confidential information of a similar nature (but in no event with less than reasonable care). If the Receiving Party is compelled by law to disclose Confidential Information of the Disclosing Party, it shall provide the Disclosing Party with prior notice of such compelled disclosure (to the extent permitted by law) and reasonable assistance, at the expense of the Disclosing Party, if the Disclosing Party wishes to contest the disclosure. If the Receiving Party discloses or uses (or threatens to disclose or use) any Confidential Information of the Disclosing Party in violation of the confidentiality protections provided herein, the Disclosing Party shall have the right, in addition to any other remedies available to it, to seek an injunction to prevent such acts, the Parties specifically acknowledging that any other available remedies may be inadequate.",
                ],
            },
        ],
    },
    {
        title: "5. ACCESS TO EXTERNAL RESOURCES",
        subsections: [
            {
                subtitle: "5.1. External Links",
                body: [
                    "From time to time, the Corporation may provide links to other websites or services, including links used to access or deliver the Services. Links shared through the Services may take Customer to websites or services not covered by these TOS. When Customer accesses third-party resources on the Internet in this manner, it does so at its own risk. The Corporation assumes no responsibility for Customer\u2019s use of these other websites or services or for the protection of its privacy on those websites or services. The Corporation makes no representations or warranties regarding the content of the websites or services to which it provides a link, or the products or services available on those websites, or the third parties that operate those websites.",
                ],
            },
            {
                subtitle: "5.2. Third-Party Services",
                body: [
                    "The Corporation reserves the right to discontinue providing certain features that constitute the Services, without notice, if, for example, a Third-Party Service is unavailable or incompatible with the Services. Third-Party Services are not guaranteed or supported by the Corporation. Third-Party Services and their features may be available, but this is not guaranteed. In addition, by activating a Third-Party Service, Customer authorizes the Corporation to transfer Customer Data to the third-party provider of that Third-Party Service in accordance with the operation of that Third-Party Service.",
                ],
            },
            {
                subtitle: "5.3. Third-Party Models",
                body: [
                    "Customer\u2019s use of AI models or services may be subject to additional terms, policies, data practices, retention settings, training settings, and usage restrictions. We are not responsible for model availability, model behavior, outages, or provider terms.",
                ],
            },
        ],
    },
    {
        title: "6. DATA AND INTELLECTUAL PROPERTY",
        subsections: [
            {
                subtitle: "6.1. Customer Data",
                body: [
                    "Customer owns all rights, title, and interest (including all Intellectual Property Rights) in the Customer Data. Customer grants the Corporation and its affiliates a non-exclusive, worldwide, fully paid-up, royalty-free license to host, use, copy, reproduce, display, store, process, and transmit Customer Data, as well as the right to sublicense these rights to service providers for the purpose of providing the Services, and only to the extent necessary. During the Term and thereafter, the Corporation may use, copy, modify, adapt, translate, create derivative works, distribute, and display the Customer Data, provided that it is aggregated or de-identified, for commercial purposes, including, without limitation, to develop, improve, and support the Services, all in accordance with applicable law. Customer is responsible for the Customer Data it uploads to the Services and must have all rights and permissions necessary to submit them.",
                ],
            },
            {
                subtitle: "6.2. Corporation Ownership",
                body: [
                    "Customer acknowledges and agrees that the Corporation and/or its licensors own all rights, title, and interest, including Intellectual Property Rights in and to (i) the Services, and (ii) anything developed or delivered by or on behalf of the Corporation under these TOS, the Corporation Content, and the Documentation. Customer acknowledges and agrees that the Services, Corporation Content, and Documentation are made available and not sold, and that, except as expressly stated herein, these TOS do not grant Customer any rights to, under, or in any Intellectual Property Rights (whether registered or unregistered), or any other rights or licenses with respect to the Services, Corporation Content, or Documentation. All Content and Intellectual Property Rights therein are owned, controlled, used, or licensed by the Corporation and are protected by all Intellectual Property Rights laws.",
                ],
            },
            {
                subtitle: "6.3. Feedback",
                body: [
                    "If Customer chooses to share suggestions for improving the Services with the Corporation (the \u201cFeedback\u201d), it irrevocably assigns to the Corporation all rights, title, and interest therein, including moral rights, which Customer waives to the extent permitted by law. The Corporation may use the Feedback freely and without restriction, without any obligation to compensate Customer. Customer agrees to provide reasonable assistance necessary to enable the Corporation to protect its rights in the Feedback.",
                ],
            },
        ],
    },
    {
        title: "7. TERM AND TERMINATION OF THE TOS",
        subsections: [
            {
                subtitle: "7.1. Term",
                body: [
                    "These TOS shall become effective on the Effective Date and shall remain in effect for an indefinite period, unless terminated earlier in accordance with the terms hereof or as otherwise agreed in writing between the Parties (the \u201cTerm\u201d).",
                ],
            },
            {
                subtitle: "7.2. Termination by the Corporation",
                body: [
                    "Without limiting any other provision of these TOS, if Customer materially breaches the terms and conditions set forth in the TOS or any applicable law or regulation and fails to remedy the breach within ten (10) days of receiving written notice from the Corporation, the Corporation reserves the right to deny access to and use of the Services, including, but not limited to, blocking certain IP addresses. In such circumstances, the Corporation may terminate these TOS, terminate Customer\u2019s use or participation in the Services, or delete Customer\u2019s Account without warning, at its sole discretion. Customer\u2019s obligation to pay any outstanding Fees shall remain in full force and effect and shall survive termination, and Customer shall not be entitled to a refund of any prepaid Fees, if applicable. In addition, the Corporation reserves the right to terminate these TOS and delete Customer\u2019s Account, if any, unilaterally if the Account remains inactive for a continuous period of more than two (2) years. The Corporation may, but is not obligated to, provide reasonable notice to Customer prior to deleting the Account for inactivity.",
                ],
            },
            {
                subtitle: "7.3. Termination by the Customer",
                body: [
                    "Customer may terminate its subscription to the Services by canceling the Services and/or deleting the Account, such termination not derogating from Customer\u2019s obligation to pay the applicable Fees.",
                ],
            },
            {
                subtitle: "7.4. Effect of Termination",
                body: [
                    "Upon effective termination of these TOS, all rights and licenses granted to Customer by the Corporation under these TOS shall be terminated. Termination by either Party of these TOS is without prejudice to any other remedy it may have at law or in equity and does not relieve either Party of its liability for breaches occurring prior to the effective date of termination. Neither Party shall be liable to the other for damages resulting solely from the termination of the TOS in accordance with its provisions.",
                ],
            },
        ],
    },
    {
        title: "8. DISCLAIMER OF WARRANTIES",
        subsections: [
            {
                subtitle: "8.1. Disclaimer",
                body: [
                    "TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CUSTOMER EXPRESSLY UNDERSTANDS AND AGREES THAT ITS USE OF THE SERVICES IS AT ITS SOLE RISK AND THAT THE SERVICES ARE PROVIDED \u201cAS IS\u201d AND \u201cAS AVAILABLE\u201d. THE CORPORATION EXPRESSLY DISCLAIMS ALL WARRANTIES, REPRESENTATIONS, AND CONDITIONS OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE EFFECT THAT: (i) THE SERVICES WILL MEET CUSTOMER\u2019S REQUIREMENTS; (ii) CUSTOMER\u2019S USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE; AND (iii) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES WILL BE ACCURATE OR RELIABLE.",
                ],
            },
            {
                subtitle: "8.2. No Legal, Tax or Accounting Advice",
                body: [
                    "The Services are not intended to constitute specific legal, tax and/or accounting advice or to be a substitute for advice from qualified counsel and other tax or accounting professionals. Without limiting the foregoing, the Services may not reflect recent developments in the law, may not be complete, may not be accurate in, or applicable to, Customer's jurisdiction, and local laws, provincial or state laws, or national laws may require different or additional provisions to ensure the desired result. Because the Services are general in nature and may not pertain to Customer's specific circumstances, Customer should not act or refrain from acting based on any Content or Documentation made available through the Services. Instead, Customer should consider obtaining advice from professional counsel qualified in the applicable subject matter and jurisdiction.",
                ],
            },
            {
                subtitle: "8.3. Automated and Chatbot Features",
                body: [
                    "Any chatbot or similar automated feature made available through the Services is designed to provide general information on various topics; however, such feature is an automated system, and the Corporation cannot guarantee the accuracy, completeness, or up-to-date nature of the information provided. By using any such feature, Customer understands that its responses may not be accurate, complete, or up to date, and that the Corporation is not liable for any damages or losses incurred as a result of relying on such responses.",
                ],
            },
            {
                subtitle: "8.4. No Attorney-Client Relationship",
                body: [
                    "Customer agrees that its access to and use of the Services, its transmission of e-mails to addresses made available through the Services, or other communications via the Services, do not create an attorney-client relationship between the Corporation, Leviat Legal Inc., or any individual attorney, and Customer or any User.",
                ],
            },
        ],
    },
    {
        title: "9. LIMITATION OF LIABILITY",
        subsections: [
            {
                subtitle: "9.1. Limitation",
                body: [
                    "NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED IN THESE TOS AND TO THE EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE CORPORATION BE LIABLE TO CUSTOMER FOR ANY SPECIAL, INDIRECT, EXEMPLARY, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, ARISING OUT OF OR IN CONNECTION WITH THESE TOS, THE SERVICES OR ANY SPECIAL OR SUBSEQUENT MODIFICATIONS TO THE SERVICES, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST SAVINGS OR ANY DAMAGES RESULTING FROM LOSS OF USE, LOSS OF CONTENT OR LOSS OF DATA. FURTHERMORE, THE CORPORATION\u2019S AGGREGATE LIABILITY TO CUSTOMER FOR DIRECT DAMAGES ARISING OUT OF OR RELATED TO THESE TOS, THE SERVICES, OR ANY SPECIAL OR SUBSEQUENT MODIFICATIONS TO THE SERVICES, SHALL IN NO EVENT EXCEED ONE HUNDRED DOLLARS (CAN $ 100). MULTIPLE CLAIMS WILL NOT EXPAND THIS LIMIT.",
                ],
            },
        ],
    },
    {
        title: "10. INDEMNIFICATION",
        subsections: [
            {
                subtitle: "10.1. Indemnification by Customer",
                body: [
                    "Customer shall defend the Corporation, its affiliates, and their shareholders, officers, directors, employees, and agents (\u201cCorporation Indemnified Parties\u201d) against any claim, demand, suit, or proceeding brought against a Corporation Indemnified Party by a third party resulting from Customer\u2019s violation of its obligations under these TOS (a \u201cClaim\u201d), and shall indemnify and hold harmless the Corporation Indemnified Parties from and against any loss, claim, damage, cost, expense, and other liabilities (including reasonable attorneys\u2019 fees and expenses) incurred by any Corporation Indemnified Party arising directly or indirectly from such Claim; provided that the Corporation Indemnified Parties: (i) promptly give Customer written notice of the Claim; (ii) give Customer sole control over the defense and settlement of the Claim (provided that Customer may only settle a Claim if the settlement unconditionally releases the Corporation Indemnified Parties from all liability); and (iii) provide Customer with all reasonable assistance, at Customer\u2019s own expense.",
                ],
            },
        ],
    },
    {
        title: "11. MISCELLANEOUS",
        subsections: [
            {
                subtitle: "11.1. Entire Agreement",
                body: [
                    "These TOS constitute the entire agreement between Customer and the Corporation with respect to Customer\u2019s use of the Services, superseding any prior agreement between Customer and the Corporation. These TOS are a separate agreement between you and Leviat Technologies, and are independent of any agreement you may have with its affiliate Leviat Legal Inc.",
                ],
            },
            {
                subtitle: "11.2. Applicable Laws and Jurisdiction",
                body: [
                    "USE OF THE SERVICES IS GOVERNED BY AND INTERPRETED IN ACCORDANCE WITH THE LAWS OF THE PROVINCE OF QU\u00c9BEC AND THE FEDERAL LAWS OF CANADA APPLICABLE IN THE PROVINCE OF QU\u00c9BEC, WITHOUT REGARD TO CONFLICT OF LAWS PROVISIONS. CUSTOMER AGREES THAT ANY LEGAL ACTION OR PROCEEDINGS BETWEEN CUSTOMER AND THE CORPORATION WILL BE BROUGHT EXCLUSIVELY IN THE COURTS LOCATED IN THE JUDICIAL DISTRICT OF MONTR\u00c9AL, PROVINCE OF QU\u00c9BEC, CANADA. THE FOREGOING CHOICE OF JURISDICTION SHALL NOT PREVENT THE CORPORATION FROM SEEKING AN INJUNCTION REGARDING A VIOLATION OF INTELLECTUAL PROPERTY RIGHTS, NOR FROM SEEKING ENFORCEMENT OR RECOGNITION OF ANY JUDGMENT OR ORDER IN ANY APPROPRIATE JURISDICTION.",
                ],
            },
            {
                subtitle: "11.3. Notice",
                body: [
                    "If Customer has any complaints or requests for information regarding the Services, it must contact the Corporation at the following email address: info@leviatlegal.com.",
                ],
            },
            {
                subtitle: "11.4. Invalidity of a Provision",
                body: [
                    "If any provision of the TOS is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall not affect or impair the validity, legality, or enforceability of the remaining provisions of the TOS.",
                ],
            },
            {
                subtitle: "11.5. Survival",
                body: [
                    "All provisions of these TOS that by their nature should reasonably survive termination of the TOS, including, without limitation, Sections 4, 6, 8, 9, and 10 of these TOS, shall survive termination of the TOS.",
                ],
            },
            {
                subtitle: "11.6. Assignment",
                body: [
                    "These TOS, and Customer\u2019s rights and obligations hereunder, may not be assigned, subcontracted, delegated, or otherwise transferred by Customer without the prior written consent of the Corporation, and any attempted assignment, subcontracting, delegation, or transfer in violation of the foregoing shall be null and void. The Corporation may assign these TOS, as well as its rights and obligations hereunder, in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets related to the Services, without the prior written consent of Customer.",
                ],
            },
            {
                subtitle: "11.7. No Waiver",
                body: [
                    "The failure of either Party to act or delay in acting with respect to any breach or non-exercise of any right under the TOS shall not constitute a waiver of such performance or right.",
                ],
            },
            {
                subtitle: "11.8. Force Majeure",
                body: [
                    "A Party shall in no event be liable for any failure or delay in the performance of its obligations hereunder (except for payment obligations) arising directly or indirectly from a force majeure event. It is understood that the Party experiencing a force majeure event will use reasonable efforts, in accordance with accepted practices, to resume performance of its obligations as soon as possible under the circumstances, if reasonably possible.",
                ],
            },
            {
                subtitle: "11.9. Successors and Assigns",
                body: [
                    "All obligations set forth in the TOS are binding and apply in favor of the respective successors and assigns of the Parties.",
                ],
            },
        ],
    },
    {
        title: "12. DEFINITIONS",
        subsections: [
            {
                body: [
                    "12.1. \u201cAccount\u201d means an account dedicated to Customer and the Users, if any, for access to and use of the Services;",
                    "12.2. \u201cClaim\u201d has the meaning set forth in paragraph 10.1;",
                    "12.3. \u201cConfidential Information\u201d means all confidential and proprietary information of one party (the \u201cDisclosing Party\u201d) disclosed to the other party (the \u201cReceiving Party\u201d), orally or in writing, that is designated as confidential or that should reasonably be considered confidential given the nature of the information and the circumstances of the disclosure, including, but not limited to, these TOS and the Services. Confidential Information does not include information that (i) is or becomes publicly known without breach of any obligation to the Disclosing Party; (ii) was known to the Receiving Party prior to its disclosure by the Disclosing Party without breach of any obligation to the Disclosing Party; (iii) was independently developed by the Receiving Party without breach of any obligation to the Disclosing Party; or (iv) is received from a third party without breach of any obligation to the Disclosing Party;",
                    "12.4. \u201cContent\u201d means, without limitation, any information, code, data, functionality, website design, text, software, music, audio content, photographs, graphics, videos, messages, tags, and/or other materials, including AI-generated or system-generated responses, summaries, extractions, drafts, edits, citations, or other similar output;",
                    "12.5. \u201cCorporation\u201d has the meaning set forth in the preamble of these TOS;",
                    "12.6. \u201cCorporation Indemnified Parties\u201d has the meaning set forth in paragraph 10.1;",
                    "12.7. \u201cCustomer\u201d means any individual, organization, corporation or other legal entity that benefits from or accesses the Services provided by the Corporation;",
                    "12.8. \u201cCustomer Data\u201d means all data stored by or on behalf of Customer, or at Customer\u2019s request, in the Services. Customer Data also includes Content added by a User, if applicable. To the extent that such Content is stored in, or transferred to, the Account, such Content will be considered Customer Data;",
                    "12.9. \u201cDisclosing Party\u201d has the meaning set forth in paragraph 12.3;",
                    "12.10. \u201cDocumentation\u201d means all manuals, instructions, or other documents or materials that the Corporation may provide or make available to Customer, in any form or medium, that describe the functionality, components, features, requirements, or fees related to the Services. Documentation does not include content posted in user or community forums;",
                    "12.11. \u201cEffective Date\u201d has the meaning set forth in the preamble of these TOS;",
                    "12.12. \u201cFeedback\u201d has the meaning set forth in paragraph 6.3;",
                    "12.13. \u201cFees\u201d has the meaning set forth in paragraph 2.1 of these TOS;",
                    "12.14. \u201cIntellectual Property Rights\u201d means all patents, invention rights, utility models, copyrights and related rights, trademarks, service marks, trade names, corporation names and domain names, rights to goodwill or recourse for unfair competition, unfair competition rights, design rights, software rights, database rights, topography rights, rights in confidential information (including know-how and trade secrets), and any other intellectual property rights, whether registered or unregistered, including all applications, renewals, or extensions of such rights, and all similar or equivalent rights or forms of protection in any part of the world, as well as all claims for damages arising from past, present, or future infringements of the foregoing, with the right, but not the obligation, to bring legal action and collect such damages for said use or infringement of these rights;",
                    "12.15. \u201cParties\u201d means collectively the Corporation and Customer, and \u201cParty\u201d means individually either one of them;",
                    "12.16. \u201cReceiving Party\u201d has the meaning set forth in paragraph 12.3;",
                    "12.17. \u201cServices\u201d means all software applications made available by the Corporation through its various platforms;",
                    "12.18. \u201cTOS\u201d has the meaning set forth in the preamble of these TOS;",
                    "12.19. \u201cTerm\u201d has the meaning set forth in paragraph 7.1 of these TOS;",
                    "12.20. \u201cThird-Party Services\u201d means any third-party service, connection, data, software, application, or integration that interoperates with the Services and is provided or made available by Customer or a third party; and",
                    "12.21. \u201cUser\u201d means any person authorized by Customer to access or use the Services, whether directly or indirectly, including through a link, interface or other means made available by the Corporation to Customer or to a designated representative of Customer for further distribution within its organization. Each User must use a unique identity to access and use the Services, to the extent individual credentials are required, and may only access and use the Services to the extent made available to Customer.",
                ],
            },
        ],
    },
];

export default function TermsPage() {
    return (
        <main className="w-full px-6 py-6 md:py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-medium font-eb-garamond mb-3">
                    Terms of Service
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Last Updated: {lastUpdated}
                </p>
                <div className="mb-8 rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900 mb-1">
                        Important Notice
                    </p>
                    <div className="space-y-3">
                        {importantNotice.map((paragraph) => (
                            <p
                                key={paragraph}
                                className="text-sm text-amber-800 leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
                <div className="mb-8 space-y-3">
                    {preamble.map((paragraph) => (
                        <p
                            key={paragraph}
                            className="text-sm text-gray-700 leading-relaxed"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
                <div className="space-y-7">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-xl font-medium mb-3">
                                {section.title}
                            </h2>
                            <div className="space-y-4">
                                {section.subsections.map((sub, i) => (
                                    <div key={sub.subtitle ?? i}>
                                        {sub.subtitle && (
                                            <h3 className="text-base font-medium mb-2">
                                                {sub.subtitle}
                                            </h3>
                                        )}
                                        <div className="space-y-3">
                                            {sub.body.map((paragraph) => (
                                                <p
                                                    key={paragraph}
                                                    className="text-sm text-gray-700 leading-relaxed"
                                                >
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}

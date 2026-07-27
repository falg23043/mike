"use client";

const lastUpdated = "July 24, 2026";

type Block =
    | { kind: "p"; text: string }
    | { kind: "label"; text: string }
    | { kind: "ul"; items: string[] };

const intro: Block[] = [
    { kind: "p", text: "This privacy policy (\u201cPrivacy Policy\u201d) describes how Leviat Technologies Inc. doing business as Leviat Labs (\u201cour\u201d, \u201cus\u201d or \u201cwe\u201d), collects, uses, shares, and stores personal information of clients and users of its website, web application, products and services (collectively, the \u201cServices\u201d) on or in which this Privacy Policy is posted, linked, or referenced." },
    { kind: "p", text: "We are committed to protecting your privacy rights and recognize the importance of protecting the information that we collect about you. We have prepared this Privacy Policy to describe our practices regarding the personal information we collect." },
    { kind: "p", text: "By using the Services, you accept the terms of this Privacy Policy and our Terms of Service, and consent to our collection, use, disclosure, and retention of your information as described in this Privacy Policy. If you have not done so already, please also review our Terms of Service. The Terms of Service contain provisions that limit our liability to you. IF YOU DO NOT AGREE WITH ANY PART OF THIS PRIVACY POLICY OR OUR TERMS OF SERVICE, THEN PLEASE DO NOT USE ANY OF THE SERVICES." },
    { kind: "p", text: "Please note that this Privacy Policy does not apply to information collected through third-party websites or services that you may access through the Services or that you submit to us through email or other electronic message or offline. We encourage you to carefully review the privacy policies of any third-party website you access." },
];

const sections: { title: string; blocks: Block[] }[] = [
    {
        title: "What we Collect",
        blocks: [
            { kind: "label", text: "Information You Give Us." },
            { kind: "p", text: "Information we collect from you may include:" },
            { kind: "ul", items: [
                "Contact information, such as your name, email address, billing address, phone number or social media;",
                "Profile information, such as your password, preferences, feedback and survey responses;",
                "Transaction information, such as certain billing information, payment dates, billing cycle dates, products or services purchased, which authorized payment provider you use, or other consuming histories or tendencies. We do not collect any payment data when you are using an authorized payment service provider (except in circumstances where the payment is made directly to us and not processed through another authorized payment service provider);",
                "Marketing information, such as your preferences for receiving marketing communications and details about how you engage with them; and",
                "Other information not specifically listed here, which we will use as described in this Privacy Policy or as otherwise disclosed at the time of collection.",
            ] },
            { kind: "label", text: "Third-Party Sources." },
            { kind: "p", text: "We may obtain personal information about you from third-party sources where you have authorized such access or where such access is necessary for the provision of the Services. We may add this to the data we have already collected from or about you through the Services." },
            { kind: "label", text: "Automatic Data Collection." },
            { kind: "p", text: "We may automatically record certain information about how you use the Services (we refer to this information as \u201cLog Data\u201d). Log Data may include information such as a user\u2019s Internet Protocol (IP) address, device and browser type, operating system, the pages or features available through the Services to which a user browsed and the time spent on those pages or features, the frequency with which the Services are used by a user, search terms, the links made available through the Services that a user clicked on or used, the time zone setting and location, and other statistics. We use this information to improve and enhance the Services by expanding its features and functionality and tailoring it to our users\u2019 needs and preferences." },
            { kind: "p", text: "If you have consented to their uses (to the extent required under applicable laws), we may use cookies, local storage or similar technologies to analyze trends, administer the pages made available through the Services, track users\u2019 movements around the pages made available through the Services, and to gather demographic information about our user base as a whole. Users can control the use of cookies and local storage at the individual browser level." },
            { kind: "label", text: "Information We Will Never Collect." },
            { kind: "p", text: "We do not collect any other personal information outside of what is outlined in this Privacy Policy, unless you give it to us directly, such as by filling out a form, giving feedback, communicating via email or third-party social media websites or any other means." },
        ],
    },
    {
        title: "Use of Personal Information",
        blocks: [
            { kind: "p", text: "We use the collected personal information for various purposes or as otherwise described at the time of collection:" },
            { kind: "label", text: "Service Delivery." },
            { kind: "p", text: "We use your personal information to:" },
            { kind: "ul", items: [
                "provide, operate and improve the Services and our business;",
                "register you as a user of Services;",
                "enter into and perform contracts under which we provide services to you;",
                "communicate with you about the Services, including by sending announcements, updates, security alerts, and support and administrative messages; and",
                "provide support for the Services, and respond to your requests, questions and feedback.",
            ] },
            { kind: "label", text: "Research and Development." },
            { kind: "p", text: "We may use your personal information for research and development purposes, including to analyze and improve the Services and our business. As part of these activities, we may create aggregated, de-identified or other anonymous data from personal information we collect. We make personal information into anonymous data by removing information that makes the data personally identifiable to you." },
            { kind: "label", text: "Compliance and Protection." },
            { kind: "p", text: "We may use your personal information to:" },
            { kind: "ul", items: [
                "comply with applicable laws, lawful requests, and legal processes, such as to respond to subpoenas or requests from government authorities;",
                "protect our, your or others\u2019 rights, privacy, safety or property (including by making and defending legal claims);",
                "audit our internal processes for compliance with legal and contractual requirements and internal policies;",
                "enforce the Terms of Service that govern the Services; and",
                "prevent, identify, investigate and deter fraudulent, harmful, unauthorized, unethical or illegal activity, including cyberattacks and identity theft.",
            ] },
            { kind: "label", text: "With Your Consent." },
            { kind: "p", text: "We may use, share or collect your personal information with your consent, such as when required by law." },
        ],
    },
    {
        title: "Disclosure of Your Data",
        blocks: [
            { kind: "p", text: "We may share your data with the following parties and as otherwise described in this Privacy Policy or at the time of collection." },
            { kind: "label", text: "Affiliates." },
            { kind: "p", text: "We may disclose your personal information to our subsidiaries and corporate affiliates (i.e., our family of companies that are related by common ownership or control) for purposes consistent with this Privacy Policy and our Terms of Service." },
            { kind: "label", text: "Authorities and Others." },
            { kind: "p", text: "We may disclose your personal information for law enforcement purposes, with government authorities, and private parties, as we believe in good faith to be necessary or appropriate for the \u201cCompliance and Protection\u201d purposes described above." },
            { kind: "label", text: "Business Transfers." },
            { kind: "p", text: "We may share personal information when we do a business deal, or negotiate a business deal, involving the sale or transfer of all or a part of our business or assets. These deals can include any merger, financing, acquisition, reorganization, divestiture, or in the event of bankruptcy or dissolution." },
            { kind: "label", text: "Professional Advisors and Service Providers." },
            { kind: "p", text: "We may share personal information with those who need it to work for us. These recipients may include our employees as well as third-party companies and individuals to administer and provide the Services on our behalf, as well as lawyers, bankers, auditors, and insurers." },
            { kind: "p", text: "We will never rent or sell your personal information or use this information to send you spam." },
            { kind: "p", text: "We are based in Qu\u00e9bec, Canada. The personal information we collect is stored and processed in Canada, or where we or our partners, affiliates and third-party providers maintain facilities. As some of our service providers are located outside of Canada, your personal information may be transferred to, accessed from, or processed in jurisdictions outside of your own. In such cases, your information may be subject to the laws of those jurisdictions, which may grant access rights to competent authorities to access your personal information. We require, through contractual commitments, that the security measures employed by these third parties comply with applicable legislation and are aligned with our way of collecting, using and disclosing your personal information. By providing us with your personal information, you consent to the disclosure to these third parties, in jurisdictions where privacy laws may not be as protective as those in your jurisdiction." },
        ],
    },
    {
        title: "Data Retention",
        blocks: [
            { kind: "p", text: "We retain information we collect as long as it is necessary and relevant to fulfill the purposes outlined in this Privacy Policy. In addition, we retain personal information to comply with applicable law where required, prevent fraud, resolve disputes, troubleshoot problems, assist with any investigation, enforce our Terms of Service, and other actions permitted by law. To determine the appropriate retention period for personal information, we consider the amount, nature, and sensitivity of the personal information, the potential risk of harm from unauthorized use or disclosure of your personal information, the purposes for which we process your personal information and whether we can achieve those purposes through other means, and the applicable legal requirements." },
            { kind: "p", text: "In some circumstances we may anonymize your personal information (so that it can no longer be associated with you) in which case we may use this information indefinitely without further notice to you." },
            { kind: "p", text: "We employ industry standard security measures designed to protect the security of all information submitted through the Services. However, the security of information transmitted through the Internet can never be guaranteed. We are not responsible for any interception or interruption of any communications through the Internet or for changes to or losses of data. Users of the Services are responsible for maintaining the security of any password, user ID or other form of authentication involved in obtaining access to password protected or secure areas of any of our digital services. In order to protect you and your data, we may suspend your use of any of the Services, without notice, pending an investigation, if any breach of security is suspected." },
        ],
    },
    {
        title: "Your Rights",
        blocks: [
            { kind: "p", text: "Depending on applicable laws, you may have the following rights with respect to your personal information:" },
            { kind: "ul", items: [
                "the right to ask us for an overview of your personal information that we process;",
                "the right to ask us to transfer your personal information directly to you or to another entity, including in a structured, commonly used and machine-readable format. This may apply to personal information that we process by automated means and with your consent or on the basis of a contract with you. We will transfer your personal information where it is technically feasible;",
                "the right to have your personal information deleted if we no longer need it for its original purpose, if you object to us processing your personal information for our own legitimate interests or for personalized commercial messages, if you withdraw your consent for processing your personal information, if we unlawfully process your personal information, or if a law requires us to erase your personal information;",
                "the right to object to us using your personal information for our own legitimate interests. We will consider your objection and whether processing your personal information has any undue impact on you that requires us to stop doing so. You cannot object to us processing your personal information if we are legally required to do so (for example if we are obliged to fulfill a contract with you);",
                "if your personal information is incorrect, you have the right to ask us to rectify it. If we shared such data about you with a third party in compliance with this Privacy Policy, it is our obligation to notify this change to the third party;",
                "the right to ask us to restrict using your personal information if in your opinion the information is inaccurate, if we are processing the data unlawfully, or if you have objected to us processing your personal information for our own legitimate interests; and",
                "should you not be satisfied with the way we have responded to your concerns, you have the right to submit a complaint to us using the contact information in the \u201cContact us\u201d section below in this Privacy Policy. If you are still unhappy with our reaction to your complaint, you can also contact the data protection authority in your country.",
            ] },
            { kind: "p", text: "Please note that deletion of your personal information may make it impossible for you to use the Services." },
        ],
    },
    {
        title: "Third Party Payment Service Provider",
        blocks: [
            { kind: "p", text: "The Services include functionality that enables you to make payments using any authorized payment method, including, without limitation, payments made via the AWS Marketplace. When you use such a payment method to remit funds to us, your personal information is collected directly by the third-party provider of that payment method, and not by us. The collection, use, and disclosure of your personal information by such provider are governed by its own privacy policy, not this Privacy Policy. We do not control and are not responsible for the privacy practices of any third-party payment service provider." },
        ],
    },
    {
        title: "Limitation of Liability",
        blocks: [
            { kind: "p", text: "We, and/or our respective officers, directors, shareholders, owners, officials, partners, partnership, principals, employees, affiliates and other related entities, servants, agents, representatives, successors and assigns, will not be held liable for any losses or damages (pecuniary or otherwise) resulting from the misuse of any information collected through the Services not in violation of this Privacy Policy or any applicable laws." },
        ],
    },
    {
        title: "Compliance with Privacy Laws",
        blocks: [
            { kind: "p", text: "This Privacy Policy and our practices in general are designed to be in compliance with Canada\u2019s Personal Information Protection and Electronic Documents Act (S.C. 2000, c. 5) and Qu\u00e9bec\u2019s An Act Respecting the Protection of Personal Information in the Private Sector (R.S.Q. c. P-39.1) and any amendments thereof." },
        ],
    },
    {
        title: "Changes to this Privacy Policy",
        blocks: [
            { kind: "p", text: "We may change this Privacy Policy at any time. We encourage you to periodically review this page for the latest information about our privacy practices. If we make any changes, we will change the Last Updated date above." },
            { kind: "p", text: "Any modifications to this Privacy Policy will be effective upon our posting of the new terms and/or upon implementation of the changes to the Services (or as otherwise indicated at the time of posting). In all cases, your continued use of the Services after the posting of any modified Privacy Policy indicates your acceptance of the terms of the modified Privacy Policy." },
        ],
    },
    {
        title: "Contact us",
        blocks: [
            { kind: "p", text: "If you have any question or comment about this Privacy Policy, please do not hesitate to contact us at info@leviatlegal.com." },
        ],
    },
];

function renderBlock(block: Block, i: number) {
    if (block.kind === "label") {
        return (
            <p
                key={i}
                className="text-sm font-medium text-gray-900 leading-relaxed"
            >
                {block.text}
            </p>
        );
    }
    if (block.kind === "ul") {
        return (
            <ul
                key={i}
                className="list-disc pl-6 text-sm text-gray-700 space-y-1"
            >
                {block.items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        );
    }
    return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
            {block.text}
        </p>
    );
}

export default function PrivacyPage() {
    return (
        <main className="w-full px-6 py-6 md:py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-medium font-eb-garamond mb-3">
                    Privacy Policy
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Last Updated: {lastUpdated}
                </p>
                <div className="mb-8 space-y-3">
                    {intro.map((block, i) => renderBlock(block, i))}
                </div>
                <div className="space-y-7">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="text-xl font-medium mb-3">
                                {section.title}
                            </h2>
                            <div className="space-y-3">
                                {section.blocks.map((block, i) =>
                                    renderBlock(block, i)
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}

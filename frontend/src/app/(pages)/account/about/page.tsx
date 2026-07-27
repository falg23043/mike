"use client";

import { accountGlassSectionClassName } from "../accountStyles";

export default function AboutPage() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-medium font-serif">About</h2>
            </div>
            <div className={accountGlassSectionClassName}>
                <div className="px-4 py-5">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        The Leviat Labs app is a modified fork of the Mike
                        open-source project available{" "}
                        <a
                            href="https://github.com/Open-Legal-Products/mike"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            here
                        </a>
                        . Source code will be provided upon request.
                    </p>
                </div>
            </div>
        </div>
    );
}

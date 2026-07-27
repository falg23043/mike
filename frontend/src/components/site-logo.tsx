import Link from "next/link";

interface SiteLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    iconClassName?: string;
    animate?: boolean;
    asLink?: boolean;
}

export function SiteLogo({
    size = "md",
    className = "",
    animate = false,
    asLink = false,
}: SiteLogoProps) {
    const landingHref =
        process.env.NODE_ENV === "production"
            ? "https://app.leviat.legal"
            : "http://localhost:3000";

    const sizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-5xl",
    };

    const logo = (
        <div
            className={`flex items-center gap-2.5 ${
                animate ? "sidebar-fade-in" : ""
            } ${className}`}
        >
            <span
                className={`font-commuters font-semibold uppercase leading-none tracking-wide text-[#02263f] whitespace-nowrap ${sizeClasses[size]}`}
            >
                Leviat Labs
            </span>
        </div>
    );

    if (asLink) {
        return (
            <Link
                href={landingHref}
                className="cursor-pointer hover:opacity-80 transition-opacity"
            >
                {logo}
            </Link>
        );
    }

    return logo;
}

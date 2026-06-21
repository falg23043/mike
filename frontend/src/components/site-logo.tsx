import Link from "next/link";
import Image from "next/image";

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
    iconClassName = "",
    animate = false,
    asLink = false,
}: SiteLogoProps) {
    const landingHref =
        process.env.NODE_ENV === "production"
            ? "https://mikeoss.com"
            : "http://localhost:3000";

    const sizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-5xl",
    };

    // Emblem pixel sizes, tuned to sit visually balanced next to the wordmark.
    const iconSizes = {
        sm: 24,
        md: 28,
        lg: 40,
        xl: 60,
    };

    const px = iconSizes[size];

    const logo = (
        <div
            className={`flex items-center gap-2.5 ${
                animate ? "sidebar-fade-in" : ""
            } ${className}`}
        >
            <span
                className={`inline-flex shrink-0 items-center leading-none ${iconClassName}`}
            >
                <Image
                    src="/brand/leviat-mark.png"
                    alt="Leviat Legal"
                    width={px}
                    height={px}
                    priority
                    className="h-auto w-auto"
                    style={{ height: px, width: "auto" }}
                />
            </span>
            <span
                className={`font-commuters font-semibold uppercase leading-none tracking-wide text-[#02263f] whitespace-nowrap ${sizeClasses[size]}`}
            >
                Leviat Legal
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

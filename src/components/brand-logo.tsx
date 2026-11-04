import { cn } from "cn";

type LogoMarkProps = React.ComponentProps<"svg"> & {
  idPrefix?: string;
};

/**
 * The BookNook mark: three page-shaped swooshes that fold into an open book.
 */
export function LogoMark({ className, idPrefix = "bn", ...props }: LogoMarkProps) {
  const top = `${idPrefix}-top`;
  const middle = `${idPrefix}-middle`;
  const tail = `${idPrefix}-tail`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("size-9", className)}
      {...props}
    >
      <defs>
        <linearGradient id={top} x1="10" y1="8" x2="46" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b7cdf9" />
          <stop offset="1" stopColor="#8fa7ef" />
        </linearGradient>
        <linearGradient id={middle} x1="12" y1="38" x2="42" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9fb6f4" />
          <stop offset="1" stopColor="#7f8fe6" />
        </linearGradient>
        <linearGradient id={tail} x1="50" y1="42" x2="46" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#cfbcf4" />
          <stop offset="1" stopColor="#8b6ee0" />
        </linearGradient>
      </defs>

      {/* top page */}
      <path
        d="M6 10.5C6 9.1 7.1 8 8.5 8H30c11.5 0 21.4 5 26.3 15.2.6 1.2-.6 2.3-1.8 1.8C41.5 20.6 25.4 23 8 33.9c-1.2.7-2 0-2-1.3V10.5Z"
        fill={`url(#${top})`}
      />

      {/* folded middle page */}
      <path
        d="M7 37.1c0-1.3 1.3-2.2 2.5-1.7 15.7 6.5 29.6 7.8 44 4.4L13.9 60.1C9.7 62.3 5 59.4 5 54.7V37.1Z"
        fill={`url(#${middle})`}
      />

      {/* curled spine */}
      <path
        d="M59.4 41.1c7.3 12.4 2.6 25.5-9.1 32.6-5.3 3.2-11.2 3.8-15.8 2.4 8.7-6 15-13.4 18.1-23.1 1.2-3.6 1.7-7.2 1.7-10.7 0-1.9 3.9-2.8 5.1-1.2Z"
        fill={`url(#${tail})`}
      />
    </svg>
  );
}

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  tone?: "dark" | "light";
};

export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  tone = "dark",
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span
        className={cn(
          "text-[28px] leading-none font-extrabold tracking-[-0.035em] sm:text-[32px]",
          tone === "light" ? "text-white" : "text-ink",
          wordmarkClassName
        )}
      >
        BookNook
      </span>
    </span>
  );
}

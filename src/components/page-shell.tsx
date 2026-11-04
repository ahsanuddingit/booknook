import { cn } from "cn";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

/** Shared heading layout for the inner library pages. */
export function PageShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageShellProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1200px] flex-1 px-5 py-14 sm:px-8 lg:px-10 lg:py-20",
        className
      )}
    >
      <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-muted">
        {description}
      </p>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-brand-tint/70 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
        {description}
      </p>
    </div>
  );
}

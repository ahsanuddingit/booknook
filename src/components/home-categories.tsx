import Link from "next/link";

/**
 * Category quick-links for the home page. Mirrors the fixed category list used
 * by add-book and my-books (`[Fiction, Science, History, Kids, Others]`) and
 * deep-links into the catalog's category filter via `/books?category=…`.
 */
const CATEGORY_LINKS: {
  name: string;
  blurb: string;
  highlight?: boolean;
}[] = [
  {
    name: "Fiction",
    blurb: "Novels and stories to get lost in",
  },
  {
    name: "Science",
    blurb: "Fresh investigations and discoveries",
    highlight: true,
  },
  {
    name: "History",
    blurb: "The past, retold shelf by shelf",
  },
  {
    name: "Kids",
    blurb: "Picture books and young readers",
  },
  {
    name: "Others",
    blurb: "Everything that waits between genres",
  },
];

export function HomeCategories() {
  return (
    <section
      aria-labelledby="home-categories-heading"
      className="bg-[#f5f4f1] py-14 lg:py-18"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="text-[11px] font-bold tracking-[0.16em] text-brand uppercase">
          Browse the nook
        </p>
        <h2
          id="home-categories-heading"
          className="mt-2 text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[30px]"
        >
          Find a shelf that fits your curiosity
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
          Jump straight into a category — Science is our freshest shelf, and
          the rest are just a tap away.
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {CATEGORY_LINKS.map((category) => (
            <li key={category.name}>
              <Link
                href={`/books?category=${encodeURIComponent(category.name)}`}
                className={
                  category.highlight
                    ? "group flex h-auto flex-col gap-0.5 rounded-2xl border-2 border-brand bg-brand/10 px-5 py-3 text-ink shadow-[0_10px_24px_-16px_rgba(47,44,61,0.4)] transition-colors hover:bg-brand hover:text-white focus-visible:ring-4 focus-visible:ring-brand/25 focus-visible:outline-none"
                    : "group flex h-auto flex-col gap-0.5 rounded-2xl border border-line bg-white px-5 py-3 text-ink shadow-sm transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:ring-4 focus-visible:ring-brand/25 focus-visible:outline-none"
                }
              >
                <span className="flex items-center gap-2 text-sm font-bold tracking-[0.02em]">
                  {category.name}
                  {category.highlight ? (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white uppercase group-hover:bg-white group-hover:text-brand">
                      New
                    </span>
                  ) : null}
                </span>
                <span
                  className={
                    category.highlight
                      ? "text-xs text-ink/70 group-hover:text-white/80"
                      : "text-xs text-ink-muted group-hover:text-brand"
                  }
                >
                  {category.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

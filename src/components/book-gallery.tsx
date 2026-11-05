/**
 * Decorative "book cover mockup" showcase for the home page, placed after the
 * trending section. Pure CSS art — no image assets. Tiles are decorative and
 * hidden from assistive tech; the section exposes a single sr-only heading.
 */

const CHECKER = {
  backgroundImage:
    "conic-gradient(from 90deg, #30307e 0deg 90deg, #f0a5cf 90deg 180deg, #faf7ee 180deg 270deg, #30307e 270deg 360deg)",
  backgroundSize: "16px 16px",
} as const;

function CookbookTile() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#a3cdf2] lg:aspect-auto">
      {/* diagonal shelf bands */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.3) 50%, transparent 50%, transparent 66%, rgba(255,255,255,0.3) 66%, rgba(255,255,255,0.3) 76%, transparent 76%)",
        }}
      />

      {/* the book */}
      <div className="absolute left-1/2 top-1/2 w-[62%] max-w-[460px] -translate-x-1/2 -translate-y-1/2 -rotate-6 bg-white p-[2.6%] shadow-[0_45px_70px_-40px_rgba(25,55,110,0.55)]">
        <div className="relative aspect-[3/4] bg-[#f3ede4]">
          {/* frosting swirl */}
          <div
            aria-hidden="true"
            className="absolute right-[7%] top-[28%] aspect-square w-[52%] rounded-full bg-[#f3d7c8]"
          />
          <div
            aria-hidden="true"
            className="absolute right-[24%] top-[22%] size-[5%] rounded-full bg-[#e79fb8]"
          />
          {/* inside-page hint */}
          <div
            aria-hidden="true"
            className="absolute bottom-[4%] right-[4%] h-[26%] w-[12%] bg-[#eadfd2]"
          />

          <h3
            className="absolute left-[7%] top-[7%] max-w-[58%] font-black leading-[0.92] tracking-[-0.03em] text-[#191a1e]"
            style={{ fontSize: "clamp(1.4rem,3.2vw,2.85rem)" }}
          >
            book
            <br />
            mock up.
          </h3>
          <p
            className="absolute right-[3%] top-1/2 -translate-y-1/2 rotate-90 font-bold text-[#191a1e]"
            style={{ fontSize: "clamp(0.55rem,0.9vw,0.8rem)" }}
          >
            cook. book.
          </p>

          {/* barcode */}
          <div
            aria-hidden="true"
            className="absolute bottom-[6%] left-[5%] h-[7%] w-[18%]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #15161a 0 2px, transparent 2px 5px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function YellowBookTile() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#c9c9c9] sm:aspect-square">
      {/* pedestals */}
      <div
        aria-hidden="true"
        className="absolute bottom-[16%] left-[10%] h-[18%] w-[32%] bg-[#f5f5f5]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[16%] left-[40%] h-[11%] w-[28%] bg-[#ececec]"
      />

      {/* the book */}
      <div className="absolute left-1/2 top-1/2 w-[48%] -translate-x-1/2 -translate-y-[58%] rotate-12 bg-[#e5e64b] p-[2.5%] shadow-[0_40px_55px_-30px_rgba(70,70,70,0.55)]">
        <div className="relative aspect-[3/4]">
          <p className="absolute left-[10%] top-[6%] text-[clamp(0.45rem,0.8vw,0.7rem)] font-bold leading-snug tracking-[0.18em] text-[#20212a] uppercase">
            Book
            <br />
            Cover
            <br />
            Mock up
          </p>

          {/* leaves */}
          <div
            aria-hidden="true"
            className="absolute right-[8%] top-[16%] h-[9%] w-[24%] rounded-[999px_999px_999px_2px] bg-white"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[24%] left-[12%] h-[11%] w-[28%] -rotate-[24deg] rounded-[999px_999px_2px_999px] bg-white"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[16%] left-[34%] h-[8%] w-[20%] -rotate-[10deg] rounded-[999px_999px_2px_999px] bg-[#f4f6e2]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[12%] left-[30%] top-[34%] w-px bg-white/90"
          />
          <div
            aria-hidden="true"
            className="absolute right-[12%] top-[38%] size-[9%] rounded-[999px_2px_999px_999px] bg-white"
          />
        </div>
      </div>
    </div>
  );
}

function PinkStackTile() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#cf5fa7] sm:aspect-square">
      <div className="absolute inset-0 flex items-center justify-center gap-[7%] p-[7%]">
        {/* upright book */}
        <div className="relative h-[84%] w-[36%] bg-[#f0c34a] shadow-[0_30px_45px_-25px_rgba(105,40,80,0.6)]">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-[36%]"
            style={CHECKER}
          />
          <p className="absolute left-[9%] top-[5%] text-[clamp(0.5rem,0.9vw,0.8rem)] font-bold leading-snug text-[#3a2f16]">
            Book Cover
            <br />
            Mockup
          </p>
          <div
            aria-hidden="true"
            className="absolute bottom-[6%] left-[9%] size-[10%] rounded-full bg-[#faf7ee]"
          />
        </div>

        {/* stacked spines */}
        <div className="flex h-[74%] w-[40%] flex-col justify-center gap-[5%]">
          {["100%", "92%", "100%", "86%"].map((width, index, all) => (
            <div
              key={index}
              className="relative h-[14%] shadow-[inset_0_3px_0_rgba(255,255,255,0.85),0_10px_18px_-12px_rgba(105,40,80,0.7)]"
              style={{ width, marginLeft: all.length - 1 - index === 1 ? "6%" : "0" }}
            >
              <div aria-hidden="true" className="absolute inset-0 bg-[#f0c34a]" />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-[8%] w-[38%]"
                style={CHECKER}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GreenBooksTile() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#5a6a3e] sm:aspect-[2/1] lg:aspect-[7/3]">
      <div className="absolute inset-0 flex items-center justify-center gap-[6%] p-[6%]">
        {/* left book */}
        <div className="relative aspect-[3/4] h-[86%] rotate-2 bg-[#bdd0ae] shadow-[0_35px_60px_-30px_rgba(20,30,10,0.6)] sm:h-[78%]">
          <div
            aria-hidden="true"
            className="absolute right-[6%] top-[7%] aspect-square w-[58%] rounded-full bg-[#f1f4ea]"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[12%] left-[10%] size-[24%] rounded-full bg-white"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[38%] left-[38%] size-[9%] rounded-full bg-[#7d9757]"
          />
          <p className="absolute left-[9%] top-[9%] text-[clamp(0.4rem,0.8vw,0.65rem)] font-bold leading-snug tracking-[0.2em] text-[#46542f] uppercase">
            Book ·
            <br />
            Cover
            <br />
            Mockup
          </p>
        </div>

        {/* right book */}
        <div className="relative aspect-[3/4] h-[80%] -rotate-1 bg-[#c6d6b8] shadow-[0_35px_60px_-30px_rgba(20,30,10,0.6)] sm:h-[72%]">
          <div
            aria-hidden="true"
            className="absolute left-[14%] top-[22%] aspect-square w-[64%] rounded-full bg-[#7d9757]"
          />
          <div
            aria-hidden="true"
            className="absolute right-[12%] top-[10%] size-[14%] rounded-full bg-white"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[16%] left-[16%] size-[18%] rounded-full bg-white"
          />
          <p className="absolute left-[9%] top-[8%] text-[clamp(0.4rem,0.8vw,0.65rem)] font-bold leading-snug tracking-[0.2em] text-[#46542f] uppercase">
            Book ·
            <br />
            Cover
            <br />
            Mockup
          </p>
        </div>
      </div>
    </div>
  );
}

export function BookGallery() {
  return (
    <section
      aria-labelledby="book-gallery-heading"
      className="bg-white py-14 lg:py-18"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-10">
        <h2 id="book-gallery-heading" className="sr-only">
          Book cover collection
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[47fr_53fr] lg:gap-4">
          <CookbookTile />

          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-1 lg:gap-4">
            <YellowBookTile />
            <PinkStackTile />
            <div className="sm:col-span-2">
              <GreenBooksTile />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

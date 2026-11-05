import { HeroSlider } from "@/components/hero-slider";
import { HomeCategories } from "@/components/home-categories";
import { BookGallery } from "@/components/book-gallery";
import { CategoryBooks } from "@/components/category-books";
import { TrendingBooks } from "@/components/trending-books";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <HomeCategories />
      <CategoryBooks category="Science" />
      <CategoryBooks category="History" />
      <TrendingBooks />
      <BookGallery />
    </>
  );
}

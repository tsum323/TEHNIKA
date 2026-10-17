import { Advantages } from "@/components/sections/Advantages";
import { Categories } from "@/components/sections/Categories";
import { ContactCta } from "@/components/sections/ContactCta";
import { Faq } from "@/components/sections/Faq";
import { Geography } from "@/components/sections/Geography";
import { Hero } from "@/components/sections/Hero";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { PopularEquipment } from "@/components/sections/PopularEquipment";

/** Главная страница. Порядок секций меняется здесь. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <PopularEquipment />
      <HowWeWork />
      <Advantages />
      <Geography />
      <Faq />
      <ContactCta />
    </>
  );
}

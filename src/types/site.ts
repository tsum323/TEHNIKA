/** Ссылка навигации. href — якорь на главной ("/#contacts") или путь страницы ("/"). */
export interface NavLink {
  label: string;
  href: string;
}

export interface Contacts {
  /** Телефон в удобном для чтения виде: +7 (000) 000-00-00 */
  phone: string;
  /** Телефон для ссылки tel: — только цифры и знак +. */
  phoneHref: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface Advantage {
  title: string;
  text: string;
}

export interface WorkStep {
  title: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  region: string;
  contacts: Contacts;
  cities: string[];
  advantages: Advantage[];
  workSteps: WorkStep[];
  faq: FaqItem[];
  navigation: NavLink[];
}

/** Заголовок секции: надпись над заголовком, заголовок и описание. */
export interface SectionText {
  eyebrow: string;
  title: string;
  description: string;
}

/** Тексты главной страницы. */
export interface HomeContent {
  hero: {
    /** Заголовок делится на две части: вторая выделяется жёлтым. */
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    imageAlt: string;
  };
  categories: SectionText;
  popular: SectionText & { demoNote: string };
  howWeWork: SectionText;
  advantages: Omit<SectionText, "description">;
  geography: Omit<SectionText, "title"> & { listTitle: string; button: string };
  faq: SectionText;
  contacts: SectionText;
}

/** Тексты страниц каталога. */
export interface CatalogContent {
  index: SectionText;
  category: {
    modelsTitle: string;
    modelsNote: string;
    compareTitle: string;
    applicationsTitle: string;
    checklistTitle: string;
    checklistNote: string;
    otherTitle: string;
  };
  allCatalogButton: string;
}

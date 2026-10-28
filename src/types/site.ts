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
  /** Подпись кнопки «Наверх» (видна скринридерам и во всплывающей подсказке). */
  backToTop: string;
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
/** Тексты строки поиска по каталогу. */
export interface CatalogSearchText {
  label: string;
  placeholder: string;
  clearButton: string;
  categoryLabel: string;
  examplesLabel: string;
  /** Быстрые запросы под полем. */
  examples: string[];
  emptyTitle: string;
  emptyText: string;
  emptyLink: string;
}

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
  search: CatalogSearchText;
  equipment: {
    eyebrow: string;
    detailsButton: string;
    requestButton: string;
    callButton: string;
    priceNote: string;
    specsTitle: string;
    termsTitle: string;
    /** Общие условия аренды — показываются на странице каждой машины. */
    terms: string[];
    otherModelsTitle: string;
    backToCategory: string;
  };
}

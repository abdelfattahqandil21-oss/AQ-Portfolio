import { Service, signal, effect } from '@angular/core';

export type SupportedLang = 'ar' | 'en' | 'fr' | 'it';

const STORAGE_KEY = 'app_lang';
const SUPPORTED_LANGS: readonly SupportedLang[] = ['ar', 'en', 'fr', 'it'];
const RTL_LANGS: readonly SupportedLang[] = ['ar'];

@Service()
export class TranslationService {
  private readonly _currentLang = signal<SupportedLang>(this.readInitialLang());

  readonly currentLang = this._currentLang.asReadonly();

  constructor() {
    effect(() => {
      const lang = this._currentLang();
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    });
  }

  translate(ar: string, en: string, fr: string, it: string): string {
    switch (this._currentLang()) {
      case 'ar': return ar;
      case 'fr': return fr;
      case 'it': return it;
      case 'en':
      default: return en;
    }
  }

  setLang(lang: SupportedLang): void {
    if (!SUPPORTED_LANGS.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }
    this._currentLang.set(lang);
  }

  toggleLang(): void {
    const langs = SUPPORTED_LANGS;
    const idx = langs.indexOf(this._currentLang());
    this._currentLang.set(langs[(idx + 1) % langs.length]);
  }

  getSupportedLangs(): readonly SupportedLang[] {
    return SUPPORTED_LANGS;
  }

  private readInitialLang(): SupportedLang {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

    const browserLang = navigator.language.slice(0, 2) as SupportedLang;
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    return 'en';
  }
}

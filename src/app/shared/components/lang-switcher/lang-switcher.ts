import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../../core/services/translation/translation';
import { ViewTransitionService } from '../../../core/services/view-transition/view-transition';

@Component({
  selector: 'lang-switcher',
  template: `
    <div class="relative inline-block">
      <button
        class="flex items-center gap-2 px-4 py-2 bg-surface-100 border border-surface-400/40 rounded-lg text-sm text-metal-800 cursor-pointer
               transition-all duration-300 hover:bg-surface-200 hover:border-surface-500/60 hover:shadow-[0_0_14px_-4px_var(--color-surface-500)]
               focus:border-surface-500 focus:shadow-[0_0_18px_-3px_var(--color-surface-500)] focus:outline-none"
        [class.border-surface-500/60]="open()"
        [class.shadow-[0_0_14px_-4px_var(--color-surface-500)]]="open()"
        (click)="toggleOpen($event)"
      >
        <span class="text-metal-800">{{ labels[translation.currentLang()] }}</span>
        <i class="pi pi-chevron-down text-metal-600 text-xs transition-transform duration-300" [class.-rotate-180]="open()"></i>
      </button>

      @if (open()) {
        <ul
          animate.enter="dd-enter" animate.leave="dd-leave"
          class="absolute top-full mt-1.5 inset-e-0 w-full list-none p-1.5
                 bg-surface-100 border border-surface-400/30 rounded-xl
                 shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_20px_-8px_var(--color-surface-500)]
                 flex flex-col gap-px z-200"
        >
          @for (lang of langs; track lang) {
            <li
              class="flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer text-[13px] font-medium
                     transition-all duration-200"
              [class.bg-surface-300]="lang === translation.currentLang()"
              [class.text-white]="lang === translation.currentLang()"
              [class.text-metal-700]="lang !== translation.currentLang()"
              [class.hover:bg-surface-200]="lang !== translation.currentLang()"
              [class.hover:text-metal-600]="lang !== translation.currentLang()"
              (click)="selectLang(lang, $event)"
            >
              {{ labels[lang] }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    @keyframes dd-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dd-out {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(-4px); }
    }
    .dd-enter { animation: dd-in 200ms cubic-bezier(.35,0,.25,1); }
    .dd-leave { animation: dd-out 150ms cubic-bezier(.35,0,.25,1); }

    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 8px -4px var(--color-surface-500); }
      50%      { box-shadow: 0 0 16px -2px var(--color-surface-500); }
    }
    button:not(:hover):not(:focus) {
      animation: glow-pulse 3s ease-in-out infinite;
    }
    button:hover, button:focus {
      animation: none;
    }
  `,
  host: {
    '(document:click)': 'onDocumentClick()',
  },
})
export class LangSwitcher {
  readonly translation = inject(TranslationService);
  private readonly viewTransition = inject(ViewTransitionService);

  readonly langs = this.translation.getSupportedLangs();
  readonly labels: Record<string, string> = { ar: 'العربية', en: 'English', fr: 'Français', it: 'Italiano' };
  readonly open = signal(false);

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    this.open.update(v => !v);
  }

  selectLang(lang: string, event: MouseEvent): void {
    event.stopPropagation();
    this.open.set(false);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.viewTransition.start(() => this.translation.setLang(lang as any), rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  onDocumentClick(): void {
    this.open.set(false);
  }
}

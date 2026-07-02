import { Component, inject, signal, computed } from '@angular/core';
import { TranslationService } from '../../../core/services/translation/translation';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { LangSwitcher } from '../lang-switcher/lang-switcher';

interface NavItem {
  label: { ar: string; en: string; fr: string; it: string };
  href: string;
}

@Component({
  selector: 'site-header',
  imports: [LangSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    class: 'block',
  },
})
export class Header {
  readonly translation = inject(TranslationService);
  private readonly scroll = inject(ScrollService);

  readonly mobileOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', it: 'Home' }, href: '#home' },
    { label: { ar: 'عني', en: 'About', fr: 'À propos', it: 'Chi sono' }, href: '#about' },
    { label: { ar: 'المهارات', en: 'Skills', fr: 'Compétences', it: 'Competenze' }, href: '#skills' },
    { label: { ar: 'المشاريع', en: 'Projects', fr: 'Projets', it: 'Progetti' }, href: '#projects' },
    { label: { ar: 'اتصل بي', en: 'Contact', fr: 'Contact', it: 'Contatto' }, href: '#contact' },
  ];

  readonly activeSection = computed(() => {
    const sy = this.scroll.scrollY();
    const aboutStartPx = (385 * window.innerHeight) / 100;
    const skillsStartPx = (510 * window.innerHeight) / 100;
    const projectsStartPx = (1320 * window.innerHeight) / 100;
    const contactStartPx = (1950 * window.innerHeight) / 100;
    if (sy < aboutStartPx) return 'home';
    if (sy < skillsStartPx) return 'about';
    if (sy < projectsStartPx) return 'skills';
    if (sy < contactStartPx) return 'projects';
    return 'contact';
  });

  private readonly SCROLL_TARGETS: Record<string, number> = {
    about: 385,
    skills: 510,
    projects: 1350,
    contact: 1950,
  };

  navigate(href: string): void {
    this.mobileOpen.set(false);
    const id = href.slice(1);
    const targetVh = this.SCROLL_TARGETS[id];
    if (targetVh !== undefined) {
      window.scrollTo({ top: (targetVh * window.innerHeight) / 100, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}

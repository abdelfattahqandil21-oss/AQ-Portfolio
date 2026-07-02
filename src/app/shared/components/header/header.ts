import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../../core/services/translation/translation';
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

  readonly activeSection = signal('');

  readonly mobileOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', it: 'Home' }, href: '#home' },
    { label: { ar: 'عني', en: 'About', fr: 'À propos', it: 'Chi sono' }, href: '#about' },
    { label: { ar: 'المهارات', en: 'Skills', fr: 'Compétences', it: 'Competenze' }, href: '#skills' },
    { label: { ar: 'المشاريع', en: 'Projects', fr: 'Projets', it: 'Progetti' }, href: '#projects' },
    { label: { ar: 'اتصل بي', en: 'Contact', fr: 'Contact', it: 'Contatto' }, href: '#contact' },
  ];
}

import { Component, computed, inject } from '@angular/core';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';

interface Project {
  id: string;
  title: { ar: string; en: string; fr: string; it: string };
  desc: { ar: string; en: string; fr: string; it: string };
  tech: string[];
  url: string;
  img: string;
}

@Component({
  selector: 'projects-section',
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsSection {
  readonly scroll = inject(ScrollService);
  readonly translation = inject(TranslationService);

  private readonly skillsEndVh = 480 + 780;
  private readonly projectVh = 150;

  readonly projects: Project[] = [
    {
      id: 'abela',
      title: { ar: 'عميل مبيعات أبيلا', en: 'Abela Sales Agent', fr: 'Agent commercial Abela', it: 'Agente vendite Abela' },
      desc: { ar: 'بوابة الوكيل لإدارة مبيعات وتذاكر قطارات أبيلا', en: 'Agent portal for managing Abela train sales and tickets', fr: 'Portail agent pour gérer les ventes et billets de train Abela', it: 'Portale agente per gestire vendite e biglietti treni Abela' },
      tech: ['Angular', 'Tailwind', 'PrimeNG'],
      url: 'https://abelatrains.com:88/auth/login',
      img: '/imgs/abela-sales-agent.png',
    },
    {
      id: 'ferries',
      title: { ar: 'إدارة العبارات', en: 'Ferries Management', fr: 'Gestion des ferries', it: 'Gestione traghetti' },
      desc: { ar: 'نظام إدارة خطوط النقل البحري والنقل البرّي', en: 'Maritime and land transport management system', fr: 'Système de gestion des transports maritimes et terrestres', it: 'Sistema di gestione trasporti marittimi e terrestri' },
      tech: ['Angular', 'Tailwind', 'Syncfusion'],
      url: 'https://transcs.enr.gov.eg:444/#/auth/login',
      img: '/imgs/ferries.png',
    },
    {
      id: 'ltra-service',
      title: { ar: 'خدمات النقل البري', en: 'LTRA Services', fr: 'Services LTRA', it: 'Servizi LTRA' },
      desc: { ar: 'منصة خدمات الهيئة القومية لتنظيم النقل البري', en: 'Land Transport Regulatory Authority services platform', fr: 'Plateforme de services de l\'autorité de régulation des transports terrestres', it: 'Piattaforma servizi autorità regolamentazione trasporti terrestri' },
      tech: ['Angular', 'Tailwind', 'Syncfusion'],
      url: 'https://ltra.gov.eg/Services/#/auth/login',
      img: '/imgs/ltra-service.png',
    },
    {
      id: 'ltra-portal',
      title: { ar: 'البوابة الرئيسية للنقل البري', en: 'LTRA Main Portal', fr: 'Portail principal LTRA', it: 'Portale principale LTRA' },
      desc: { ar: 'البوابة الرئيسية للهيئة القومية لتنظيم النقل البري', en: 'Main portal of the Land Transport Regulatory Authority', fr: 'Portail principal de l\'autorité de régulation des transports terrestres', it: 'Portale principale dell\'autorità di regolamentazione dei trasporti terrestri' },
      tech: ['Angular', 'Bootstrap', 'Syncfusion'],
      url: 'https://ltra.gov.eg/#/main/home',
      img: '/imgs/ltra.png',
    },
  ];

  readonly totalProjectsVh = this.projects.length * this.projectVh;

  readonly projectsScrollY = computed(() => {
    const skillsEndPx = (this.skillsEndVh * window.innerHeight) / 100;
    return Math.max(0, this.scroll.scrollY() - skillsEndPx);
  });

  readonly activeIndex = computed(() => {
    const projectPx = (this.projectVh * window.innerHeight) / 100;
    return Math.min(this.projects.length - 1, Math.floor(this.projectsScrollY() / projectPx));
  });

  readonly projectProgress = computed(() => {
    const projectPx = (this.projectVh * window.innerHeight) / 100;
    const raw = this.projectsScrollY() / projectPx;
    return raw - Math.floor(raw);
  });

  private readonly entered = computed(() => this.projectsScrollY() > window.innerHeight * 0.08);

  private readonly pastEnd = computed(() => {
    const totalPx = (this.totalProjectsVh * window.innerHeight) / 100;
    return this.projectsScrollY() >= totalPx;
  });

  readonly isActive = computed(() => {
    const active = this.activeIndex();
    const p = this.projectProgress();
    if (this.pastEnd()) return this.projects.map(() => false);
    if (!this.entered()) return this.projects.map(() => false);
    return this.projects.map((_, i) => {
      if (i === active) return true;
      if (i === active + 1 && p > 0.5) return true;
      return false;
    });
  });

  private readonly transitionIn = (p: number) => {
    const t = Math.min(1, Math.max(0, p));
    return { opacity: t * (2 - t), scale: 0.85 + t * 0.15 };
  };

  private readonly transitionOut = (p: number) => {
    const t = Math.min(1, Math.max(0, p));
    return { opacity: 1 - t * t, scale: 1 - t * 0.12 };
  };

  readonly blockStates = computed(() => {
    const active = this.activeIndex();
    const p = this.projectProgress();
    const hidden = { opacity: 0, scale: 0.85 };
    if (this.pastEnd()) return this.projects.map(() => hidden);
    if (!this.entered()) return this.projects.map(() => hidden);
    return this.projects.map((_, i) => {
      if (i === active) {
        if (p > 0.52) {
          return this.transitionOut(Math.min(1, (p - 0.52) / 0.13));
        }
        return this.transitionIn(i === 0 ? Math.min(1, p / 0.08) : 1);
      }
      if (i === active + 1) {
        if (p > 0.82) {
          return this.transitionIn(Math.min(1, (p - 0.82) / 0.18));
        }
        return hidden;
      }
      return hidden;
    });
  });

  readonly sectionFade = computed(() => {
    const totalPx = (this.totalProjectsVh * window.innerHeight) / 100;
    const fadeStartPx = totalPx - window.innerHeight * 0.4;
    const range = window.innerHeight * 0.4;
    const raw = (this.projectsScrollY() - fadeStartPx) / range;
    return Math.max(0, Math.min(1, raw));
  });

  readonly sectionSinkY = computed(() => {
    const f = this.sectionFade();
    return f * f * 60;
  });
}

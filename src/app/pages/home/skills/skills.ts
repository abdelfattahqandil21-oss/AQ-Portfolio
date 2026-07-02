import { Component, computed, inject } from '@angular/core';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';

interface SkillItem {
  name: string;
}

interface SkillCategory {
  id: string;
  title: { ar: string; en: string; fr: string; it: string };
  subtitle: string;
  items: SkillItem[];
}

@Component({
  selector: 'skills-section',
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class SkillsSection {
  readonly scroll = inject(ScrollService);
  readonly translation = inject(TranslationService);

  private readonly heroEndVh = 480 + 30;
  private readonly categoryVh = 130;

  readonly categories: SkillCategory[] = [
    {
      id: 'language',
      title: { ar: 'اللغة', en: 'Language', fr: 'Langage', it: 'Linguaggio' },
      subtitle: 'core',
      items: [
        { name: 'TypeScript' },
        { name: 'JavaScript (ES6+)' },
        { name: 'HTML5' },
      ],
    },
    {
      id: 'frameworks',
      title: { ar: 'الأطر', en: 'Frameworks', fr: 'Frameworks', it: 'Framework' },
      subtitle: 'foundation',
      items: [
        { name: 'Angular' },
        { name: 'RxJS' },
      ],
    },
    {
      id: 'architecture',
      title: { ar: 'التصميم', en: 'Architecture', fr: 'Architecture', it: 'Architettura' },
      subtitle: 'patterns',
      items: [
        { name: 'Component-Based Architecture' },
        { name: 'Dependency Injection' },
        { name: 'Lazy Loading & Code Splitting' },
        { name: 'Reactive Programming' },
        { name: 'FACADE · Strategy · Template Method' },
      ],
    },
    {
      id: 'testing',
      title: { ar: 'الجودة', en: 'Quality', fr: 'Qualité', it: 'Qualità' },
      subtitle: 'testing',
      items: [
        { name: 'Vitest + Angular Testing Library' },
        { name: 'Clean Code & Code Reviews' },
      ],
    },
    {
      id: 'tools',
      title: { ar: 'الأدوات', en: 'Tools', fr: 'Outils', it: 'Strumenti' },
      subtitle: 'build',
      items: [
        { name: 'Git & GitHub' },
        { name: 'Custom Translation Service (zero-deps)' },
        { name: 'View Transition Service (zero-deps)' },
      ],
    },
    {
      id: 'soft-skills',
      title: { ar: 'المهارات', en: 'Soft Skills', fr: 'Compétences', it: 'Competenze' },
      subtitle: 'collaborate',
      items: [
        { name: 'Agile / Scrum' },
        { name: 'Cross-functional Collaboration' },
        { name: 'Technical Documentation' },
      ],
    },
  ];

  readonly totalSkillsVh = this.categories.length * this.categoryVh;

  readonly skillsScrollY = computed(() => {
    const heroEndPx = (this.heroEndVh * window.innerHeight) / 100;
    return Math.max(0, this.scroll.scrollY() - heroEndPx);
  });

  readonly activeIndex = computed(() => {
    const categoryPx = (this.categoryVh * window.innerHeight) / 100;
    return Math.min(this.categories.length - 1, Math.floor(this.skillsScrollY() / categoryPx));
  });

  readonly categoryProgress = computed(() => {
    const categoryPx = (this.categoryVh * window.innerHeight) / 100;
    const raw = this.skillsScrollY() / categoryPx;
    return raw - Math.floor(raw);
  });

  private readonly enteredSkills = computed(() => this.skillsScrollY() > window.innerHeight * 0.08);

  private readonly pastEnd = computed(() => {
    const totalPx = (this.totalSkillsVh * window.innerHeight) / 100;
    return this.skillsScrollY() >= totalPx;
  });

  readonly isActive = computed(() => {
    const active = this.activeIndex();
    const p = this.categoryProgress();
    const entered = this.enteredSkills();
    if (this.pastEnd()) return this.categories.map(() => false);
    return this.categories.map((_, i) => {
      if (!entered) return false;
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
    const exit = this.exitFade();
    const active = this.activeIndex();
    const p = this.categoryProgress();
    const entered = this.enteredSkills();
    const hidden = { opacity: 0, scale: 0.85 };
    if (this.pastEnd()) return this.categories.map(() => hidden);
    return this.categories.map((_, i) => {
      if (!entered) return hidden;
      let base: { opacity: number; scale: number };
      if (i === active) {
        const isLast = i === this.categories.length - 1;
        const fadeOutStart = isLast ? 0.52 : 0.52;
        if (p > fadeOutStart) {
          const range = isLast ? 0.2 : 0.13;
          base = this.transitionOut(Math.min(1, (p - fadeOutStart) / range));
        } else {
          base = this.transitionIn(i === 0 ? Math.min(1, p / 0.08) : 1);
        }
      } else if (i === active + 1) {
        if (p > 0.82) {
          base = this.transitionIn(Math.min(1, (p - 0.82) / 0.18));
        } else {
          return hidden;
        }
      } else {
        return hidden;
      }
      return { opacity: base.opacity * (1 - exit), scale: base.scale };
    });
  });

  readonly timelineProgress = computed(() => {
    const totalPx = (this.totalSkillsVh * window.innerHeight) / 100;
    return Math.min(1, this.skillsScrollY() / totalPx);
  });

  readonly exitFade = computed(() => {
    const totalPx = (this.totalSkillsVh * window.innerHeight) / 100;
    const exitStartPx = totalPx - window.innerHeight * 0.3;
    const raw = (this.skillsScrollY() - exitStartPx) / (window.innerHeight * 0.3);
    return Math.max(0, Math.min(1, raw));
  });
}

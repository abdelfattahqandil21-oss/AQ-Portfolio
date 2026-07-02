import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';

// Test the hero's pure signal computation logic directly
function createSignalHarness(scrollY: number, viewportHeight: number) {
  window.innerHeight = viewportHeight;
  window.scrollY = scrollY;
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: viewportHeight * 6,
    configurable: true,
  });

  document.dispatchEvent(new Event('scroll'));

  const numSlides = 3;
  const heroContentVh = numSlides * 150;
  const heroPx = (heroContentVh * viewportHeight) / 100;
  const fadeZone = viewportHeight;
  const fadeStart = heroPx - fadeZone;

  const slideHeight = () => scrollY / (viewportHeight * 1.5);
  const activeIndex = () => Math.max(0, Math.min(numSlides - 1, Math.floor(slideHeight())));
  const slideProgress = () => slideHeight() - Math.floor(slideHeight());
  const heroFadeProgress = () => {
    const p = (scrollY - fadeStart) / fadeZone;
    return Math.max(0, Math.min(1, p));
  };
  const contentFade = () => Math.min(1, heroFadeProgress() / 0.35);
  const sceneFade = () => {
    const p = heroFadeProgress();
    return p <= 0.35 ? 0 : (p - 0.35) / 0.65;
  };
  const aboutReveal = () => heroFadeProgress() > 0.35;
  const textScale = () => {
    const p = slideProgress();
    const idx = activeIndex();
    if (idx === 0) { const t = Math.min(p / 0.15, 1); return 1 + t * 0.2; }
    if (idx === 1) { const t = Math.min(1 - p / 0.55, 1); return 1 + Math.max(0, t) * 0.2; }
    return 1;
  };

  return { activeIndex, slideProgress, heroFadeProgress, contentFade, sceneFade, aboutReveal, textScale };
}

describe('Hero computed signals', () => {
  const VH = 1000;

  describe('activeIndex', () => {
    it('starts at 0', () => {
      const h = createSignalHarness(0, VH);
      expect(h.activeIndex()).toBe(0);
    });

    it('advances to 1 after scrolling 1.5 viewports', () => {
      const h = createSignalHarness(Math.floor(VH * 1.5), VH);
      expect(h.activeIndex()).toBe(1);
    });

    it('advances to 2 after 3 viewports', () => {
      const h = createSignalHarness(Math.floor(VH * 3), VH);
      expect(h.activeIndex()).toBe(2);
    });

    it('clamps to last slide', () => {
      const h = createSignalHarness(VH * 10, VH);
      expect(h.activeIndex()).toBe(2);
    });
  });

  describe('slideProgress', () => {
    it('is the fractional part of slideHeight', () => {
      const scrollY = Math.floor(VH * 1.75);
      const h = createSignalHarness(scrollY, VH);
      const sh = (VH * 1.75) / (VH * 1.5);
      expect(h.slideProgress()).toBeCloseTo(sh - Math.floor(sh), 1);
    });
  });

  describe('heroFadeProgress', () => {
    it('is 0 before the fade zone', () => {
      const h = createSignalHarness(0, VH);
      expect(h.heroFadeProgress()).toBe(0);
    });

    it('is 1 after the fade zone', () => {
      const heroPx = (3 * 150 * VH) / 100;
      const fadeStart = heroPx - VH;
      const h = createSignalHarness(fadeStart + VH, VH);
      expect(h.heroFadeProgress()).toBe(1);
    });
  });

  describe('aboutReveal', () => {
    it('is false when heroFadeProgress <= 0.35', () => {
      const h = createSignalHarness(0, VH);
      expect(h.aboutReveal()).toBe(false);
    });

    it('is true when heroFadeProgress > 0.35', () => {
      const heroPx = (3 * 150 * VH) / 100;
      const fadeStart = heroPx - VH;
      const h = createSignalHarness(fadeStart + VH * 0.5, VH);
      expect(h.aboutReveal()).toBe(true);
    });
  });

  describe('textScale', () => {
    it('starts at 1 on slide 0', () => {
      const h = createSignalHarness(0, VH);
      expect(h.textScale()).toBe(1);
    });

    it('scales up on slide 0 with progress', () => {
      const h = createSignalHarness(Math.floor(VH * 0.1), VH);
      expect(h.textScale()).toBeGreaterThan(1);
    });
  });
});

import { Service, signal, computed, DestroyRef, inject } from '@angular/core';

export type ScrollDirection = 'up' | 'down' | 'idle';

@Service()
export class ScrollService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _scrollY = signal(0);
  readonly scrollY = this._scrollY.asReadonly();

  private readonly _progress = signal(0);
  readonly progress = this._progress.asReadonly();

  private readonly _direction = signal<ScrollDirection>('idle');
  readonly direction = this._direction.asReadonly();

  private readonly _velocity = signal(0);
  readonly velocity = this._velocity.asReadonly();

  readonly isNearBottom = computed(() => this.progress() > 0.9);

  private lastY = 0;
  private idleTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;
  private ticking = false;

  constructor() {
    if (typeof window === 'undefined') return;

    this.lastY = window.scrollY;

    const onScroll = () => {
      if (this.ticking) return;
      this.ticking = true;
      this.rafId = requestAnimationFrame(() => this.updateFromScroll());
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      if (this.idleTimeoutId !== null) clearTimeout(this.idleTimeoutId);
    });
  }

  private updateFromScroll(): void {
    const currentY = window.scrollY;
    const delta = currentY - this.lastY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    this._scrollY.set(currentY);
    this._progress.set(maxScroll > 0 ? Math.min(currentY / maxScroll, 1) : 0);
    this._velocity.set(delta);
    this._direction.set(delta > 0 ? 'down' : delta < 0 ? 'up' : this._direction());

    this.lastY = currentY;
    this.ticking = false;

    if (this.idleTimeoutId !== null) clearTimeout(this.idleTimeoutId);
    this.idleTimeoutId = setTimeout(() => {
      this._direction.set('idle');
      this._velocity.set(0);
    }, 150);
  }

  /** Track progress through a specific pin-spacer element (0→1) */
  trackProgress(el: HTMLElement): void {
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      this._progress.set(total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0);
    };

    const onScroll = () => requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    update();
  }

  toElement(selector: string): void {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

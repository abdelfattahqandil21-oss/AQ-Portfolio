import { ApplicationRef, Service, inject, signal } from '@angular/core';

@Service()
export class ViewTransitionService {
  private readonly appRef = inject(ApplicationRef);
  private readonly _isTransitioning = signal(false);
  readonly isTransitioning = this._isTransitioning.asReadonly();

  private transitionId = 0;

  start(callback: () => void, x?: number, y?: number): void {
    if (!document.startViewTransition) {
      callback();
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      callback();
      return;
    }

    const id = ++this.transitionId;
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const radius = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    const root = document.documentElement;
    root.style.setProperty('--x', `${cx}px`);
    root.style.setProperty('--y', `${cy}px`);
    root.style.setProperty('--radius', `${radius}px`);

    this._isTransitioning.set(true);

    const transition = document.startViewTransition(() => {
      callback();
      this.appRef.tick();
    });

    transition.finished.finally(() => {
      this._isTransitioning.set(false);
      if (id === this.transitionId) {
        root.style.removeProperty('--x');
        root.style.removeProperty('--y');
        root.style.removeProperty('--radius');
      }
    });
  }
}

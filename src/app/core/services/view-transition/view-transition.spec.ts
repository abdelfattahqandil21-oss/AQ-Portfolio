import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { ViewTransitionService } from './view-transition';

describe('ViewTransitionService', () => {
  let service: ViewTransitionService;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any;
    vi.spyOn(ApplicationRef.prototype as any, 'tick').mockImplementation(() => {});
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewTransitionService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isTransitioning starts as false', () => {
    expect(service.isTransitioning()).toBe(false);
  });

  it('calls callback directly when startViewTransition is not supported', () => {
    const orig = document.startViewTransition;
    (document as any).startViewTransition = undefined;

    const cb = vi.fn();
    service.start(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(service.isTransitioning()).toBe(false);

    (document as any).startViewTransition = orig;
  });

  it('calls callback directly when prefers-reduced-motion is set', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as any;
    const cb = vi.fn();
    service.start(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('uses document.startViewTransition when supported and no reduced motion', async () => {
    const fakeFinished = Promise.resolve();
    const startVT = vi.fn().mockReturnValue({ finished: fakeFinished });
    document.startViewTransition = startVT as any;

    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    const cb = vi.fn();
    service.start(cb, 100, 200);

    expect(service.isTransitioning()).toBe(true);
    expect(startVT).toHaveBeenCalledTimes(1);
    expect(cb).not.toHaveBeenCalled();

    const transitionFn = startVT.mock.calls[0][0];
    transitionFn();
    expect(cb).toHaveBeenCalledTimes(1);

    await fakeFinished;
    expect(service.isTransitioning()).toBe(false);
  });

  it('sets and removes CSS custom properties on root', async () => {
    const fakeFinished = Promise.resolve();
    document.startViewTransition = vi.fn().mockReturnValue({ finished: fakeFinished }) as any;
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    const root = document.documentElement;
    const setProp = vi.spyOn(root.style, 'setProperty');
    const removeProp = vi.spyOn(root.style, 'removeProperty');

    service.start(() => {}, 200, 300);
    expect(setProp).toHaveBeenCalledWith('--x', '200px');
    expect(setProp).toHaveBeenCalledWith('--y', '300px');
    expect(setProp).toHaveBeenCalledWith('--radius', expect.any(String));

    await fakeFinished;
    expect(removeProp).toHaveBeenCalledWith('--x');
    expect(removeProp).toHaveBeenCalledWith('--y');
    expect(removeProp).toHaveBeenCalledWith('--radius');
  });

  it('defaults x,y to viewport center', () => {
    document.startViewTransition = vi.fn().mockReturnValue({ finished: Promise.resolve() }) as any;
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);

    const setProp = vi.spyOn(document.documentElement.style, 'setProperty');
    service.start(() => {});

    expect(setProp).toHaveBeenCalledWith('--x', `${window.innerWidth / 2}px`);
    expect(setProp).toHaveBeenCalledWith('--y', `${window.innerHeight / 2}px`);
  });

  it('ignores stale transition cleanup if a new transition started', async () => {
    let finish1!: (v: void) => void;
    const p1 = new Promise<void>((r) => { finish1 = r; });
    const p2 = Promise.resolve();

    document.startViewTransition = vi.fn()
      .mockReturnValueOnce({ finished: p1 })
      .mockReturnValueOnce({ finished: p2 }) as any;

    const removeProp = vi.spyOn(document.documentElement.style, 'removeProperty');

    service.start(() => {});
    service.start(() => {});

    await p2;
    // active transition (2nd) cleans up
    expect(removeProp).toHaveBeenCalledTimes(3);

    finish1!();
    await p1;
    // stale transition (1st) does NOT clean up — id mismatch
    expect(removeProp).toHaveBeenCalledTimes(3);
  });

  it('isTransitioning stays false when startViewTransition is missing', () => {
    const orig = document.startViewTransition;
    (document as any).startViewTransition = undefined;

    service.start(() => {});
    expect(service.isTransitioning()).toBe(false);

    (document as any).startViewTransition = orig;
  });
});

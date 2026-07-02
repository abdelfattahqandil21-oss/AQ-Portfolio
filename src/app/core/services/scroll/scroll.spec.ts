import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll';

describe('ScrollService', () => {
  let service: ScrollService;

  const setScrollY = (y: number) => {
    window.scrollY = y;
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: window.innerHeight * 2,
      configurable: true,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    window.scrollY = 0;
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: window.innerHeight * 2,
      configurable: true,
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with scrollY=0, progress=0, direction=idle, velocity=0', () => {
    expect(service.scrollY()).toBe(0);
    expect(service.progress()).toBe(0);
    expect(service.direction()).toBe('idle');
    expect(service.velocity()).toBe(0);
  });

  it('isNearBottom is false initially', () => {
    expect(service.isNearBottom()).toBe(false);
  });

  it('isNearBottom is true when progress > 0.9', () => {
    setScrollY(Math.floor(window.innerHeight * 1.8));
    window.dispatchEvent(new Event('scroll'));
    expect(service.isNearBottom()).toBe(true);
  });

  it('updates signals on scroll event', () => {
    setScrollY(500);
    window.dispatchEvent(new Event('scroll'));
    expect(service.scrollY()).toBe(500);
    expect(service.progress()).toBeCloseTo(500 / window.innerHeight, 2);
    expect(service.direction()).toBe('down');
  });

  it('detects scroll direction correctly', () => {
    setScrollY(200);
    window.dispatchEvent(new Event('scroll'));
    expect(service.direction()).toBe('down');

    setScrollY(100);
    window.dispatchEvent(new Event('scroll'));
    expect(service.direction()).toBe('up');
  });

  it('sets direction to idle after 150ms of no scroll', () => {
    setScrollY(200);
    window.dispatchEvent(new Event('scroll'));
    expect(service.direction()).toBe('down');

    vi.advanceTimersByTime(200);
    expect(service.direction()).toBe('idle');
    expect(service.velocity()).toBe(0);
  });

  it('cleans up event listeners on destroy', () => {
    vi.useRealTimers();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollService);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.any(Object));
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), expect.any(Object));

    TestBed.resetTestingModule();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('trackProgress updates progress based on element position', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ top: -200, height: window.innerHeight * 2, bottom: 0, left: 0, right: 0, width: 0 }),
    });
    el.style.height = `${window.innerHeight * 2}px`;

    service.trackProgress(el);
    expect(service.progress()).toBeCloseTo(200 / (window.innerHeight * 2 - window.innerHeight), 2);
  });

  it('toElement calls scrollIntoView on matching element', () => {
    Element.prototype.scrollIntoView = vi.fn();
    const el = document.createElement('div');
    el.id = 'test-target';
    document.body.appendChild(el);
    const spy = vi.spyOn(el, 'scrollIntoView');

    service.toElement('#test-target');
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(el);
  });

  it('toElement does nothing when selector does not match', () => {
    expect(() => service.toElement('#non-existent')).not.toThrow();
  });

  it('progress is 1 when scrolled past max', () => {
    setScrollY(window.innerHeight * 10);
    window.dispatchEvent(new Event('scroll'));
    expect(service.progress()).toBe(1);
  });
});

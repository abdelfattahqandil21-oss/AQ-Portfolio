import { TestBed } from '@angular/core/testing';
import { ThreeSceneService } from './three-scene';
import { ScrollService } from '../scroll/scroll';

vi.mock('three', () => {
  const mockObj = (impl: Record<string, unknown>) => function () { return impl; };
  return {
    WebGLRenderer: vi.fn(mockObj({ setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() })),
    Scene: vi.fn(mockObj({ add: vi.fn(), traverse: vi.fn() })),
    PerspectiveCamera: vi.fn(mockObj({ position: { x: 0, y: 0, z: 5 }, rotation: { x: 0, y: 0, z: 0 }, aspect: 1, updateProjectionMatrix: vi.fn() })),
    EdgesGeometry: vi.fn(),
    BoxGeometry: vi.fn(),
    LineBasicMaterial: vi.fn(mockObj({ dispose: vi.fn() })),
    LineSegments: vi.fn(mockObj({ scale: { x: 1, y: 1, z: 1, set: vi.fn() }, geometry: { dispose: vi.fn() }, material: { dispose: vi.fn() } })),
    TorusKnotGeometry: vi.fn(),
    MeshNormalMaterial: vi.fn(mockObj({ dispose: vi.fn() })),
    Mesh: vi.fn(mockObj({ scale: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, geometry: { dispose: vi.fn() }, material: { dispose: vi.fn() } })),
    Color: vi.fn(),
    AdditiveBlending: 1,
    BufferGeometry: vi.fn(mockObj({ setAttribute: vi.fn(), attributes: {} })),
    BufferAttribute: vi.fn(),
    PointsMaterial: vi.fn(mockObj({ dispose: vi.fn() })),
    Points: vi.fn(mockObj({ geometry: { attributes: {}, dispose: vi.fn() } })),
    MathUtils: { lerp: vi.fn((a: number, b: number, t: number) => a + (b - a) * t) },
  };
});

describe('ThreeSceneService', () => {
  let service: ThreeSceneService;
  let scroll: ScrollService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [ThreeSceneService, ScrollService],
    });
    scroll = TestBed.inject(ScrollService);
    service = TestBed.inject(ThreeSceneService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('isReady starts as false', () => {
    expect(service.isReady()).toBe(false);
  });

  it('init sets up scene and starts render loop', () => {
    const canvas = document.createElement('canvas');
    service.init(canvas);
    expect(service.isReady()).toBe(true);
  });

  it('init attaches resize listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const canvas = document.createElement('canvas');
    service.init(canvas);
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function), expect.any(Object));
  });

  it('dispose cleans up render loop and traverses scene', () => {
    const canvas = document.createElement('canvas');
    service.init(canvas);
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    (service as any).dispose();
    expect(cancelSpy).toHaveBeenCalled();
  });
});

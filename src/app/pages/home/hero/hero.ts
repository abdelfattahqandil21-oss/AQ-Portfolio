import { Component, viewChild, ElementRef, afterNextRender, inject, DestroyRef, computed, NgZone } from '@angular/core';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';
import { AboutSection } from '../about/about';



@Component({
  selector: 'hero-section',
  imports: [AboutSection],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private readonly scroll = inject(ScrollService);
  private readonly ngZone = inject(NgZone);
  readonly translation = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private renderer!: import('three').WebGLRenderer;
  private scene!: import('three').Scene;
  private camera!: import('three').PerspectiveCamera;
  private group!: import('three').Group;
  private edges!: import('three').LineSegments;
  private edgesMaterial!: import('three').LineBasicMaterial;
  private particleLayers: {
    points: import('three').Points;
    material: import('three').PointsMaterial;
    seed: Float32Array;
    parallax: number;
  }[] = [];
  private rafId: number | null = null;

  private mouseX = 0;
  private mouseY = 0;
  private paraX = 0;
  private paraY = 0;

  readonly slides: Slide[] = [
    {
      id: 'welcome',
      content: {
        ar: ['مرحباً', 'مهندس برمجيات متخصص في الأنظمة المؤسسية\nAngular · TypeScript · Tailwind CSS'],
        en: ['Welcome', 'Software engineer specializing in enterprise systems\nAngular · TypeScript · Tailwind CSS'],
        fr: ['Bienvenue', 'Ingénieur logiciel spécialisé dans les systèmes d\'entreprise\nAngular · TypeScript · Tailwind CSS'],
        it: ['Benvenuto', 'Ingegnere del software specializzato in sistemi enterprise\nAngular · TypeScript · Tailwind CSS'],
      },
    },
    {
      id: 'about',
      content: {
        ar: ['عبدالفتاح قنديل (بودي)', 'مهندس واجهات أول — بناء تطبيقات مؤسسية قابلة للتوسع\nبنية متينة · أداء عالٍ · أنظمة قوية'],
        en: ['Abdelfattah Qandil ', 'junior Frontend Engineer — building scalable enterprise applications\nRobust architecture · High performance · Reliable systems'],
        fr: ['Abdelfattah Qandil', 'Ingénieur frontend junior — création d\'applications d\'entreprise évolutives\nArchitecture robuste · Haute performance · Systèmes fiables'],
        it: ['Abdelfattah Qandil ', 'Ingegnere frontend junior — creazione di applicazioni enterprise scalabili\nArchitettura robusta · Alte prestazioni · Sistemi affidabili'],
      },
    },
    {
      id: 'craft',
      content: {
        ar: ['صناعة', 'هندسة نظيفة · أداء عالٍ · بنية متينة\nAngular · TypeScript · Tailwind CSS'],
        en: ['Craft', 'Clean architecture · High performance · Robust systems\nAngular · TypeScript · Tailwind CSS'],
        fr: ['Craft', 'Architecture propre · Haute performance · Systèmes robustes\nAngular · TypeScript · Tailwind CSS'],
        it: ['Craft', 'Architettura pulita · Alte prestazioni · Sistemi robusti\nAngular · TypeScript · Tailwind CSS'],
      },
    },
  ];

  readonly numSlides = this.slides.length;
  /** Hero content scroll space (slides only) */
  readonly heroContentVh = this.numSlides * 150;
  /** Extra scroll room so about section is fully visible at scroll end */
  readonly aboutExtraVh = 30;
  readonly spacerVh = this.heroContentVh + this.aboutExtraVh;

  readonly slideHeight = computed(() => {
    return this.scroll.scrollY() / (window.innerHeight * 1.5);
  });

  readonly activeIndex = computed(() => {
    const sh = this.slideHeight();
    return Math.max(0, Math.min(this.numSlides - 1, Math.floor(sh)));
  });

  readonly slideProgress = computed(() => {
    const sh = this.slideHeight();
    return sh - Math.floor(sh);
  });

  readonly textScale = computed(() => {
    const p = this.slideProgress();
    if (this.activeIndex() === 0) {
      const t = Math.min(p / 0.15, 1);
      return 1 + t * 0.2;
    }
    if (this.activeIndex() === 1) {
      const t = Math.min(1 - p / 0.55, 1);
      return 1 + Math.max(0, t) * 0.2;
    }
    return 1;
  });

  readonly letterSpacing = computed(() => {
    const p = this.slideProgress();
    if (this.activeIndex() === 0) {
      const t = Math.min(p / 0.15, 1);
      return `${0.15 + t * 0.15}em`;
    }
    if (this.activeIndex() === 1) {
      const t = Math.min(1 - p / 0.55, 1);
      return `${0.15 + Math.max(0, t) * 0.15}em`;
    }
    return '0.15em';
  });

  /** Normalized 0→1 over the last viewport of the hero content (before about section) */
  private readonly heroFadeProgress = computed(() => {
    const heroPx = (this.heroContentVh * window.innerHeight) / 100;
    const fadeZone = window.innerHeight;
    const fadeStart = heroPx - fadeZone;
    const p = (this.scroll.scrollY() - fadeStart) / fadeZone;
    return Math.max(0, Math.min(1, p));
  });

  readonly contentFade = computed(() => {
    const p = this.heroFadeProgress();
    return Math.min(1, p / 0.35);
  });

  readonly sceneFade = computed(() => {
    const p = this.heroFadeProgress();
    if (p <= 0.35) return 0;
    return (p - 0.35) / 0.65;
  });

  /** For the "dive" feel: slides sink downward + shrink vertically */
  readonly slideSinkY = computed(() => {
    const f = this.contentFade();
    return f * f * 80; // ease-out quadratic, max 80px
  });

  readonly slideSinkScale = computed(() => {
    const f = this.contentFade();
    return 1 - f * 0.08;
  });

  /** Dark overlay intensity — dims scene but lets code blocks show through */
  readonly darkOverlay = computed(() => {
    return this.sceneFade() * 0.3;
  });

  /** Code block visibility — stays visible while about fades in */
  readonly codeBlockOpacity = computed(() => {
    const p = this.heroFadeProgress();
    if (p <= 0.35) return 1;
    return 1 - (p - 0.35) * 0.5;
  });

  readonly heroActive = computed(() => this.contentFade() < 0.95);

  readonly aboutReveal = computed(() => {
    const fp = this.heroFadeProgress();
    if (fp <= 0.35) return false;
    const spacerEndPx = (this.spacerVh * window.innerHeight) / 100;
    const fadeOutAt = spacerEndPx - window.innerHeight * 0.3;
    if (this.scroll.scrollY() > fadeOutAt) return false;
    return true;
  });

  readonly slideStates = computed(() => {
    const idx = this.activeIndex();
    const p = this.slideProgress();
    const lastIdx = this.numSlides - 1;
    return this.slides.map((_, i) => {
      if (i === idx) {
        if (i === lastIdx) return { opacity: 1 };
        if (p < 0.15) return { opacity: 1 };
        if (p < 0.3) {
          const t = (p - 0.15) / 0.15;
          return { opacity: 1 - t * t };
        }
        return { opacity: 0 };
      }
      if (i === idx + 1) {
        if (p > 0.7) return { opacity: 1 };
        if (p > 0.55) {
          const t = (p - 0.55) / 0.15;
          return { opacity: t * (2 - t) };
        }
        return { opacity: 0 };
      }
      return { opacity: 0 };
    });
  });

  constructor() {
    afterNextRender(async () => {
      const THREE = await import('three');
      this.init(THREE);
    });
  }

  private async init(THREE: typeof import('three')): Promise<void> {
    const canvas = this.canvas().nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(window.innerWidth < 640 ? 60 : 50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 4.5;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.setupEdges(THREE);
    this.setupParticles(THREE);
    this.setupMouseTracking();

    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));

    this.ngZone.runOutsideAngular(() => this.startLoop(THREE));
    this.destroyRef.onDestroy(() => this.dispose());
  }

  private setupEdges(THREE: typeof import('three')): void {
    const isMobile = window.innerWidth < 640;
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(isMobile ? 1.4 : 2.3, isMobile ? 2.0 : 1.6, isMobile ? 1.4 : 2.3));
    this.edgesMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color('#b8c8d8'),
      transparent: true,
      opacity: 0.5,
    });
    this.edges = new THREE.LineSegments(edgeGeo, this.edgesMaterial);
    this.group.add(this.edges);
  }

  private setupParticles(THREE: typeof import('three')): void {
    const layers = [
      { count: 300, radius: 1.5, size: 0.04, parallax: 1.8, depth: 2 },
      { count: 500, radius: 3.0, size: 0.025, parallax: 1.0, depth: 4 },
      { count: 700, radius: 4.5, size: 0.015, parallax: 0.4, depth: 6 },
    ];
    for (const cfg of layers) {
      const positions = new Float32Array(cfg.count * 3);
      for (let i = 0; i < cfg.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * cfg.radius;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = (Math.random() - 0.5) * cfg.depth;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: new THREE.Color('#b8c8d8'),
        size: cfg.size,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const pts = new THREE.Points(geo, mat);
      this.group.add(pts);
      this.particleLayers.push({ points: pts, material: mat, seed: new Float32Array(positions), parallax: cfg.parallax });
    }
  }

  private setupMouseTracking(): void {
    const onMove = (e: MouseEvent) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('mousemove', onMove));
  }

  private startLoop(threeLib: typeof import('three')): void {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);

      const idx = this.activeIndex();
      const progress = this.slideProgress();
      const y = this.scroll.scrollY();
      const vel = this.scroll.velocity();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;
      const speed = 0.06;
      const lerp = threeLib.MathUtils.lerp;

      const totalAngle = (this.numSlides - 1) * Math.PI * 2;
      this.group.rotation.y = scrollProgress * totalAngle;

      let targetCamZ: number;
      let targetEdgeScale: number;
      let targetEdgeOpacity: number;
      let targetParticleOpacity: number;

      if (idx === 0) {
        targetCamZ = lerp(4.5, 0.5, progress);
        targetEdgeScale = lerp(1, 2.5, progress);
        targetEdgeOpacity = lerp(0.5, 0.8, progress);
        targetParticleOpacity = lerp(0, 0.1, progress);
      } else if (idx === 1) {
        targetCamZ = lerp(0.5, 1.8, progress);
        targetEdgeScale = lerp(2.5, 3.5, progress);
        targetEdgeOpacity = lerp(0.8, 0, progress);
        targetParticleOpacity = lerp(0.1, 0.6, progress);
      } else {
        targetCamZ = lerp(1.8, 2.5, progress);
        targetEdgeScale = 3.5;
        targetEdgeOpacity = 0;
        targetParticleOpacity = lerp(0.6, 0.1, progress);
      }

      this.camera.position.z += (targetCamZ - this.camera.position.z) * speed;

      const es = this.edges.scale.x + (targetEdgeScale - this.edges.scale.x) * speed;
      this.edges.scale.set(es, es, es);
      this.edgesMaterial.opacity += (targetEdgeOpacity - this.edgesMaterial.opacity) * speed;

      for (const layer of this.particleLayers) {
        layer.material.opacity += (targetParticleOpacity - layer.material.opacity) * speed * 0.8;
        layer.points.position.x = this.paraX * layer.parallax * 0.3;
        layer.points.position.y = this.paraY * layer.parallax * 0.3;
      }

      for (const layer of this.particleLayers) {
        const posAttr = layer.points.geometry.attributes['position'] as import('three').BufferAttribute;
        const pos = posAttr.array as Float32Array;
        const seed = layer.seed;
        for (let i = 0; i < pos.length; i += 3) {
          if (idx === 1) {
            pos[i + 2] = seed[i + 2] - progress * 3;
          } else if (idx === 0) {
            pos[i + 2] = seed[i + 2];
          }
        }
        posAttr.needsUpdate = true;
      }

      // Slow camera orbit
      const orbitAngle = performance.now() * 0.00015;
      this.camera.position.x += (Math.sin(orbitAngle) * 0.12 - this.camera.position.x) * 0.015;
      this.camera.position.y += (Math.cos(orbitAngle * 0.7) * 0.08 - this.camera.position.y) * 0.015;

      this.paraX += (this.mouseX * 0.15 - this.paraX) * 0.03;
      this.paraY += (this.mouseY * 0.15 - this.paraY) * 0.03;

      if (idx === 2) {
        this.camera.position.x += (this.mouseX * 0.3 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouseY * 0.2 - this.camera.position.y) * 0.02;
      } else {
        this.camera.position.x += (0 - this.camera.position.x) * 0.04;
        this.camera.position.y += (0 - this.camera.position.y) * 0.04;
        this.edges.rotation.x = this.paraY * 0.1;
        this.edges.rotation.z = this.paraX * 0.08;
      }

      const spacerEndPx = (this.spacerVh * window.innerHeight) / 100;
      const fadeP = this.heroFadeProgress();
      if (fadeP > 0 && y < spacerEndPx) {
        this.edgesMaterial.opacity = Math.max(0, this.edgesMaterial.opacity - 0.04);
        for (const layer of this.particleLayers) {
          layer.material.opacity = Math.max(0, layer.material.opacity - 0.04);
        }
      }

      if (y > spacerEndPx) {
        this.edgesMaterial.opacity = Math.max(this.edgesMaterial.opacity, 0.4);
        for (const layer of this.particleLayers) {
          layer.material.opacity = Math.max(layer.material.opacity, 0.15);
        }
        this.camera.position.z += (4.2 - this.camera.position.z) * speed;
        const targetScale = 2.8;
        const es = this.edges.scale.x + (targetScale - this.edges.scale.x) * speed;
        this.edges.scale.set(es, es, es);
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
    this.edgesMaterial?.dispose();
    this.edges?.geometry?.dispose();
    for (const layer of this.particleLayers) {
      layer.material?.dispose();
      layer.points?.geometry?.dispose();
    }
  }
}

interface Slide {
  id: string;
  content: { ar: string[]; en: string[]; fr: string[]; it: string[] };
}

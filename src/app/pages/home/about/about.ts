import { Component, viewChild, ElementRef, afterNextRender, inject, DestroyRef, NgZone, input, computed, signal } from '@angular/core';
import { TranslationService } from '../../../core/services/translation/translation';
import { ScrollService } from '../../../core/services/scroll/scroll';

@Component({
  selector: 'about-section',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutSection {
  readonly translation = inject(TranslationService);
  private readonly scroll = inject(ScrollService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly active = input(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private renderer!: import('three').WebGLRenderer;
  private scene!: import('three').Scene;
  private camera!: import('three').PerspectiveCamera;
  private edges!: import('three').LineSegments;
  private rafId: number | null = null;

  readonly cubeScale = signal(4);
  readonly textReveal = signal(0);

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
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 4.5;

    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.0, 2.0, 3.0));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#b8c8d8'),
      transparent: true,
      opacity: 0.5,
    });
    this.edges = new THREE.LineSegments(edgeGeo, mat);
    this.scene.add(this.edges);

    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));

    this.ngZone.runOutsideAngular(() => this.startLoop());
    this.destroyRef.onDestroy(() => this.dispose());
  }

  private startLoop(): void {
    const aboutStart = 0.18; // approximate scrollProgress when about kicks in
    const scaleDuration = 0.25; // first 25% of about section for scale-in

    const loop = () => {
      this.rafId = requestAnimationFrame(loop);

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = this.scroll.scrollY();
      const globalProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      // local 0→1 within about section
      const local = globalProgress <= aboutStart ? 0
        : Math.min((globalProgress - aboutStart) / (1 - aboutStart), 1);

      // cube: start at 4x, shrink to 1x over first scaleDuration of about section
      const scaleTarget = local < scaleDuration
        ? 1 + 3 * (1 - local / scaleDuration)
        : 1;
      const s = this.edges.scale.x + (scaleTarget - this.edges.scale.x) * 0.06;
      this.edges.scale.set(s, s, s);
      this.cubeScale.set(Math.round(s * 100) / 100);

      // text reveal: fade in + scale over same period
      const reveal = local < scaleDuration
        ? local / scaleDuration
        : 1;
      this.textReveal.set(Math.round(reveal * 100) / 100);

      this.edges.rotation.y = local * Math.PI * 4;

      const targetX = this.translation.currentLang() === 'ar' ? 0.7 : -0.7;
      this.edges.position.x += (targetX - this.edges.position.x) * 0.06;

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
    this.edges?.geometry?.dispose();
    const mat = this.edges?.material;
    if (mat && !Array.isArray(mat)) mat.dispose();
  }
}

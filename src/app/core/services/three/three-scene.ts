import {
  DestroyRef,
  ElementRef,
  Injectable,
  effect,
  inject,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { ScrollService } from '../scroll/scroll';

@Injectable()
export class ThreeSceneService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroll = inject(ScrollService);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private mesh?: THREE.Mesh;
  private animationFrameId: number | null = null;

  readonly isReady = signal(false);

  constructor() {
    effect(() => {
      if (!this.camera) return;
      const progress = this.scroll.progress();
      const velocity = this.scroll.velocity();
      this.camera.position.y = -progress * 4;
      this.camera.rotation.z = velocity * 0.0015;
    });
  }

  init(canvas: HTMLCanvasElement): void {
    this.setupScene(canvas);
    this.startRenderLoop();
    this.isReady.set(true);

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private setupScene(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 64, 8);
    const material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private startRenderLoop(): void {
    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);
      if (this.mesh) {
        this.mesh.rotation.x += 0.008;
        this.mesh.rotation.y += 0.016;
      }
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private dispose(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.renderer?.dispose();
    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
  }
}

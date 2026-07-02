import { Component, viewChild, ElementRef, afterNextRender, inject, DestroyRef, NgZone, computed } from '@angular/core';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';

interface Project {
  id: string;
  title: { ar: string; en: string; fr: string; it: string };
  desc: { ar: string; en: string; fr: string; it: string };
  tech: string[];
  url: string;
  imgs: string[];
}

@Component({
  selector: 'projects-section',
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsSection {
  readonly scroll = inject(ScrollService);
  readonly translation = inject(TranslationService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private THREE!: typeof import('three');
  private renderer!: import('three').WebGLRenderer;
  private scene!: import('three').Scene;
  private camera!: import('three').PerspectiveCamera;
  private cube!: import('three').Mesh;
  private materials: import('three').MeshBasicMaterial[] = [];
  private loadedImages: HTMLImageElement[][] = [];
  private compositedTextures: import('three').CanvasTexture[][] = [];
  private lastActive = -1;
  private rafId: number | null = null;

  private readonly skillsEndVh = 480 + 780;
  readonly projectVh = 150;

  readonly projects: Project[] = [
    {
      id: 'abela',
      title: { ar: 'عميل مبيعات أبيلا', en: 'Abela Sales Agent', fr: 'Agent commercial Abela', it: 'Agente vendite Abela' },
      desc: { ar: 'نظام وكيل مبيعات ومخدم عملاء لقطارات أبيلا — إدارة التذاكر، العملاء، المعاملات، التقارير، مركز الاتصال، وأكواد الخصم ببوابة دفع ماستركارد', en: 'Sales agent & call center system for Abela trains — manage tickets, clients, transactions, reports, call center operations, and discount codes with MasterCard payment gateway', fr: 'Système d\'agent de vente et centre d\'appels pour les trains Abela — gestion des billets, clients, transactions, rapports, centre d\'appels et codes promo avec passerelle MasterCard', it: 'Sistema agente vendite e call center per treni Abela — gestione biglietti, clienti, transazioni, report, call center e codici sconto con gateway MasterCard' },
      tech: ['Angular 22', 'Tailwind', 'PrimeIcons', 'JWT', 'PDF', 'QR'],
      url: 'https://abelatrains.com:88/auth/login',
      imgs: ['/imgs/abela-agent.png', '/imgs/abela-sales.png', '/imgs/abela-sales-agent.png'],
    },
    {
      id: 'transit',
      title: { ar: 'وكيل مبيعات النقل', en: 'TransIt Sales Agent', fr: 'Agent commercial TransIt', it: 'Agente vendite TransIt' },
      desc: { ar: 'بوابة وكيل مبيعات متكاملة للقطارات والأتوبيسات (SuperJet) — إدارة العمليات، الحجوزات، العملاء، الرحلات، الوكلاء، والتقارير مع دعم واتساب', en: 'Integrated sales agent portal for trains and buses (SuperJet) — manage operations, bookings, clients, trips, agents, and reports with WhatsApp integration', fr: 'Portail agent de vente intégré pour trains et bus (SuperJet) — gestion des opérations, réservations, clients, voyages, agents et rapports avec intégration WhatsApp', it: 'Portale agente vendite integrato per treni e bus (SuperJet) — gestione operazioni, prenotazioni, clienti, viaggi, agenti e report con integrazione WhatsApp' },
      tech: ['Angular 20', 'Tailwind', 'PrimeIcons', 'JWT', 'CSV'],
      url: 'https://transcs.enr.gov.eg:444/#/auth/login',
      imgs: ['/imgs/agent.png', '/imgs/sales.png', '/imgs/sales-agent.png'],
    },
    {
      id: 'ltra-service',
      title: { ar: 'خدمات النقل البري', en: 'LTRA Services', fr: 'Services LTRA', it: 'Servizi LTRA' },
      desc: { ar: 'منصة تقديم خدمات الهيئة القومية لتنظيم النقل البري — تقديم ومعاينة الطلبات، استخراج التصاريح والبطاقات التشغيلية، ودفع الرسوم إلكترونياً', en: 'LTRA service submission platform — submit and track applications, issue operating permits and cards, and pay fees online', fr: 'Plateforme de soumission de services LTRA — soumettre et suivre les demandes, délivrer les permis et cartes d\'exploitation, payer les frais en ligne', it: 'Piattaforma di presentazione servizi LTRA — invia e monitora richieste, emetti permessi e carte operative, paga le tasse online' },
      tech: ['Angular 11', 'Bootstrap', 'Material', 'Syncfusion'],
      url: 'https://ltra.gov.eg/Services/#/auth/login',
      imgs: ['/imgs/ltra-service.png'],
    },
    {
      id: 'ltra-portal',
      title: { ar: 'البوابة الرئيسية للنقل البري', en: 'LTRA Main Portal', fr: 'Portail principal LTRA', it: 'Portale principale LTRA' },
      desc: { ar: 'نظام حكومي متكامل للهيئة القومية لتنظيم النقل البري — تعريف الخدمات ديناميكياً، إدارة سير العمل، طباعة 26+ نوع من المستندات الرسمية، تقارير الشاحنات، وإدارة البيانات الأساسية مع دعم GIS', en: 'Full government platform for the Land Transport Regulatory Authority — dynamic service builder, workflow engine, 26+ official document types, truck reporting, and static data management with GIS support', fr: 'Plateforme gouvernementale complète pour l\'autorité de régulation des transports terrestres — constructeur de services dynamique, moteur de workflow, 26+ types de documents officiels, rapports de camions et gestion des données statiques avec support GIS', it: 'Piattaforma governativa completa per l\'autorità di regolamentazione dei trasporti terrestri — builder dinamico di servizi, motore workflow, 26+ tipi di documenti ufficiali, report camion e gestione dati statici con supporto GIS' },
      tech: ['Angular 11', 'Bootstrap', 'Material', 'GSAP', 'PDF', 'Excel'],
      url: 'https://ltra.gov.eg/#/main/home',
      imgs: ['/imgs/ltra.png'],
    },
  ];

  readonly totalProjectsVh = this.projects.length * this.projectVh;

  readonly projectsScrollY = computed(() => {
    const skillsEndPx = (this.skillsEndVh * window.innerHeight) / 100;
    return Math.max(0, this.scroll.scrollY() - skillsEndPx);
  });

  readonly activeIndex = computed(() => {
    const projectPx = (this.projectVh * window.innerHeight) / 100;
    return Math.min(this.projects.length - 1, Math.floor(this.projectsScrollY() / projectPx));
  });

  readonly projectProgress = computed(() => {
    const projectPx = (this.projectVh * window.innerHeight) / 100;
    const raw = this.projectsScrollY() / projectPx;
    return raw - Math.floor(raw);
  });

  readonly entered = computed(() => this.projectsScrollY() > window.innerHeight * 0.08);

  readonly pastEnd = computed(() => {
    const totalPx = (this.totalProjectsVh * window.innerHeight) / 100;
    return this.projectsScrollY() >= totalPx;
  });

  readonly sectionFade = computed(() => {
    const totalPx = (this.totalProjectsVh * window.innerHeight) / 100;
    const fadeStartPx = totalPx - window.innerHeight * 0.15;
    const range = window.innerHeight * 0.15;
    const raw = (this.projectsScrollY() - fadeStartPx) / range;
    return Math.max(0, Math.min(1, raw));
  });

  readonly sectionSinkY = computed(() => {
    const f = this.sectionFade();
    return f * f * 60;
  });

  readonly currentUrl = computed(() => this.projects[this.activeIndex()]?.url ?? '');

  onCanvasClick(event: MouseEvent): void {
    if (!this.THREE || !this.cube || !this.cube.visible) return;
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new this.THREE.Raycaster();
    raycaster.setFromCamera(new this.THREE.Vector2(x, y), this.camera);
    const hits = raycaster.intersectObject(this.cube);
    if (hits.length === 0) return;
    const mi = hits[0].face!.materialIndex;
    const uv = hits[0].uv!;
    if (mi === 2 || mi === 3) return;
    if (uv.y >= 0.26) return;
    const url = this.currentUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  readonly cubeScale = computed(() => {
    const p = this.projectProgress();
    if (p < 0.15) {
      const t = Math.min(1, p / 0.15);
      return 0.5 + t * (2 - t) * 0.5;
    }
    if (p > 0.65) {
      const t = Math.min(1, (p - 0.65) / 0.2);
      return 0.5 + (1 - t * t) * 0.5;
    }
    return 1.0;
  });

  constructor() {
    afterNextRender(async () => {
      const THREE = await import('three');
      this.init(THREE);
    });
  }

  private async init(THREE: typeof import('three')): Promise<void> {
    this.THREE = THREE;
    const canvas = this.canvas().nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5.0;

    const allUrls: string[] = [];
    const imgGroupOffsets: number[] = [];
    for (const p of this.projects) {
      imgGroupOffsets.push(allUrls.length);
      allUrls.push(...p.imgs);
    }

    const imgElements = await Promise.all(
      allUrls.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('load failed'));
        img.src = url;
      }))
    );

    this.loadedImages = this.projects.map((p, i) =>
      imgElements.slice(imgGroupOffsets[i], imgGroupOffsets[i] + p.imgs.length)
    );

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.compositedTextures = this.buildAllComposites(THREE, maxAnisotropy);

    const geo = new THREE.BoxGeometry(3.6, 2.0, 3.6);

    for (let i = 0; i < 6; i++) {
      this.materials.push(new THREE.MeshBasicMaterial());
    }
    this.cube = new THREE.Mesh(geo, this.materials);
    this.scene.add(this.cube);

    this.applyProjectTextures(0);

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

  private buildSingleComposite(
    THREE: typeof import('three'),
    img: HTMLImageElement,
    maxAnisotropy: number,
  ): import('three').CanvasTexture {
    const w = 960;
    const h = 540;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  private buildAllComposites(
    THREE: typeof import('three'),
    maxAnisotropy: number,
  ): import('three').CanvasTexture[][] {
    return this.projects.map((_proj, pIdx) => {
      const imgs = this.loadedImages[pIdx];
      const n = imgs.length;
      const faces: import('three').CanvasTexture[] = [];

      for (let fi = 0; fi < 4; fi++) {
        const imgIdx = (n - 1 + fi) % n;
        faces.push(this.buildSingleComposite(THREE, imgs[imgIdx], maxAnisotropy));
      }

      const topClone = faces[0].clone();
      const botClone = faces[0].clone();
      return [faces[1], faces[3], topClone, botClone, faces[0], faces[2]];
    });
  }

  private rebuildComposites(): void {
    if (!this.renderer || !this.THREE) return;
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    for (const set of this.compositedTextures) {
      for (const t of set) t.dispose();
    }
    this.compositedTextures = this.buildAllComposites(this.THREE, maxAnisotropy);
    if (this.lastActive >= 0) this.applyProjectTextures(this.lastActive);
  }

  private applyProjectTextures(projectIdx: number): void {
    const texSet = this.compositedTextures[projectIdx];
    if (!texSet || texSet.length < 6) return;
    for (let i = 0; i < 6; i++) {
      this.materials[i].map = texSet[i] ?? null;
      this.materials[i].needsUpdate = true;
    }
  }

  private startLoop(): void {
    const growEnd = 0.15;
    const shrinkStart = 0.65;
    const shrinkEnd = 0.85;

    const loop = () => {
      this.rafId = requestAnimationFrame(loop);

      const active = this.activeIndex();
      const p = this.projectProgress();
      const entered = this.entered();
      const pastEnd = this.pastEnd();

      const sceneVisible = entered && !pastEnd;
      if (!sceneVisible) {
        this.cube.visible = false;
        if (this.renderer) this.renderer.render(this.scene, this.camera);
        return;
      }
      this.cube.visible = true;

      if (active !== this.lastActive) {
        this.applyProjectTextures(active);
        this.lastActive = active;
      }

      if (p < growEnd) {
        const t = Math.min(1, p / growEnd);
        const s = t * (2 - t);
        const scale = 0.5 + s * 0.5;
        this.cube.scale.set(scale, scale, scale);
      } else if (p > shrinkStart) {
        const t = Math.min(1, (p - shrinkStart) / (shrinkEnd - shrinkStart));
        const s = 1 - t * t;
        const scale = 0.5 + s * 0.5;
        this.cube.scale.set(scale, scale, scale);
      } else {
        const scale = 1.0;
        this.cube.scale.set(scale, scale, scale);
      }

      const baseRotation = p * Math.PI * 2;
      this.cube.rotation.y = baseRotation + active * Math.PI * 2;
      this.cube.rotation.x = Math.sin(p * Math.PI * 2) * 0.05;

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
    this.cube?.geometry?.dispose();
    for (const m of this.materials) m.dispose();
    for (const set of this.compositedTextures) {
      for (const t of set) t.dispose();
    }
  }
}

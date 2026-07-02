import { Component, inject, computed } from '@angular/core';
import { ScrollService } from '../../../core/services/scroll/scroll';
import { TranslationService } from '../../../core/services/translation/translation';

@Component({
  selector: 'contact-section',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactSection {
  readonly scroll = inject(ScrollService);
  readonly translation = inject(TranslationService);

  private readonly projectsEndVh = 1320 + 600 + 30;

  readonly contactScrollY = computed(() => {
    const endPx = (this.projectsEndVh * window.innerHeight) / 100;
    return Math.max(0, this.scroll.scrollY() - endPx);
  });

  readonly fade = computed(() => {
    const px = this.contactScrollY();
    if (px <= 0) return 0;
    return Math.min(1, px / (window.innerHeight * 0.3));
  });

  readonly sinkY = computed(() => (1 - this.fade()) * 40);

  readonly contacts = [
    {
      icon: 'pi pi-envelope',
      label: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'Email', it: 'Email' },
      value: 'abdelfattahqandil21@gmail.com',
      href: 'mailto:abdelfattahqandil21@gmail.com',
    },
    {
      icon: 'pi pi-phone',
      label: { ar: 'الهاتف', en: 'Phone', fr: 'Téléphone', it: 'Telefono' },
      value: '+201555785562',
      href: 'tel:+201555785562',
    },
    {
      icon: 'pi pi-whatsapp',
      label: { ar: 'واتساب', en: 'WhatsApp', fr: 'WhatsApp', it: 'WhatsApp' },
      value: '01009972926',
      href: 'https://wa.me/201009972926',
    },
  ];

  readonly socials = [
    { icon: 'pi pi-github', label: 'GitHub', href: 'https://github.com/abdelfattahqandil21-oss' },
    { icon: 'pi pi-linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/abdelfattah-kandel-58b635383' },
    { icon: 'pi pi-facebook', label: 'Facebook', href: 'https://www.facebook.com/share/18wGA7TkD3/' },
  ];
}

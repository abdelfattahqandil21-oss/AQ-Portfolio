import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { TranslationService } from '../../../core/services/translation/translation';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [TranslationService],
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the AQ logo', () => {
    expect(fixture.nativeElement.querySelector('.logo-font')).toHaveTextContent('AQ');
  });

  it('renders all nav items in English by default', () => {
    expect(fixture.nativeElement.textContent).toContain('Home');
    expect(fixture.nativeElement.textContent).toContain('About');
    expect(fixture.nativeElement.textContent).toContain('Skills');
    expect(fixture.nativeElement.textContent).toContain('Projects');
    expect(fixture.nativeElement.textContent).toContain('Contact');
  });

  it('renders LangSwitcher component', () => {
    expect(fixture.nativeElement.querySelector('lang-switcher')).toBeTruthy();
  });

  it('toggles mobile menu on hamburger click', () => {
    expect(fixture.nativeElement.querySelector('.fixed.top-16')).toBeFalsy();

    component.mobileOpen.set(true);
    fixture.detectChanges();

    expect(component.mobileOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.fixed.top-16')).toBeTruthy();

    component.mobileOpen.set(false);
    fixture.detectChanges();

    expect(component.mobileOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.fixed.top-16')).toBeFalsy();
  });
});

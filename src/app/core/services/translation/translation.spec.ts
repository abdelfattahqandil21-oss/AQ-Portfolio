import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { TranslationService } from './translation';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  it('defaults to English when no saved lang or browser lang match', () => {
    expect(service.currentLang()).toBe('en');
  });

  it('translates based on current language', () => {
    service.setLang('ar');
    expect(service.translate('مرحبا', 'Hello', 'Bonjour', 'Ciao')).toBe('مرحبا');
    service.setLang('fr');
    expect(service.translate('مرحبا', 'Hello', 'Bonjour', 'Ciao')).toBe('Bonjour');
    service.setLang('it');
    expect(service.translate('مرحبا', 'Hello', 'Bonjour', 'Ciao')).toBe('Ciao');
    service.setLang('en');
    expect(service.translate('مرحبا', 'Hello', 'Bonjour', 'Ciao')).toBe('Hello');
  });

  it('toggles through languages in order', () => {
    expect(service.currentLang()).toBe('en');
    service.toggleLang();
    expect(service.currentLang()).toBe('fr');
    service.toggleLang();
    expect(service.currentLang()).toBe('it');
    service.toggleLang();
    expect(service.currentLang()).toBe('ar');
    service.toggleLang();
    expect(service.currentLang()).toBe('en');
  });

  it('logs a warning and does not change lang for unsupported lang', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    service.setLang('es' as never);
    expect(spy).toHaveBeenCalledWith('Unsupported language: es');
    expect(service.currentLang()).toBe('en');
    spy.mockRestore();
  });

  it('persists lang to localStorage', () => {
    service.setLang('fr');
    TestBed.inject(ApplicationRef).tick();
    expect(localStorage.getItem('app_lang')).toBe('fr');
  });

  it('returns supported languages', () => {
    expect(service.getSupportedLangs()).toEqual(['ar', 'en', 'fr', 'it']);
  });
});

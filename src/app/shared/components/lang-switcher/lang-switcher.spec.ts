import { render, screen } from '@testing-library/angular';
import { LangSwitcher } from './lang-switcher';
import { TranslationService } from '../../../core/services/translation/translation';
import { ViewTransitionService } from '../../../core/services/view-transition/view-transition';

describe('LangSwitcher', () => {
  const setup = () =>
    render(LangSwitcher, {
      providers: [TranslationService, ViewTransitionService],
    });

  it('renders the current language label', async () => {
    await setup();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('opens dropdown on button click', async () => {
    const { fixture } = await setup();
    const button = screen.getByRole('button');

    button.click();
    fixture.detectChanges();

    expect(screen.getByText('العربية')).toBeTruthy();
    expect(screen.getByText('Français')).toBeTruthy();
    expect(screen.getByText('Italiano')).toBeTruthy();
  });

  it('closes dropdown on document click', async () => {
    const { fixture } = await setup();
    screen.getByRole('button').click();
    fixture.detectChanges();
    expect(screen.getByText('العربية')).toBeTruthy();

    document.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(screen.queryByText('العربية')).toBeFalsy();
  });

  it('highlights the active language', async () => {
    const { fixture } = await setup();
    screen.getByRole('button').click();
    fixture.detectChanges();

    const allTexts = screen.getAllByText(/English|العربية|Français|Italiano/);
    const activeItem = allTexts.find(
      (item) => item.closest('li')?.classList.contains('bg-surface-300'),
    );
    expect(activeItem).toBeTruthy();
  });

  it('toggles open state on button click', async () => {
    const { fixture } = await setup();
    const button = screen.getByRole('button');

    button.click();
    fixture.detectChanges();
    expect(screen.getByText('العربية')).toBeTruthy();

    button.click();
    fixture.detectChanges();
    expect(screen.queryByText('العربية')).toBeFalsy();
  });
});

import { render } from '@testing-library/angular';
import { Shell } from './shell';

describe('Shell', () => {
  it('creates the shell layout', async () => {
    const { container } = await render(Shell);
    expect(container.querySelector('site-header')).toBeInTheDocument();
    expect(container.querySelector('router-outlet')).toBeInTheDocument();
  });
});

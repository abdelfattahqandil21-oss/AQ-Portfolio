import { render } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  it('creates the root component', async () => {
    const { container } = await render(App);
    expect(container.querySelector('router-outlet')).toBeInTheDocument();
  });
});

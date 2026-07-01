import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';

@Component({
  selector: 'shell-layout',
  imports: [RouterOutlet, Header],
  template: `
    <site-header />
    <router-outlet />
  `,
  host: {
    class: 'block',
  },
})
export class Shell {}

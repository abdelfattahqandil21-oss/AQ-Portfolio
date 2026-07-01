import { Component } from '@angular/core';
import { Hero } from './hero/hero';

@Component({
  selector: 'page-home',
  imports: [Hero],
  template: `<hero-section />`,
})
export class Home {}

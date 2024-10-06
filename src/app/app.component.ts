import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <h1>Phase 2</h1>
  <ul>
    <li><a routerLink="/problem1" routerLinkActive="active" ariaCurrentWhenActive="page">Problem 1</a></li>
    <li><a routerLink="/problem2" routerLinkActive="active" ariaCurrentWhenActive="page">Problem 2</a></li>
  </ul>
  <router-outlet></router-outlet>
  `
})
export class AppComponent {}

// Suggested code may be subject to a license. Learn more: ~LicenseLog:46875826.
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-count-down',
  template: `
    @if (countdown() !== null ) {
    <h3>Seconds left to deadline: {{ countdown() }} </h3>
  } @else {
    <h3>Loading</h3>
  }
  `,
  standalone: true,
})
export class CountDownComponent {
  public countdown = input.required<number | null>();
}


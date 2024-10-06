import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable, interval, map, switchMap, takeWhile } from 'rxjs';
import { CountDownComponent } from '../ui/count-down.component';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-problem1',
  imports: [CommonModule, CountDownComponent],
  template: `
  <app-count-down [countdown]="secondsLeft | async"></app-count-down>
  `
})
export class Problem1Component implements OnInit {
  // private readonly url = '/api/deadline';
  private readonly url = 'https://mocki.io/v1/675c0d32-b87d-48ae-94a0-27c2a8c11282';
  private readonly http = inject(HttpClient);
  public secondsLeft = new Observable<number>();
  ngOnInit(): void {
    this.secondsLeft = this.http.get<{ secondsLeft: number }>(this.url).pipe(
      map((res) => res.secondsLeft),
      switchMap((secondsLeft) => this.countDown(secondsLeft))
    )
  }

  private countDown(start: number): Observable<number> {
    return interval(1000).pipe(
      // Map each emitted value (i) to a countdown from 'start'
      map(i => start - i),
      // Continue emitting values until we reach 0
      takeWhile(val => val >= 0)
    );
  }
}

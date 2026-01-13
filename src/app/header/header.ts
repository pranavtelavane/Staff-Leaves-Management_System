import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  auth = inject(Authservice);
  router = inject(Router);

  user = this.auth.userSignal;

  defaultAvatar = 'avatar.svg';

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }

}

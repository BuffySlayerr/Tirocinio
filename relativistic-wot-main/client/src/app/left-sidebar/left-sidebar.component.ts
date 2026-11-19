import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { BaseComponent } from '@shared/base/base.component';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss']
})
export class LeftSidebarComponent extends BaseComponent implements OnInit {

  currentLink = '';

  constructor(
    private router: Router,
    private readonly authService: AuthService,
  ) {
    super();
    this.subscriptions.push(
      this.router.events.subscribe((val) => {
        if (val instanceof NavigationEnd) {
          const url = val.url.split('?')[0];
          const length = url.split('/').length;
          this.currentLink = url.split('/')[length - 1];
        }
      })
    );
  }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
  }

}

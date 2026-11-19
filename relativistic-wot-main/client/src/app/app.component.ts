import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '@env/environment';
import { BaseComponent } from '@shared/base/base.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarInterface } from '@shared/interfaces/snackbar.interface';
import { EventBusService } from '@services/event-bus.service';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('drawer', {static: false}) drawerEl;
  private defaultLanguage: string;
  title = 'Relativistic DT';
  showFiller = false;
  showRightSidebar = false;
  openedSidenav = false;
  isAuthenticated = false;
  showSpinner = false;

  constructor(
    private readonly translateService: TranslateService,
    private readonly eventBusService: EventBusService,
    private readonly authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    super();
    this.defaultLanguage = environment.defaultLanguage;
    this.subscriptions.push(
      this.eventBusService.snackBarRequestEvent.subscribe((data: any) => {
        this.openSnackBar(data);
      }),
      this.eventBusService.showSpinnerEvent.subscribe((val: boolean) => {
        this.showSpinner = val;
      }),
      this.authService.isAuthenticatedSubject.subscribe(val => this.isAuthenticated = val),
    );

  }

  ngOnDestroy(): void {
  }

  async ngOnInit() {
    this.translateService.setDefaultLang(this.defaultLanguage);
  }

  openingSidenav(val) {
    this.openedSidenav = val;
  }

  openSnackBar(snackBarRequest: SnackBarInterface) {
    this.snackBar.dismiss();
    let label = '';
    if (snackBarRequest.errorCode) {
      label = snackBarRequest.errorCode;
    } else {
      label = snackBarRequest.message;
    }

    this.snackBar.open(label, snackBarRequest.action, {
      duration: 5000,
      panelClass: [snackBarRequest.style]
    });
    // this.cdr.detectChanges();
  }

}

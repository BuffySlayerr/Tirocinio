import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { BaseComponent } from '@shared/base/base.component';
import { AuthService } from '@services/auth/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '@services/storage/storage.service';
import { StorageTypeEnum } from '@services/storage/storage-type.enum';
// import { Auth } from '@app/graphql/generated/graphql';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  settingsControl = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  };

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly router: Router,
  ) {
    super();
    this.loginForm = formBuilder.group({
      email: this.settingsControl.email,
      password: this.settingsControl.password,
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() { }

  login() {
    const email = this.loginForm.get('email').value.toLowerCase();
    const password = this.loginForm.get('password').value;
    /*this.authService.login(email, password)
      .subscribe((data: Auth) => {
        if (data) {
          this.storageService.store('token', data.accessToken, StorageTypeEnum.SESSION_STORAGE);
          this.router.navigate(['/home']);
        }
      }, (err) => {
        console.log(err);
        alert('Non abbiamo trovato nessuna combinazione username/password');
        this.loginForm.get('password').reset();
        return;
      });*/
  }

}

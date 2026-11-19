import { Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '@env/environment';
import { map } from 'rxjs/operators';
import { StorageService } from '@services/storage/storage.service';
import { StorageTypeEnum } from '@services/storage/storage-type.enum';
import { UserData } from '@shared/models/userData.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  @Output() isAuthenticatedSubject: Subject<boolean> = new Subject();
  authenticationToken: string;
  userData: UserData;
  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService,
    private router: Router
  ) { }

  getAuthHeaders() {
    let auth = new HttpHeaders();
    auth = auth.set('Authorization', 'JWT ' + window.localStorage.getItem('token'));
    return auth;
  }

  getUserData(): Observable<any> {
    if (this.userData) {
      return of(this.userData);
    } else {
      const auth = this.getAuthHeaders();
      // FIXME: default auth authEndpoint
      const authEndpoint = environment.authEndpoint + '/auth/me/';
      const obsv = this.http.get(authEndpoint, { headers: auth });
      obsv.subscribe(data => this.userData = data as UserData);
      return obsv;
    }
  }

  login(username: string, password: string): Observable<any> {
    /*FIXME: use real data*/
    // username = 'testuser';
    // password = 'qwer1234';
    const payload = {
      username,
      password
    };
    return this.http.post(environment.authEndpoint + '/auth/jwt/create/', payload).pipe(
      map((response: any) => {
        this.isAuthenticatedSubject.next(true);
        return response;
      })
    );

  }

  resetPassword(email: string) {
    return this.http.post(environment.authEndpoint + '/auth/password/reset/',
      {
        email
      }
    );
  }

  confirmPassword(uid: string, token: string, password: string) {
    return this.http.post(environment.authEndpoint + '/auth/password/reset/confirm/',
      {
        uid,
        token,
        new_password: password
      }
    );
  }

  createUser(username, mail, password) {
    return this.http.post(environment.authEndpoint + '/auth/users/create/',
      {
        username: username.toLowerCase(),
        email: mail.toLowerCase(),
        password
      }
    );
  }

  getParams(filter) {
    let ret = '';
    // tslint:disable-next-line: forin
    for (const f in filter) {
      console.log(f, filter[f]);
      ret = ret + f + '=' + filter[f] + '&';
    }
    console.log(ret);
    return ret;

  }

  setClaims(username, claims) {
    return this.http.post(environment.authEndpoint + '/auth/users/setclaims/?' + this.getParams({
      username: username.toLowerCase(),
      claims: JSON.stringify(claims)
    }), '');
  }

  logout() {
    this.storageService.remove('token', StorageTypeEnum.SESSION_STORAGE);
    this.storageService.remove('userData', StorageTypeEnum.LOCAL_STORAGE);
    this.authenticationToken = undefined;
    this.userData = undefined;
    this.router.navigate(['/login']);
    return;
  }

  public isAuthenticated(): Observable<boolean> {
    this.authenticationToken = this.storageService.retrieve('token', StorageTypeEnum.SESSION_STORAGE);
    this.userData = this.storageService.retrieve('userData', StorageTypeEnum.LOCAL_STORAGE);
    if ( this.authenticationToken !== null && this.userData !== null) {
      this.isAuthenticatedSubject.next(true);
      return of(true);
    } else {
      this.isAuthenticatedSubject.next(false);
      return of(false);
    }
  }

  public getAuthenticationToken(): Observable<string> {
    this.authenticationToken = this.storageService.retrieve('token', StorageTypeEnum.SESSION_STORAGE);
    if (this.authenticationToken !== null) {
      return of(this.authenticationToken);
    } else {
      return of(null);
    }
  }

  public signup(payload) {
    return this.http.post(environment.authEndpoint + '/attendee', {
      company: payload.company,
      tile: payload.title,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      eventId: 1
    }).pipe(
      map((response) => {
      return this.http.post(environment.authEndpoint + '/auth/users/create/',
      {
        username: payload.email,
        email: payload.email,
        password: payload.password
      }).subscribe(x=>{});
     console.log(response);
     return response;
      })
    );
  }

}

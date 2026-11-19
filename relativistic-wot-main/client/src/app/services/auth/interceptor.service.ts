import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { flatMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  private addExtraHeaders(headers: HttpHeaders, key, value): HttpHeaders {
    headers = headers.set(key, value);
    return headers;
  }

  /**
   * Intercepts the request adding the authentication token if it is present
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      request.url.indexOf('/auth') < 0 || request.url.indexOf('/jwt') > -1
    ) {
      return next.handle(request);
    } else {
      return this.authService.getAuthenticationToken().pipe(
        flatMap((token: string) => {
          if (token == null) {
            this.router.navigate(['/login']);
            // this.router.navigateToFirstPageBeforeLogin();
            return of(null);
          } else {
            // token = token.replace(/"/g, ''); // FIXME: altrimenti non funziona
            const req = request.clone({
              headers: this.addExtraHeaders(request.headers, 'Authorization', `JWT ${token}`)
            });
            return next.handle(req);
          }
        })
      );
    }
  }
}

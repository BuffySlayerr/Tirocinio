import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NoAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private readonly authService: AuthService,
    ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated().pipe(map(isAuth => {
      if (isAuth) {
        this.router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    }));
  }
}

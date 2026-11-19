import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '@pages/home/home.component';
import { LoginComponent } from '@app/login/login.component';
import { AuthGuard } from '@services/auth/auth.guard';
import { NoAuthGuard } from '@services/auth/no-auth.guard';
import { MDPTwinComponent } from '@pages/mdp-twin/mdp-twin.component';
import { LearningThingComponent } from '@pages/learning-thing/learning-thing.component';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], pathMatch: 'full', children: [
      { path: 'home', component: HomeComponent },
    ]
    },
  { path: 'login', canActivate: [NoAuthGuard], component: LoginComponent},
  {
    path: '', canActivate: [AuthGuard], children: [
      { path: 'home', component: HomeComponent },
      { path: 'mdp-twin', component: MDPTwinComponent },
      { path: 'learning-thing', component: LearningThingComponent},
    ]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

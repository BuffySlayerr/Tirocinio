import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from '@pages/home/home.component';
import { LoginComponent } from '@app/login/login.component';
import { SharedModule } from '@shared/shared.module';
import { AppMaterialModule } from './app-material.module';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { MomentModule } from 'ngx-moment';
import { NgxEchartsModule } from 'ngx-echarts';
import { MDPTwinComponent } from '@pages/mdp-twin/mdp-twin.component';
import { LearningThingComponent } from '@pages/learning-thing/learning-thing.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

const config: SocketIoConfig = { url: 'http://localhost:3001', options: {} };

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // ShowHidePasswordModule,
    SharedModule,
    AppMaterialModule,
    RouterModule,
    AppRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    MomentModule,
    SocketIoModule.forRoot(config),
    NgxCsvParserModule,
    NgxMatFileInputModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    MDPTwinComponent,
    LearningThingComponent,
    LoginComponent,
    LeftSidebarComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}

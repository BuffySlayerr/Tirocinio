import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppTranslateModule } from '@app/app-translate.module';
import { RouterModule } from '@angular/router';

import { BaseComponent } from './base/base.component';
import { AuthGuard } from '@services/auth/auth.guard';
import { NoAuthGuard } from '@services/auth/no-auth.guard';
import { AppMaterialModule } from '@app/app-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AskConfirmComponent } from './ask-confirm-modal/ask-confirm-modal.component';
import { CustomTableComponent } from './custom-table/custom-table.component';
import { VisualizationOptionsComponent } from './visualization-options/visualization-options.component';
import { TwinOptionsComponent } from './twin-options/twin-options.component';


@NgModule({
  imports: [
    AppTranslateModule,
    RouterModule,
    CommonModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    BaseComponent,
    AskConfirmComponent,
    CustomTableComponent,
    VisualizationOptionsComponent,
    TwinOptionsComponent,
  ],
  exports: [
    AppTranslateModule,
    RouterModule,
    BaseComponent,
    AskConfirmComponent,
    CustomTableComponent,
    VisualizationOptionsComponent,
    TwinOptionsComponent,
  ],
  providers: [
    AuthGuard,
    NoAuthGuard,
  ]
})
export class SharedModule { }

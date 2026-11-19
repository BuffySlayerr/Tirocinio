import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { BaseComponent } from '@shared/base/base.component';
import { AskConfirmComponent } from '@shared/ask-confirm-modal/ask-confirm-modal.component';

@Component({
  selector: 'app-submit-with-confirmation',
  templateUrl: './submit-with-confirmation.component.html',
  styleUrls: ['./submit-with-confirmation.component.scss']
})
export abstract class SubmitWithConfirmationComponent extends BaseComponent implements OnInit {
  abstract submit();
  constructor(
    private dialogService: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
  }

  askConfirmation() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = ['save'];
    dialogConfig.width = '50%';
    dialogConfig.data = {
    };

    const dialogRef = this.dialogService.open(
      AskConfirmComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.submit();
      }
    });
  }

}

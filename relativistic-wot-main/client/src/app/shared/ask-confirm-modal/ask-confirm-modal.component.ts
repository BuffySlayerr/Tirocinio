import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

const ENTER_KEYCODE = 13;
const ESCAPE_KEYCODE = 27;

@Component({
  selector: 'app-ask-confirm-modal',
  templateUrl: './ask-confirm-modal.component.html',
  styleUrls: ['./ask-confirm-modal.component.scss']
})
export class AskConfirmComponent implements OnInit {

  feedback;
  constructor(
    public dialogRef: MatDialogRef<AskConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  closeDialog(value: boolean) {
    this.dialogRef.close(value);
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.keyCode === ESCAPE_KEYCODE) {
      this.closeDialog(false);
    }
    if (event.keyCode === ENTER_KEYCODE) {
      this.closeDialog(true);
    }
  }
}

import { Component, OnInit, Input, ViewChild, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { EventBusService } from '@services/event-bus.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CustomTableComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(MatSort) sort: MatSort;
  @Input() data: any = null;
  @Input() title: string = null;
  @Input() modalConfig: {dialogConfig: MatDialogConfig, component: any, key: string} = null;
  @Input() columns: {displayedColumns: string[], columnLabels: string[]};
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  // displayedColumns: string[] = ['lastName', 'firstName', 'phone', 'email'];
  // columnLabels = ['Cognome', 'Nome', 'Telefono', 'Email'];
  // dataSource = new MatTableDataSource([]);
  expandedElement: any | null;
  displayedColumns: string[] = [];
  columnLabels: string[] = [];

  constructor(
    private readonly eventBusService: EventBusService,
    private dialog: MatDialog,
  ) {
    /*if (this.selectedObject) {
      this.dataSource = new MatTableDataSource(this.selectedObject.custom);
      this.dataSource.data = this.dataSource.data;
      this.dataSource.sort = this.sort;
    }*/
    if (this.data) {
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.data = this.dataSource.data;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.data = changes.data.currentValue;
      this.refreshTable();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  openDetail(element: any) {
    let dialogConfig: MatDialogConfig;
    let component: any = null;
    if (this.modalConfig) {
      dialogConfig = this.modalConfig.dialogConfig;
      const key = this.modalConfig.key;
      dialogConfig.data[key] = element;
      console.log(dialogConfig)
      component = this.modalConfig.component;
    } else {
      dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.panelClass = 'new-client-contact-modal';
      dialogConfig.height = 'auto';
      dialogConfig.width = '70%';
      dialogConfig.data = {
        // selectedCustom: contact,
        // clientId: this.selectedClient.id,
      };
      component = null; // FIXME: add the custom default component
    }

    const dialogRef = this.dialog.open(component, dialogConfig);

    dialogRef
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
        }
      });
  }

  refreshTable() {
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.data = this.dataSource.data;
      this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}


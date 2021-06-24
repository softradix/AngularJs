import { NgModule } from '@angular/core';
import { CommonComponent } from './common.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [CommonComponent],
  imports: [
    DataTablesModule
  ],
  exports: [DataTablesModule]
})
export class CommonModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { SharedModule } from "../../shared/shared.module";
import { CompanyAddEditComponent } from './company-add-edit/company-add-edit.component';
import { CompanyListComponent } from './company-list/company-list.component';

export const routes = [
  { path: '', component: CompanyListComponent },
  { path: 'add', component: CompanyAddEditComponent },
  { path: 'edit/:id', component: CompanyAddEditComponent },
  { path: 'view/:id', component: CompanyAddEditComponent }
];


@NgModule({
  declarations: [CompanyAddEditComponent, CompanyListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class CompanyModule {
  static routes = routes;
}

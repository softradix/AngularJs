import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesAddEditComponent } from './quotes-add-edit/quotes-add-edit.component';
import { QuotesListComponent } from './quotes-list/quotes-list.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { SharedModule } from "../../shared/shared.module";
import { QuotesRiskComponent } from './quotes-risk/quotes-risk.component';
import { QuotesProponentComponent } from './quotes-proponent/quotes-proponent.component';
import { QuotesProductComponent } from './quotes-product/quotes-product.component';

export const routes = [
  { path: '', component: QuotesListComponent },
  { path: 'add', component: QuotesAddEditComponent },
  { path: 'edit/:id', component: QuotesAddEditComponent }
];

@NgModule({
  declarations: [QuotesAddEditComponent, QuotesListComponent, QuotesRiskComponent, QuotesProponentComponent, QuotesProductComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    QuotesRiskComponent, QuotesProponentComponent, QuotesProductComponent
  ],
})
export class QuotesModule {
  static routes = routes;
}
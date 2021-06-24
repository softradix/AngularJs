import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserService } from 'src/app/common/services/user/current-user.service';
import { ToastrService } from 'ngx-toastr';
import { AppApi } from "../../../app-api";
import { QuotesRestService } from '../../../common/services/quotes/quotes-rest.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DatatableService } from '.././../../common/services/data-table/datatable.service';
import { ChangeDateFormatService } from '../../../common/services/date-picker/change-date-format.service';
import Swal from 'sweetalert2';

import { QuotesProponentComponent } from '../quotes-proponent/quotes-proponent.component';
import { QuotesProductComponent } from '../quotes-product/quotes-product.component';
import { QuotesRiskComponent } from '../quotes-risk/quotes-risk.component';

@Component({
  selector: "app-quotes-add-edit",
  templateUrl: "./quotes-add-edit.component.html",
  styleUrls: ["./quotes-add-edit.component.scss"],
  providers: [QuotesRestService, ConfirmDialogService, DatatableService, ChangeDateFormatService]
})

export class QuotesAddEditComponent implements OnInit {
  @ViewChild(QuotesProponentComponent, { static: false }) QuotesProponentComponentObj;
  @ViewChild(QuotesProductComponent, { static: false }) QuotesProductComponentObj;
  @ViewChild(QuotesRiskComponent, { static: false }) QuotesRiskComponentObj;
  showLoader = false;
  pageMode = 'addMode';
  quoteDropdownList:any = [];
  quotesData: any = [];
  currentUser: any = [];
  company_id;
  quoteId;
  proponentIsActive: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public currentUserService: CurrentUserService,
    public quotesRestService: QuotesRestService,
    public toastrService: ToastrService,
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = JSON.parse(currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
    this.quotesDropDowns();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.quoteId = atob(params.id);
        if (this.activatedRoute.snapshot.url[0].path === 'edit') {
          this.pageMode = 'editMode';
        }
      }
    });
  }

  /**
   * Get quotes dropdown list
   */
  quotesDropDowns() {
    this.quotesRestService.getApi(AppApi.QuotesDropdowns + this.company_id).then((response: any) => {
      if (response.status === 1 && response.code === 200) {
        this.quoteDropdownList = response.data;
        if (this.pageMode == 'addMode') {
          for (const retro of this.quoteDropdownList[0].retroactvity) {
            if (item => (item.id === 12 || item.id === 16)) {
              const index = this.quoteDropdownList[0].retroactvity.findIndex(item =>item.id === 12 || item.id === 16);
              if (index > -1) {
                this.quoteDropdownList[0].retroactvity.splice(index, 1);
              }
            }
          }
          this.QuotesProponentComponentObj.filterDropDownList(2); //set proponent dropdown
          this.QuotesProductComponentObj.filterDropDownList(2, 1, this.quoteDropdownList); //set product dropdown
          this.QuotesRiskComponentObj.filterDropDownList(2, 1, this.quoteDropdownList); //set risk dropdown
        }
        if (this.pageMode == 'editMode') {
          this.getQuoteById(this.quoteId);
        }
      }
    })
  }

  /**
   * Get Quote Details By QuoteId
   * @param quoteId // Quote id to get the single Quote
   */
  getQuoteById(quoteId: null) {
    this.showLoader = true;
    this.quotesRestService
      .getApi(AppApi.quotesUrl + quoteId)
      .then((response) => {
        this.showLoader = false;
        if (response.status === 1 && response.code === 200) {
          this.quotesData = response.data;
          if (response.data.status == 3 || response.data.status == 6) {
            Swal.fire({
              title: 'A cotação já foi emitida.',
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.router.navigateByUrl('/quotes');
            return false;
          } else if (response.data.status == 2) {
            Swal.fire({
              title: 'Você não pode editar a cotação inativa. Peça ao administrador para ativar a cotação.',
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.router.navigateByUrl('/quotes');
            return false;
          }
          if (this.pageMode == 'editMode') {
            this.QuotesProponentComponentObj.filterDropDownList(response.data.customer_type); //set proponent dropdown
            this.QuotesProductComponentObj.filterDropDownList(response.data.customer_type, response.data && response.data.profession_id ? response.data.profession_id : 1, this.quoteDropdownList); //set product dropdown
            this.QuotesRiskComponentObj.filterDropDownList(response.data.customer_type, response.data && response.data.profession_id ? response.data.profession_id : 1, this.quoteDropdownList); //set risk dropdown
          }
          this.QuotesProponentComponentObj.patchQuoteData(response.data); //Patch Proponent data
          this.QuotesProductComponentObj.patchQuoteData(response.data); //Patch Product data
          this.QuotesRiskComponentObj.getQuoteDetails(response.data); //Patch Product data
        } else {
          Swal.fire({
            title: response.message,
            icon: 'success',
            timer: 5000,
            position: "top-right",
            toast: true,
            showCancelButton: false,
            showConfirmButton: false
          })
        }
      });
  }

  /**
   * Function to click tab
   * @param tabId 
   */
  onClickTab(tabId) {
    if (tabId == 'pills-product') {
      this.QuotesProponentComponentObj.validateProponentTab(tabId);
    } else if (tabId == 'pills-risk') {
      this.QuotesRiskComponentObj.validateRiskTab();
    }
  }

  /**
   * Function to filter the dropdowns on change customer type
   * @param type 
   */
  filterDataOnChangeCustomerType(type) {
    this.QuotesProponentComponentObj.filterDropDownList(type); //set proponent dropdown
    this.QuotesProductComponentObj.filterDropDownList(type, 1, this.quoteDropdownList); //set product dropdown
    this.QuotesRiskComponentObj.filterDropDownList(type, 1, this.quoteDropdownList); //set risk dropdown
  }

  /**
   * Function to set quote detail after create quote first step
   * @param quoteId 
   */
  setQuoteDetail(quoteData) {
    this.quotesData = quoteData;
    this.QuotesProductComponentObj.getQuoteDetails(quoteData); //Patch Product data
    this.QuotesRiskComponentObj.getQuoteDetails(quoteData); //Patch Product data
  }

  /**
   * Function to filter the dropdowns on change profession
   * @param type 
   */
  filterRiskDropdownOnChangeProfession(type) {
    this.QuotesRiskComponentObj.filterDropDownList(this.quotesData.customer_type, type, this.quoteDropdownList); //set risk dropdown
  }

  validateProductTab() {
    this.QuotesProductComponentObj.validateQuoteProduct();
  }

}

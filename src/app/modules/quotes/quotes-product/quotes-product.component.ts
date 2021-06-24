import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { QuotesRestService } from '../../../common/services/quotes/quotes-rest.service';
import { AppApi } from "../../../app-api";
import { CurrentUserService } from "../../../common/services/user/current-user.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quotes-product',
  templateUrl: './quotes-product.component.html',
  styleUrls: ['./quotes-product.component.scss'],
  providers: [QuotesRestService]
})
export class QuotesProductComponent implements OnInit {

  pageMode: any;
  productForm: FormGroup;
  company_id: any;
  showLoader: boolean = false;
  @Input() param: any = {};
  quotesData: any = [];
  currentUser;
  quoteId;
  productListFilter = [];
  professionalListFilter = [];
  professionalList = [];
  turnoverList = [];
  retroactivityListFilter = [];
  retroactivityList = [];
  productList = [];
  deductibleListFilter = [];
  deductibleList = [];
  options = [];
  liabilityListFilter = [];
  liabilityList = [];
  specialtyListFilter = [];
  specialtyList = [];
  restroactivity = [];
  selectedSpecilaityId = '';
  selectedProfessionalId = '';
  selectedProductId = '';
  selectedLibilityId = '';
  selectedDeductibleId = '';
  selectedCustomerType = '';
  @Output() getQuoteDetail = new EventEmitter<any>();
  @Output() getSelectedProfession = new EventEmitter<any>();
  allDropdownList: any;

  constructor(
    public quotesRestService: QuotesRestService,
    public currentUserService: CurrentUserService,
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = (currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
  }

  ngOnInit() {
    this.productForm = new FormGroup({
      product_id: new FormControl('', [Validators.required]),
      profession_id: new FormControl('', [Validators.required]),
      specialty_id: new FormControl('', [Validators.required]),
      liability_id: new FormControl('', [Validators.required]),
      deductible_id: new FormControl('', [Validators.required])
    });
    this.pageMode = this.param.pageMode;
  }

  /**
   * Function to filter dropdowns
   * @param type 
   */
  filterDropDownList(type, professionId, dropdownList) {
    this.allDropdownList = dropdownList;
    this.selectedCustomerType = type;
    if (type) {
      this.productListFilter = dropdownList[0].product;
      this.professionalListFilter = dropdownList[0].professional;
      this.specialtyListFilter = dropdownList[0].Specialty.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.liabilityListFilter = dropdownList[0].liblity.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.deductibleListFilter = dropdownList[0].deuctible.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
    }
  }

  /**
   * Function to patch quote data
   */
  patchQuoteData(quoteData) {
    this.quoteId = quoteData.id;
    this.quotesData = quoteData;
    this.selectedProductId = quoteData.product ? quoteData.product.id : '';
    this.selectedCustomerType = quoteData.customer_type == 2 ? '2' : '1';
    this.selectedProfessionalId = quoteData.profession ? quoteData.profession.id : '';
    this.selectedSpecilaityId = quoteData.specialty ? quoteData.specialty.id : '';
    this.selectedLibilityId = quoteData.liability ? quoteData.liability.id : '';
    this.selectedDeductibleId = quoteData.deductible ? quoteData.deductible.id : '';
    this.productForm.patchValue({
      product_id: quoteData.product ? quoteData.product.id : '',
      profession_id: quoteData.profession ? quoteData.profession.id : '',
      specialty_id: quoteData.specialty ? quoteData.specialty.id : '',
      liability_id: quoteData.liability ? quoteData.liability.id : '',
      deductible_id: quoteData.deductible ? quoteData.deductible.id : ''
    });
  }

  /**
   * function to update quotes
   */
  updateQuote() {
    const isValidQuote = this.validateQuoteProduct();
    if (isValidQuote == false) {
      return false;
    }
    if (this.productForm.valid) {
      if (this.quotesData && (this.quotesData.status == 1 || this.quotesData.status == 5)) {
        $('#pills-risk-tab').removeClass('disabled');
        $('#pills-risk-tab').click();
        this.quotesData.product_id = this.productForm.value.product_id;
        this.quotesData.profession_id = this.productForm.value.profession_id;
        this.quotesData.specialty_id = this.productForm.value.specialty_id;
        this.quotesData.liability_id = this.productForm.value.liability_id;
        this.quotesData.deductible_id = this.productForm.value.deductible_id;
        this.getQuoteDetail.next(this.quotesData);
        return false;
      } else if (this.quotesData && this.quotesData.status == 4) {
        this.productForm.value.user_id = this.currentUser.id;
        this.productForm.value.company_id = this.company_id;
        this.showLoader = true;
        this.quotesRestService
          .putApi(AppApi.quotesUrl + this.quoteId, this.productForm.value)
          .then(async (response) => {
            this.showLoader = false;
            if (response.status === 1 && response.code === 204) {
              this.pageMode = 'editMode';
              this.patchQuoteData(response.data);
              Swal.fire({
                title: response.message,
                icon: 'success',
                timer: 5000,
                position: "top-right",
                toast: true,
                showCancelButton: false,
                showConfirmButton: false
              })
              $('#pills-risk-tab').removeClass('disabled');
              $('#pills-risk-tab').click();
              this.getQuoteDetail.next(response.data);
            } else {
              Swal.fire({
                title: response.message,
                icon: 'error',
                timer: 5000,
                position: "top-right",
                toast: true,
                showCancelButton: false,
                showConfirmButton: false
              })
            }
          });
      }
    } else {
      this.currentUserService.validateAllFormFields(this.productForm);
    }
  }

  /**
   * Function to validate the quote
   */
  validateQuoteProduct() {
    if (this.productForm.value.product_id == '') {
      Swal.fire({
        title: 'Por favor selecione o Produto',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      });
      return false;
    }
    if (this.productForm.value.profession_id == '') {
      Swal.fire({
        title: 'Por favor selecione o Profissão',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      });
      return false;
    }
    if (this.productForm.value.specialty_id == '') {
      Swal.fire({
        title: 'Por favor selecione o Especialidade',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      });
      return false;
    }
    if (this.productForm.value.liability_id == '') {
      Swal.fire({
        title: 'Por favor selecione o Importância Segurada',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      });
      return false;
    }
    if (this.productForm.value.deductible_id == '') {
      Swal.fire({
        title: 'Por favor selecione o Franquia',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      });
      return false;
    }
    return true;
  }

  /**
   * Function to patch options
   * @param id 
   * @param formControlName 
   * @param type 
   */
  selectOption(id, formControlName, type) {
    $('.' + type).removeClass('active');
    this.productForm.controls[formControlName].patchValue(id);
    
    if (formControlName == 'profession_id') {
      this.filterDropDownList(this.selectedCustomerType, id, this.allDropdownList);
      this.getSelectedProfession.next(id);

      this.selectedSpecilaityId = '';
      this.selectedLibilityId = '';
      this.selectedDeductibleId = '';
      this.productForm.patchValue({
        specialty_id: '',
        liability_id: '',
        deductible_id: ''
      });
      const index = this.professionalListFilter.findIndex(profession => profession.id == id);
      if (index !== -1) {
        this.quotesData.profession = this.professionalListFilter[index];
      }
    } else if (formControlName == 'specialty_id') {
      const index = this.specialtyListFilter.findIndex(specialty => specialty.id == id);
      if (index !== -1) {
        this.quotesData.specialty = this.specialtyListFilter[index];
      }
    } else if (formControlName == 'liability_id') {
      const index = this.liabilityListFilter.findIndex(liability => liability.id == id);
      if (index !== -1) {
        this.quotesData.liability = this.liabilityListFilter[index];
      }
    } else if (formControlName == 'deductible_id') {
      const index = this.deductibleListFilter.findIndex(deductible => deductible.id == id);
      if (index !== -1) {
        this.quotesData.deductible = this.deductibleListFilter[index];
      }
    }
  }

  /**
   * Function to get the quote details on create update quote
   * @param quoteData 
   */
  getQuoteDetails(quoteData) {
    this.quoteId = quoteData.id;
    this.quotesData = quoteData;
    this.selectedCustomerType = quoteData.customer_type == 2 ? '2' : '1';
  }

  /**
   * Back to step one Of quote
   */
  backStep() {
    $('#pills-proponent-tab').click();
  }

}

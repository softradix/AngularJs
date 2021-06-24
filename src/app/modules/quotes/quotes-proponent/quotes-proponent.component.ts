import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { QuotesRestService } from '../../../common/services/quotes/quotes-rest.service';
import { AppApi } from "../../../app-api";
import { CurrentUserService } from "../../../common/services/user/current-user.service";
import Swal from 'sweetalert2';
import { CustomValidators } from '../../../common/directive/custom-validator.directive';
import { Location } from '@angular/common'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { validate, format, generate } from 'cnpj';
import { ChangeDateFormatService } from '../../../common/services/date-picker/change-date-format.service';
import * as moment from 'moment';

@Component({
  selector: 'app-quotes-proponent',
  templateUrl: './quotes-proponent.component.html',
  styleUrls: ['./quotes-proponent.component.scss'],
  providers: [QuotesRestService, ChangeDateFormatService]
})
export class QuotesProponentComponent implements OnInit {

  proponentForm: FormGroup;
  pageMode = 'addMode';
  showLoader: boolean = false;
  @Input() param: any = {};
  @Output() getSelectedCustomerType = new EventEmitter<any>();
  @Output() getQuoteDetail = new EventEmitter<any>();
  company_id: any;
  dateOfFirstContact: { date: { year: number; month: number; day: number; }; };
  quoteData: any = [];
  currentUser;
  quoteId;
  date_formatted;
  date_formatted_1;
  modalRef: BsModalRef;
  address: any = [];
  labelName = 'Razão Social';
  public maskcpf = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public maskcnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public mask = ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  isProponentTabValid: boolean = false;
  showHideAddress: boolean = false;

  constructor(
    public quotesRestService: QuotesRestService,
    public currentUserService: CurrentUserService,
    private location: Location,
    private modalService: BsModalService
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = JSON.parse(currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
  }

  ngOnInit() {
    this.proponentForm = new FormGroup({
      customer_type: new FormControl('2', []),
      customer_company_name: new FormControl('', [Validators.required]),
      cpf: new FormControl('', [Validators.required, CustomValidators.vaildCPF]),
      cnpj: new FormControl('', [Validators.required, CustomValidators.vaildCNPJ]),
      date_of_birth: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, CustomValidators.vaildEmail]),
      phone: new FormControl('', [Validators.required, CustomValidators.validTelephone]),
      is_zipcode_exist: new FormControl(false, []),
      cro: new FormControl('', [Validators.required]),
      zip_code: new FormControl('', [Validators.required]),
      customer_address: new FormControl('', [Validators.required]),
      customer_address_number: new FormControl('', [Validators.required]),
      customer_address_add_info: new FormControl('', []),
      district: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required])
    });
    this.pageMode = this.param.pageMode;
  }

  /**
   * Function to filter dropdowns
   * @param type 
   */
  filterDropDownList(type) {
    this.labelName = type == 2 ? 'Razão Social' : 'Nome Completo';
    if (type == 1) {
      this.proponentForm.controls.cpf.setErrors({
        required: true
      });
      this.proponentForm.controls.date_of_birth.setErrors({
        required: true
      });
      this.proponentForm.controls.cnpj.setErrors(null);
    } else if (type == 2) {
      this.proponentForm.controls.date_of_birth.setErrors(null);
      this.proponentForm.controls.cpf.setErrors(null);
      this.proponentForm.controls.cnpj.setErrors({
        required: true
      });
    }
  }

  /**
   * Function to patch quote data
   */
  patchQuoteData(quoteData) {
    this.quoteId = quoteData.id;
    if (this.pageMode == 'editMode') {
      this.showHideAddress = true;
      this.isProponentTabValid = true;
      this.labelName = quoteData.customer_type == 2 ? 'Razão Social' : 'Nome Completo';
      this.proponentForm.patchValue({
        customer_type: quoteData.customer_type == 2 ? '2' : '1',
        customer_company_name: quoteData.customer_company_name,
        email: quoteData.email,
        date_of_birth: quoteData.date_of_birth ? moment(quoteData.date_of_birth).format('DD/MM/YYYY') : null,
        cro: quoteData.cro,
        zip_code: quoteData.zip_code,
        is_zipcode_exist: quoteData.is_zipcode_exis,
        customer_address: quoteData.customer_address,
        customer_address_number: quoteData.customer_address_number,
        customer_address_add_info: quoteData.customer_address_add_info,
        district: quoteData.district,
        city: quoteData.city,
        state: quoteData.state,
        phone: quoteData.phone
      });

      if (quoteData.is_zipcode_exist) {
        this.proponentForm.controls.zip_code.setErrors(null);
        this.proponentForm.controls.zip_code.disable();
      }
      if (quoteData.customer_type == 1) {
        this.proponentForm.patchValue({ cpf: quoteData.cpf });
      } else if (quoteData.customer_type == 2) {
        this.proponentForm.patchValue({
          cnpj: quoteData.cnpj
        });
        this.proponentForm.controls.date_of_birth.setErrors(null);
      }
    }
  }

  /**
   * Submit the save/update Quotes
   * @param pageMode // this variable is used to set the form action
   */
  addEditQuotesButtonClicked(pageMode) {
    if (pageMode === 'addMode') {
      this.createQuote();
    }
    else if (pageMode === 'editMode') {
      this.updateQuote();
    }
  }

  /**
   * function to create Quotes
   */
  createQuote() {
    if (this.proponentForm.valid) {
      this.proponentForm.value.user_id = this.currentUser.id;
      this.proponentForm.value.company_id = this.company_id;

      this.proponentForm.value.date_of_birth = this.date_formatted;
      if (this.proponentForm.value.customer_type == 1) {
        delete this.proponentForm.value.cnpj;
      } else if (this.proponentForm.value.customer_type == 2) {
        delete this.proponentForm.value.cpf;
        delete this.proponentForm.value.date_of_birth;
      }

      this.showLoader = true;
      this.quotesRestService
        .postApi(AppApi.quotesUrl, this.proponentForm.value)
        .then(async (response) => {
          this.showLoader = false;
          if (response.status === 1 && response.code === 201) {
            this.isProponentTabValid = true;
            Swal.fire({
              title: response.message,
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.quoteData = response.data;
            this.quoteId = response.data.id;
            this.pageMode = 'editMode';
            this.getQuoteDetail.next(response.data);
            $('#pills-product-tab').removeClass('disabled');
            $('#pills-product-tab').click();
            this.location.replaceState("/quotes/edit/" + btoa(this.quoteId));
          } else if (response.status === 0 && response.code === 201) {
            if (response.message == "CPF/CNPJ already exist") {
              $('#alertCNPJButton').click();
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
    } else {
      this.currentUserService.validateAllFormFields(this.proponentForm);
    }
  }

  /**
   * function to update quotes
   */
  updateQuote() {
    if (this.proponentForm.valid) {
      this.proponentForm.value.user_id = this.currentUser.id;
      this.proponentForm.value.company_id = this.company_id;
      this.proponentForm.value.date_of_birth = this.date_formatted;
      if (this.proponentForm.value.customer_type == 1) {
        delete this.proponentForm.value.cnpj;
      } else if (this.proponentForm.value.customer_type == 2) {
        delete this.proponentForm.value.cpf;
        delete this.proponentForm.value.date_of_birth;
      }

      this.showLoader = true;
      this.quotesRestService
        .putApi(AppApi.quotesUrl + this.quoteId, this.proponentForm.value)
        .then(async (response) => {
          this.showLoader = false;
          if (response.status === 1 && response.code === 204) {
            Swal.fire({
              title: response.message,
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.quoteData = response.data;
            this.getQuoteDetail.next(response.data);
            $('#pills-product-tab').removeClass('disabled');
            $('#pills-product-tab').click();
          } else if (response.status === 0 && response.code === 204) {
            this.showLoader = false;
            Swal.fire({
              title: response.message,
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
          } else {
            if (response.message == "CPF/CNPJ already exist") {
              $('#alertCNPJButton').click();
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

          }
        });
    } else {
      this.currentUserService.validateAllFormFields(this.proponentForm);
    }
  }

  /**
   * Function to get the address using zipcode
   */
  getAddress(zipcode) {
    if (zipcode) {
      this.showLoader = true;
      this.quotesRestService
        .getApi(AppApi.addressUrl + zipcode)
        .then((response) => {
          this.showLoader = false;
          this.showHideAddress = true;
          if (response.status === 1 && response.code === 200) {
            this.address = response.data;
            this.proponentForm.patchValue({
              district: this.address.bairro,
              state: this.address.uf,
              city: this.address.localidade,
              customer_address: this.address.logradouro,
              customer_address_add_info: this.address.complemento
            })
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
  }

  /**
   * On click zipcode
   * @param event 
   */
  onClickZipCode(event) {
    if (event.target.checked) {
      this.proponentForm.patchValue({
        zip_code: '',
        customer_address_add_info: '',
        district: '',
        state: '',
        city: '',
        customer_address: ''
      })
      this.proponentForm.controls.zip_code.setErrors(null);
      this.proponentForm.controls.zip_code.disable();
    } else {
      this.proponentForm.controls.zip_code.setErrors({ required: true });
      this.proponentForm.controls.zip_code.enable();
    }
  }

  /**
   * Function to validate the proponent tab
   */
  validateProponentTab(tabId) {
    if (this.isProponentTabValid) {
      $('#pills-product-tab').removeClass('disabled');
      $('#pills-product-tab').click();
    } else {
      this.currentUserService.validateAllFormFields(this.proponentForm);
    }
  }

  /**
   * FilterDropdown on change customer type
   * @param type 
   */
  onChangeCutomerType(type) {
    this.labelName = type == 2 ? 'Razão Social' : 'Nome Completo';
    this.getSelectedCustomerType.next(type);
    if (type == 1) {
      this.proponentForm.controls.cnpj.setErrors(null);
    }
  }

  /**
   * Back to step one Of quote
   */
  backStep() {
    $('#pills-proponent-tab').click();
  }

  /**
  * Function to open model
  * @param modelId 
  */
  openModel(modelId: TemplateRef<any>, type) {
    this.modalRef = this.modalService.show(modelId);
  }

  /**
   * Function to close model
   * @param type 
   */
  closeModal(type) {
    this.modalRef.hide();
  }

  /**
   * Function to validate the cnpj
   * @param cnpj 
   */
  cnpjValidate(cnpj) {
    if (cnpj) {
      const valid = validate(cnpj); // true
      if (!valid) {
        this.proponentForm.controls.cnpj.setErrors({
          inValidCnpj: true
        });
      } else {
        this.proponentForm.controls.cnpj.setErrors(null);
      }
    } else {
      this.proponentForm.controls.cnpj.setErrors({ required: true });
    }
  }

  /**
  * Patch date picker value
  * @param formControlName form control name
  * @param datePickerValue input value
  */
  setDatePickerValueOnChange(formControlName) {
    if (formControlName && (/^\d+$/.test(formControlName)) && !(/\/.*\//.test(formControlName))
    ) {
      var dateStr = formControlName;
      var match = dateStr.match(/(\d{2})(\d{2})(\d{4})/);

      var betterDateStr = match[1] + '/' + match[2] + '/' + match[3];

      if (betterDateStr != "") {
        let that = this
        function getAge(birthDateString) {
          var today = new Date();
          var dateString = birthDateString;
          var dateParts = dateString.split("/");
          var birthDate = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
          let dateformatted = moment(birthDate).format('YYYY-MM-DD');
          that.date_formatted = dateformatted;
          var age = today.getFullYear() - birthDate.getFullYear();
          var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        }

        if (getAge(betterDateStr) >= 18) {
        } else {
          this.proponentForm.controls.date_of_birth.setErrors({
            dateCheck: true
          });
        }
      } else {
        alert("por favor forneça sua data de nascimento válida");
      }
    }
  }
}
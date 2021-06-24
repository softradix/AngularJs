import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { CurrentUserService } from "../../../common/services/user/current-user.service";
import { AuthRestService } from "../../../common/services/auth/auth-rest.service";
import { AppApi } from "../../../app-api";
import { ToastrService } from "ngx-toastr";
import { Title } from "@angular/platform-browser";
import { CustomValidators } from "../../../common/directive/custom-validator.directive";
import { ChangeDateFormatService } from '../../../common/services/date-picker/change-date-format.service';
import Swal from 'sweetalert2';
import { validate, format, generate } from 'cnpj';

@Component({
  selector: 'app-company-add-edit',
  templateUrl: './company-add-edit.component.html',
  styleUrls: ['./company-add-edit.component.scss']
})
export class CompanyAddEditComponent implements OnInit {
  companyEditForm: FormGroup;
  pageMode = 'addMode';
  pageTitle = 'Adicionar Novo companhia';
  companyFoundationYear: { date: { year: number; month: number; day: number; }; };
  showLoader: boolean = false;
  dateChange;
  currentUser;
  userId: string;
  cityList = [];
  address: any = [];
  fileData;
  stateList = [];
  public maskcnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public mask = ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  constructor(
    private title: Title,
    private router: Router,
    public currentUserService: CurrentUserService,
    public authRestService: AuthRestService,
    public toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private changeDateFormatService: ChangeDateFormatService
  ) {
    this.title.setTitle("Company Edit");
  }

  ngOnInit() {
    this.companyEditForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      surname: new FormControl("", []),
      company_name: new FormControl("", [Validators.required]),
      company_reg_no: new FormControl("", [Validators.required]),
      company_foundation_year: new FormControl('', [Validators.required]),
      cnpj: new FormControl('', [Validators.required, CustomValidators.vaildCNPJ]),
      phone: new FormControl('', [Validators.required, CustomValidators.validTelephone]),
      company_address: new FormControl('', [Validators.required]),
      address_number: new FormControl('', [Validators.required]),
      company_address_addinfo: new FormControl('', []),
      district: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      zipcode: new FormControl('', [Validators.required]),
      email: new FormControl("", [Validators.required, CustomValidators.vaildEmail])
    });
    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.currentUser = atob(params.id);
        if (this.activatedRoute.snapshot.url[0].path === 'edit') {
          this.pageMode = 'editMode';
          this.pageTitle = 'Editar companhia';
        }
        this.getCompanyById(this.currentUser);
      }
    });
  }

  /**
  * Submit the save/update Quotes
  * @param pageMode // this variable is used to set the form action
  */
  addEditQuotesButtonClicked(pageMode) {
    if (pageMode === 'addMode') {
      this.createCompany();
    }
    else if (pageMode === 'editMode') {
      this.updateCompany();
    }
  }

  /**
   * Function to add new company
   */
  createCompany() {
    if (this.companyEditForm.valid) {
      if (this.dateChange) {
        this.companyEditForm.value.company_foundation_year = this.companyEditForm.value.company_foundation_year ? this.changeDateFormatService.convertDateObjectToString(this.companyEditForm.value.company_foundation_year) : null;
        this.dateChange = false;
      }
      this.showLoader = true;
      this.authRestService
        .postApi(`${AppApi.CreateCompany}`, this.companyEditForm.value)
        .then((response) => {
          this.showLoader = false;
          if (response.code === 201 && response.status === 1) {
            this.router.navigateByUrl("/company")
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
      this.currentUserService.validateAllFormFields(this.companyEditForm);
    }
  }

  /**
   * Function for update company details by company id
   */
  updateCompany() {
    if (this.companyEditForm.valid) {
      delete this.companyEditForm.value.confirm_password;
      if (this.dateChange) {
        this.companyEditForm.value.company_foundation_year = this.companyEditForm.value.company_foundation_year ? this.changeDateFormatService.convertDateObjectToString(this.companyEditForm.value.company_foundation_year) : null;
        this.dateChange = false;
      }
      this.showLoader = true;
      this.authRestService
        .putApi(`${AppApi.getBrokerDetail}${this.currentUser}`, this.companyEditForm.value)
        .then((response) => {
          this.showLoader = false;
          if (response.code === 204) {
            this.router.navigateByUrl("/company")
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
      this.currentUserService.validateAllFormFields(this.companyEditForm);
    }
  }

  /**
   * Function to get the user details
   * @param id 
   */
  getCompanyById(id) {
    this.authRestService.getApi(AppApi.getBrokerDetail + id).then((response: any) => {
      this.showLoader = false;
      if (response.code === 200 && response.status === 1) {
        if (response.status === 1) {
          if (response.data.company_foundation_year) {
            this.companyFoundationYear = this.changeDateFormatService.convertStringDateToObject(response.data.company_foundation_year);
          }
          this.companyEditForm.patchValue({
            name: response.data.name,
            surname: response.data.surname,
            company_name: response.data.company_name,
            company_reg_no: response.data.company_reg_no,
            company_foundation_year: response.data.company_foundation_year,
            cnpj: response.data.cnpj,
            company_address_addinfo: response.data.company_address_addinfo,
            zipcode: response.data.zipcode,
            phone: response.data.phone,
            company_address: response.data.company_address,
            address_number: response.data.address_number,
            district: response.data.district,
            city: response.data.city,
            state: response.data.state,
            email: response.data.email,
            commission: response.data.commission
          })
        } 
      } else {
        Swal.fire({
          title: 'Seguradora não encontrada.',
          icon: 'error',
          timer: 5000,
          position: "top-right",
          toast: true,
          showCancelButton: false,
          showConfirmButton: false
        })
      }
    })
  }

  /**
  * Function to get the address using zipcode
  */
  getAddress(zipcode) {
    if (zipcode) {
      this.showLoader = true;
      this.authRestService
        .getApi(AppApi.addressUrl + zipcode)
        .then((response) => {
          this.showLoader = false;
          if (response.status === 1 && response.code === 200) {
            this.address = response.data;
            this.companyEditForm.patchValue({
              district: this.address.bairro,
              state: this.address.uf,
              city: this.address.localidade,
              company_address: this.address.logradouro,
              address_number: '',
              company_address_addinfo: ''
            })
          } else {
            this.companyEditForm.patchValue({
              district: '',
              state: '',
              city: '',
              company_address: '',
              address_number: '',
              company_address_addinfo: ''
            })
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
   * Patch date picker value
   * @param formControlName form control name
   * @param datePickerValue input value
   */
  setDatePickerValueOnChange(formControlName, datePickerValue) {
    if (datePickerValue) {
      const dateData = { date: datePickerValue };
      if (this.companyEditForm.controls[formControlName]) {
        this.dateChange = true;
        this.companyEditForm.controls[formControlName].patchValue(dateData);
      }
    }
  }

  /**
   * Function to validate cnpj
   * @param cnpj 
   */
  cnpjValidate(cnpj) {
    const valid = validate(cnpj); // true
    if (!valid) {
      Swal.fire({
        title: 'Forneça um cnpj válido',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
      this.companyEditForm.controls.cnpj.setErrors({ required: true });
    }
  }

}

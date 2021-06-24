import { Component, OnInit, TemplateRef, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { QuotesRestService } from '../../../common/services/quotes/quotes-rest.service';
import { AppApi } from "../../../app-api";
import { CurrentUserService } from "../../../common/services/user/current-user.service";
import Swal from 'sweetalert2';
import { ChangeDateFormatService } from '../../../common/services/date-picker/change-date-format.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';

@Component({
  selector: 'app-quotes-risk',
  templateUrl: './quotes-risk.component.html',
  styleUrls: ['./quotes-risk.component.scss'],
  providers: [QuotesRestService, ChangeDateFormatService]
})
export class QuotesRiskComponent implements OnInit {
  @Output() validateProductTab = new EventEmitter<any>();
  @Input() param: any = {};
  riskForm: FormGroup;
  quoteListForm: FormGroup;
  showLoader = false;
  pageMode = 'addMode';
  proposal_risks_id: any;
  complaintsListFilter = [];
  deductable = [];
  retroactvity = [];
  retroactivityFilter = [];
  options = [];
  quoteData: any = [];
  complaintId;
  quoteId;
  modalRef: BsModalRef;
  currentUser: any = [];
  quoteListArray: any = [];
  company_id;
  showHideDetails: boolean = false;
  quotesData: boolean;
  quotesDetailsData: any;
  selectedRetroId;
  quotesPayload: { net_insurance_cost: number; commision: number; net_insurance_cost_with_commision: number, total_insurance_cost: number; status: any; retroactivity_id: any; turnover_id: any; education_id: any;specialty_id: any; liability_id: any; deductible_id: any; profession_id: any };
  turnoverList = [];
  customerType: any;
  buttonblock: boolean = false;
  quoteOptions: any[];
  commision: number;
  educationList = [];
  professionId: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public QuotesRestService: QuotesRestService,
    public currentUserService: CurrentUserService,
    private changeDateFormatService: ChangeDateFormatService,
    private modalService: BsModalService,
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = JSON.parse(currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
    this.commision = this.currentUser.commission ? parseInt(this.currentUser.commission) : 15;
  }

  ngOnInit() {
    this.riskForm = new FormGroup({
      risk_one: new FormControl("true", []),
      risk_two: new FormControl("true", []),
      risk_three: new FormControl("true", [Validators.required]),
      risk_four: new FormControl("false", [Validators.required]),
      risk_five: new FormControl("false", [Validators.required]),
      risk_four_desc: new FormControl("", [Validators.required]),
      risk_five_desc: new FormControl("", [Validators.required]),
      retroactivity_id: new FormControl("", [Validators.required]),
      date_of_first_contracting: new FormControl("", [Validators.required]),
      continuity_Date: new FormControl("", [Validators.required]),
      name_of_previous_insurer: new FormControl("", [Validators.required]),
      complaint_id: new FormControl("", [Validators.required]),
      turnover_id: new FormControl("", [Validators.required]),
      education_id: new FormControl("", [Validators.required]),
    })
    this.quoteListForm = new FormGroup({
      quote_id: new FormControl('', [Validators.required]),
    });
    this.activatedRoute.params.subscribe(params => {
      if (params.id) {
        this.quoteId = atob(params.id);
        this.getQuoteRisk(this.quoteId);
      }
    });
  }

  ngAfterViewInit() {
    this.riskForm.controls.risk_four_desc.setErrors(null);
    this.riskForm.controls.risk_five_desc.setErrors(null);
    this.riskForm.controls.complaint_id.setErrors(null);
    this.riskForm.controls.date_of_first_contracting.setErrors(null);
    this.riskForm.controls.continuity_Date.setErrors(null);
    this.riskForm.controls.name_of_previous_insurer.setErrors(null);
    this.riskForm.controls.education_id.setErrors(null);
  }

  /**
   * Function to filter dropdowns
   * @param type 
   */
  filterDropDownList(type, professionId, dropdownList) {
    this.customerType = type;
    this.professionId = professionId;
    if (type) {
      this.complaintsListFilter = dropdownList[0].complaints.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.deductable = dropdownList[0].deuctible.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.retroactvity = dropdownList[0].retroactvity.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.turnoverList = dropdownList[0].turnover.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      this.educationList = dropdownList[0].educations.filter(function (e) {
        return e.type == type && e.profession_id == professionId;
      });
      if (type == 2) { // 2 > Company, 1 > Individual
        this.riskForm.controls.turnover_id.setErrors({
          required: true
        });
        if (professionId == 2) {
          this.riskForm.controls.education_id.setErrors({
            required: true
          });
        } else {
          this.riskForm.controls.education_id.setErrors(null);
        }
      } else {
        this.riskForm.controls.turnover_id.setErrors(null);
        this.riskForm.controls.education_id.setErrors(null);
      }
    }
  }

  /**
   * Set date_of_first_contracting Error For the New/Old isurance
   * @param type 
   */
  isNewInsurance(type) {
    if (type == '1') {
      this.retroactivityFilter = this.retroactvity.filter(function (e) {
        return e.insurance_type == 1;
      });
      this.riskForm.controls.date_of_first_contracting.setErrors(null);
      this.riskForm.controls.name_of_previous_insurer.setErrors(null);
      this.riskForm.controls.continuity_Date.setErrors(null);
      this.riskForm.patchValue({
        retroactivity_id: ''
      })
      this.riskForm.controls.retroactivity_id.setErrors({
        required: true
      });
      
    } else {
      this.retroactivityFilter = this.retroactvity.filter(function (e) {
        return e.insurance_type == 2;
      });
      this.riskForm.patchValue({
        date_of_first_contracting: '',
        name_of_previous_insurer: '',
        continuity_Date: ''
      })
      this.riskForm.controls.retroactivity_id.setErrors(null);
      this.riskForm.controls.date_of_first_contracting.setErrors({
        required: true
      });
      this.riskForm.controls.name_of_previous_insurer.setErrors({
        required: true
      });
      this.riskForm.controls.continuity_Date.setErrors({
        required: true
      });
    }
  }

  /**
   * Get Quote Risk
   * @param quoteId 
   */
  getQuoteRisk(quoteId) {
    this.param.quoteId = quoteId;
    this.QuotesRestService.getApi(AppApi.quoteRiskUrl + quoteId).then((response: any) => {
      if (response.status === 1 && response.code === 200) {
        if (response.data == null) {
          this.riskForm.controls.date_of_first_contracting.setErrors(null);
          this.riskForm.controls.continuity_Date.setErrors(null);
          this.riskForm.controls.name_of_previous_insurer.setErrors(null);
          this.riskForm.controls.complaint_id.setErrors(null);
        } else {
          this.proposal_risks_id = response.data.id;
          if (response.data.quote.customer_type == 2) {
            this.riskForm.patchValue({
              turnover_id: response.data.quote.turnover_id
            })
            if (response.data.quote.profession_id == 2) {
              this.riskForm.patchValue({
                education_id: response.data.quote.education_id ? response.data.quote.education_id : ''
              })
            }
          }
          this.riskForm.patchValue({
            risk_one: response.data.risk_one,
            risk_two: response.data.risk_two,
            risk_three: response.data.risk_three,
            risk_four: response.data.risk_four,
            risk_five: response.data.risk_five,
            risk_four_desc: response.data.risk_four_desc,
            risk_five_desc: response.data.risk_five_desc,
          });
          if (response.data.risk_three == 'false') {
            this.riskForm.patchValue({
              date_of_first_contracting: moment(response.data.date_of_first_contracting).format('DD/MM/YYYY'),
              continuity_Date: moment(response.data.continuity_Date).format('DD/MM/YYYY'),
              name_of_previous_insurer: response.data.name_of_previous_insurer
            });
            this.riskForm.controls.retroactivity_id.setErrors(null);
          } else {
            this.riskForm.patchValue({
              retroactivity_id: response.data.quote.retroactivity_id
            })
            this.riskForm.controls.date_of_first_contracting.setErrors(null);
            this.riskForm.controls.continuity_Date.setErrors(null);
            this.riskForm.controls.name_of_previous_insurer.setErrors(null);
          }
          if (response.data.risk_four == 'true') {
            this.riskForm.patchValue({ complaint_id: response.data.complaint_id })
          } else {
            this.riskForm.controls.complaint_id.setErrors(null);
            this.riskForm.controls.risk_four_desc.setErrors(null);
          }
          if (response.data.risk_five == 'false') {
            this.riskForm.controls.risk_five_desc.setErrors(null);
          }
        }
      }
    })
  }

  /**
   * Patch date picker value
   * @param formControlName form control name
   * @param datePickerValue input valuemodalRef: BsModalRef;
   */
  setDatePickerValueOnChange(formControlName, event) {
    if (event && event.target.value) {
      const splitDate = event.target.value.split("/");;
      const finalDate = splitDate[1] + '/' + splitDate[0] + '/' + splitDate[2];
      if (formControlName == 'continuity_Date') {
        const currentDateFormat = ((new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear());
        const SelectedDateFormat = finalDate;
        var date1: any = new Date(currentDateFormat);
        var date2: any = new Date(SelectedDateFormat);
        let diffTime: any = Math.abs(date1 - date2);
        let diffDays: any = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let year = Math.ceil(diffDays / 365);
        let that = this;
        let retroactivity = that.retroactivityFilter.filter(function (e) {
          if (that.professionId == 1 && year > 3) {
            return e.cd == 3 && e.profession_id == that.professionId;
          } else if (that.professionId == 1 && year > 2) {
            return e.cd == 2 && e.profession_id == that.professionId;
          } else if (that.professionId == 2 && year > 2) {
            return e.cd == 2 && e.profession_id == that.professionId;
          } else {
            return e.cd == year;
          }
        });
        this.selectedRetroId = retroactivity[0].id;
      }
      this.riskForm.controls[formControlName].patchValue(event.target.value);
    }
  }

  /**
   * Function to get the quote details
   */
  getQuoteDetails(quoteData) {
    this.quoteData = quoteData;
    this.quoteId = quoteData.id;
    this.selectedRetroId = quoteData.retroactivity_id;
    if("quote_risk" in quoteData && quoteData.quote_risk && quoteData.quote_risk.risk_three == 'false') {
      this.retroactivityFilter = this.retroactvity.filter(function (e) {
        return e.insurance_type == 2;
      });
    } else {
      this.retroactivityFilter = this.retroactvity.filter(function (e) {
        return e.insurance_type == 1;
      });
    }
    
  }

  /**
   * Function to validate the risk tab
   */
  validateRiskTab() {
    if (this.quoteData && this.quoteData.product_id) {
      $('#pills-product-tab').removeClass('disabled');
      $('#pills-risk-tab').removeClass('disabled');
      $('#pills-risk-tab').click();
    } else {
      $('#pills-product-tab').removeClass('disabled');
      $('#pills-product-tab').click();
      this.validateProductTab.next();
    }
  }

  /**
   * Function to save/update quote Risk
   */
  async createUpdateQuoteRisk() {
    if (this.riskForm.valid) {
      this.riskForm.value.quote_id = this.quoteId;
      if (this.riskForm.value.risk_three == 'true') {
        delete this.riskForm.value.date_of_first_contracting;
        delete this.riskForm.value.continuity_Date;
        delete this.riskForm.value.name_of_previous_insurer;
      } else {
        this.riskForm.value.continuity_Date = this.changeDateFormatService.convertDateToDBFormateDate(this.riskForm.value.continuity_Date);
        this.riskForm.value.date_of_first_contracting = this.changeDateFormatService.convertDateToDBFormateDate(this.riskForm.value.date_of_first_contracting);
      }
      if (this.riskForm.value.risk_four == 'false') {
        delete this.riskForm.value.complaint_id;
      }
      await this.calucations(this.quoteData, this.quoteId, this.riskForm.value.complaint_id);
    } else {
      this.currentUserService.validateAllFormFields(this.riskForm);
    }
  }

  /**
   * Calculate the quotes options
   * @param data 
   * @param quotesId 
   */
  async calucations(data, quotesId, complaint_id) {
    let Price = 1000;
    if (this.customerType == 1) {
      Price = this.professionId == 2 ? 500.00 : 800;
    }
    Price = (Price * data.product.value * data.profession.value * data.liability.value * data.specialty.value);

    if (this.selectedRetroId) {
      let that = this;
      let retroactivityData = that.retroactivityFilter.filter(function (e) {
        return e.id == that.selectedRetroId;
      })
      if (retroactivityData && retroactivityData.length) {
        Price = Price * retroactivityData[0].value;
      } 
    }

    if (this.customerType == 2) {
      let that = this;
      let turnoverData = that.turnoverList.filter(function (e) {
        return e.id == that.riskForm.value.turnover_id;
      });
      if (that.professionId == 2 && that.riskForm.value.education_id) {
        let educationData = that.educationList.filter(function (e) {
          return e.id == that.riskForm.value.education_id;
        })
        Price = Price * turnoverData[0].value * educationData[0].value;
      } else {
        Price = Price * turnoverData[0].value;
      }
    }

    if (this.riskForm.value.risk_four == 'true') {
      let that = this;
      let complaintsData = that.complaintsListFilter.filter(function (e) {
        return e.id == complaint_id
      })
      Price = (Price * complaintsData[0].value);
    }
     
    let PriceWithDeducatable = Price * data.deductible.value;

    let finaloption = [{ 'price': PriceWithDeducatable , 'francise': data.deductible.name, 'type': 'original' }];
    if(quotesId > 76) {
      this.commision = 30;
    }
    let commisionPercentage = (100 - this.commision) / 100;
    let finalpercenatge = (PriceWithDeducatable / commisionPercentage);
    let getpercentiagevalue = finalpercenatge - PriceWithDeducatable;
    let finalgetpercentiagevalue = (finalpercenatge / 100) * 7.38;

    this.quoteData.status = 1;
    if (this.riskForm.value.risk_three == 'true') {
      if (this.riskForm.value.complaint_id == 5 || this.riskForm.value.complaint_id == 6 || this.riskForm.value.complaint_id == 9 || this.riskForm.value.complaint_id == 12) {
        this.quoteData.status = 5;
      }
    } 
    if (this.customerType == 2 && this.riskForm.value.turnover_id == 8){
      this.quoteData.status = 5;
    }
    this.quotesPayload = {
      net_insurance_cost: PriceWithDeducatable,
      commision: getpercentiagevalue,
      net_insurance_cost_with_commision: finalpercenatge,
      total_insurance_cost: finalgetpercentiagevalue + finalpercenatge,
      status: this.quoteData.status,
      retroactivity_id: this.selectedRetroId,
      turnover_id: this.customerType == 2 ? this.riskForm.value.turnover_id : null,
      education_id: this.customerType == 2 && this.professionId == 2 ? this.riskForm.value.education_id : null,
      specialty_id: data.specialty_id,
      liability_id: data.liability_id,
      deductible_id: data.deductible_id,
      profession_id: data.profession_id
    }
    let filterDeductable = this.deductable.filter((month, idx) => idx < 3);
    let options = [];
    for (const [i, e] of filterDeductable.entries()) {
      if (e.id == data.deductible.id) {
      } else {
        options.push({ 'price': e.value * Price, 'francise': e.name, 'type': 'optional' });
      }
    }
    let dataOption = finaloption.concat(options);
    await this.saveCaluclateData(dataOption, quotesId);

  }

  /**
   * Create/update quotes options
   * @param dataOption 
   * @param quotesId 
   */
  saveCaluclateData(dataOption, quotesId) {
    this.quoteOptions = [];
    this.QuotesRestService
      .getApi(AppApi.quotesOptions + quotesId)
      .then((response) => {
        if (response.status == 0) {
          for (let index = 0; index <= dataOption.length; index++) {
            if (index <= 2) {
              if(quotesId > 76) {
                this.commision = 30;
              }
              let commisionPercentage = (100 - this.commision) / 100;
              let calValue = dataOption[index].price;
              let finalpercenatge = calValue / commisionPercentage;
              let finalgetpercentiagevalue = (finalpercenatge / 100) * 7.38;
              let data = { quote_id: quotesId, price: finalpercenatge + finalgetpercentiagevalue, franchise: dataOption[index].francise, type: dataOption[index].type };
              this.quoteOptions.push(data);
            }
          }
          this.updateQuoteDetails();
        } else {
          response.data.map((data, key) => {
            if(quotesId > 76) {
              this.commision = 30;
            }
            let calValue = dataOption[key].price;
            let commisionPercentage = (100 - this.commision) / 100;
            let finalpercenatge = calValue / commisionPercentage;
            let finalgetpercentiagevalue = (finalpercenatge / 100) * 7.38;
            let detailsArray = { id: data.id, quote_id: this.quoteId, price: finalpercenatge + finalgetpercentiagevalue, franchise: dataOption[key].francise, type: dataOption[key].type };
            this.quoteOptions.push(detailsArray);
          })
          this.updateQuoteDetails();
        }
      })
  }

  /**
   * Function to update the quote details
   */
  updateQuoteDetails() {
    this.quotesPayload['risks'] = this.riskForm.value;
    this.quotesPayload['quoteOptions'] = this.quoteOptions;
    this.QuotesRestService
      .putApi(AppApi.quotesUrl + this.quoteId, this.quotesPayload)
      .then(async (response) => {
        this.showLoader = false;
        if (response.code === 204 && response.status == 1) {
          this.quotesDetailsData = response.data;
          this.showHideDetails = true;
          if (response.data.quote_risk && (response.data.quote_risk.complaint_id == 5 || response.data.quote_risk.complaint_id == 6 || response.data.quote_risk.complaint_id == 9 || response.data.quote_risk.complaint_id == 12)) {
            this.buttonblock = true;
          }
          if (response.data.turnover_id == 8) {
            this.buttonblock = true;
          }
          $('#quoteDetailsButton').trigger('click');
          Swal.fire({
            title: response.message,
            icon: 'success',
            timer: 5000,
            position: "top-right",
            toast: true,
            showCancelButton: false,
            showConfirmButton: false
          })
        } else if (response.code === 401) {
          Swal.fire({
            title: response.message,
            icon: 'error',
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
      })

  }

  getQuoteId(quoteId) {
    this.quoteId = quoteId;
  }

  /**
   * Function to set/unset the risk validation
   * @param value 
   */
  onCheckRadio(value, formControlName) {
    if (formControlName == 'risk_four') {
      if (value) {
        this.riskForm.controls.complaint_id.setErrors({ required: true });
        this.riskForm.controls.risk_four_desc.setErrors({ required: true });
      } else {
        this.riskForm.controls.complaint_id.setErrors(null);
        this.riskForm.controls.risk_four_desc.setErrors(null);
      }
    } else if (formControlName == 'risk_five') {
      if (value) {
        this.riskForm.controls.risk_five_desc.setErrors({ required: true });
      } else {
        this.riskForm.controls.risk_five_desc.setErrors(null);
      }
    }
  }

  /**
   * Function to open model
   * @param modelId 
   */
  openModel(modelId: TemplateRef<any>, type) {
    if (type == 'quoteList') {
      this.quoteListArray = [];
      this.QuotesRestService.getApi(AppApi.quotesUrl + 'list/' + this.currentUser.id + '/' + this.company_id).then((response: any) => {
        if (response.code === 200 && response.data.length > 0) {
          for (const data of response.data) {
            this.quoteListArray.push({ id: data.id, name: data.customer_company_name });
          }
          this.modalRef = this.modalService.show(modelId);
          this.quoteListForm.patchValue({ quote_id: this.quoteId });
        } else {
          Swal.fire({
            title: 'Crie cotações para criar a proposta.',
            icon: 'error',
            timer: 5000,
            position: "top-right",
            toast: true,
            showCancelButton: false,
            showConfirmButton: false
          })
        }
      })
    } else {
      this.modalRef = this.modalService.show(modelId);
    }
  }

  /**
   * Function to close model
   * @param type 
   */
  closeModel(type) {
    this.modalRef.hide();
  }

  /**
   * Function to open crete proposal page
   */
  createProposal() {
    if (this.quoteListForm.valid) {
      this.modalRef.hide();
      this.router.navigateByUrl('/proposals/add/' + btoa(this.quoteId));
    } else {
      this.currentUserService.validateAllFormFields(this.quoteListForm);
    }
  }

  /**
   * Function to patch dropdown value
   * @param selectedValue selected value
   */
  valueChanged(selectedValue, formControlName) {
    if (formControlName == 'quote_id') {
      this.quoteId = selectedValue;
    } else if (formControlName == 'complaint_id') {
      if (selectedValue) {
        if (selectedValue == 5 || selectedValue == 6 || selectedValue == 9 || selectedValue == 12) {
          $('#riskOutOfAcceptanceButton').click();
        }
        this.complaintId = selectedValue;
      }
    } else if (formControlName == 'turnover_id') {
      if (selectedValue == 8) {
        $('#riskOutOfAcceptanceButton').click();
      }
    } else if (formControlName == 'retroactivity_id') {
      this.selectedRetroId = selectedValue;
    }
  }

  /**
   * Back to step second Of quote
   */
  backStep() {
    $('#pills-product-tab').click();
  }

  /**
   * Function to close the quote detail modal and redirect to qotelist page
   */
  closeQuoteDetailModal() {
    this.modalRef.hide();
    this.router.navigateByUrl('/quotes');
  }

  /**
   * Function to open proposal create modal 
   */
  openCreateProposalModal() {
    this.modalRef.hide();
    $('#quoteListButton').trigger('click');
  }

  /**
   * Function to open add proposal screen
   */
  addProposal() {
    this.modalRef.hide();
    this.router.navigateByUrl('/proposals/add/' + btoa(this.quoteId));
  }

}

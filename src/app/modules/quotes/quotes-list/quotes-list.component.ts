import { Component, OnInit, ViewChild, Renderer, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DatatableService } from '.././../../common/services/data-table/datatable.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Title } from "@angular/platform-browser";
import { ChangeDateFormatService } from '../../../common/services/date-picker/change-date-format.service';
import { AppApi } from '../../../app-api';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { QuotesRestService } from '../../../common/services/quotes/quotes-rest.service';
import Swal from 'sweetalert2';
import { ExcelService } from '../../../common/services/excel/excel.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";
import { CurrentUserService } from "../../../common/services/user/current-user.service";

@Component({
  selector: 'app-quotes-list',
  templateUrl: './quotes-list.component.html',
  styleUrls: ['./quotes-list.component.scss'],
  providers: [DatatableService, ConfirmDialogService, QuotesRestService, ChangeDateFormatService]
})

export class QuotesListComponent implements OnInit {
  @ViewChild('innerHTML', { static: false }) innerHTML: any;
  quoteId: any;
  QuotesListPDF;
  buttonblock = false;
  showLoader = false;
  listener: Function;
  managerId;
  hidden = false;
  validity;
  quotesDataExist: Boolean = false;
  quotesData: any = [];
  quoteListArray: any = [];
  QuotesList: any = [];
  currentUser: any = [];
  QuotesListOptions;
  modalRef: BsModalRef;
  filterOptionsList: any = [{ id: 0, name: 'TODOS' }, { id: 1, name: 'ATIVO' }, { id: 2, name: 'EXPIRADO' }, { id: 3, name: 'EMITIDO' }, { id: 4, name: 'RASCUNHO' }, { id: 5, name: 'NEGADO' }, { id: 6, name: 'EM EMISSÃO' }, { id: 7, name: 'CANCELADO' }];
  company_id;
  shareQuoteUrl;
  selectedStatus: number = 0;
  administrator: string = '0';
  quotesCount: number = 0;
  formatedPrice = 'R$ 0.000,00';
  showHideDetails: boolean = false;
  deviceType: string;
  constructor(
    private title: Title,
    private renderer: Renderer,
    private router: Router,
    public quotesRestService: QuotesRestService,
    public currentUserService: CurrentUserService,
    private datatableService: DatatableService,
    private modalService: BsModalService,
    private excelService: ExcelService,
    private changeDateFormatService: ChangeDateFormatService
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = JSON.parse(currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
    this.deviceType = localStorage.getItem('deviceType');
    if (this.currentUser.role_id == 2) {
      this.administrator = this.currentUser.user_access ? this.currentUser.user_access.administrator : '0';
    }
  }

  ngOnInit() {
    this.title.setTitle('Quotes');
    //this.deactivateQuoteAfter15Days() // function to deactivate quote status after 15 days
    if (this.currentUser.role_id == 3) {
      this.getQuotesListAdmin();
    } else {
      this.getQuotesList();
    }

    this.getQuoteCount();
  }

  ngAfterViewInit(): void {
    this.listener = this.renderer.listenGlobal('document', 'click', (event) => {
      if (event.target.getAttribute('href') === 'quote-list' || event.target.getAttribute('href') === 'quote-list-history') {
        if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'edit') {
          this.editQuote(event.target.getAttribute('data-id'));
        } else if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'view') {
          this.quoteId = event.target.getAttribute('data-id');
          this.viewQuoteDetail(this.datatableService.selectedRow)
        } else if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'share') {
          this.quoteId = event.target.getAttribute('data-id');
          this.shareQuoteUrl = AppApi.frontEndBaseUrl + 'quote-detail/' + btoa(this.quoteId);
          this.shareQuoteDetail(this.datatableService.selectedRow.status)
        } else if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'download') {
          this.quoteId = event.target.getAttribute('data-id');
          this.downloadQuotePdf(this.datatableService.selectedRow.status)
        } else if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'history') {
          this.quoteId = event.target.getAttribute('data-id');
          this.getQuotesHistoryList(this.quoteId);
        }
      } else if (event.target.getAttribute('id') === 'active-inactive') {
        if (this.currentUser && this.currentUser.role_id == 3) { //OnlY Admin Can Active/Deactive Quote
          this.ativeDeactivateQuote(this.datatableService.selectedRow.id, this.datatableService.selectedRow.status);
        }
      }
    });
  }

  /**
   * Function call to destroy the listener
   */
  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }

  /**
   * Function To Get Quotes List for super admin
   */
  getQuotesListAdmin() {
    const tableActions = [
      { name: 'view', class: 'btn btn-light', img: 'eye.svg', title: 'ver cotação' },
      { name: 'edit', class: 'btn btn-light backs-hide', img: 'pencil-edit-button.svg', title: 'Editar' },
      { name: 'share', class: 'btn btn-light', img: 'share.svg', title: 'Compartilhar' },
      { name: 'download', class: 'btn btn-light', img: 'down-arrow.svg', title: 'baixar PDF' },
      { name: 'history', class: 'btn btn-light', img: 'history.svg', title: 'histórico de citações' }
    ];
    const url = AppApi.quotesUrl + 'list/';
    const reqParam = [
      { key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }, //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
      { key: 'company_id', value: this.company_id },
      { key: 'status', value: this.selectedStatus },
      { key: 'created_by_id', value: this.currentUser.created_by_id },
      { key: 'administrator', value: this.administrator }
    ];
    const tableColumns = [
      { title: 'ID #', data: 'id' },
      { title: 'CORRETOR', data: 'user.company_name' },
      { title: 'PROPONENTE', data: 'customer_company_name' },
      { title: 'Produto', data: 'productname' }, //product.name
      { title: 'Profissão', data: 'professionname' }, //profession.name
      { title: 'Prêmio', data: 'total_insurance_cost' },
      { title: 'Data de Criação', data: 'created_at' },
      { title: 'Status', data: 'status' },
      { title: 'Ações', data: 'id' },
    ];
    if (!$.fn.dataTable.isDataTable('#quote-list')) {
      this.datatableService.commonDataTable('quote-list', url, 'full_numbers', tableColumns, 10, true, true, 'lt', 'irp', undefined, [0, 'undefined'], '', reqParam, tableActions, 8, [6], '', [5], [7], [], [], []);
    } else {
      this.datatableService.commonDataTableReload('quote-list', url, reqParam);
    }
  }

  /**
   * Function To Get Quotes List for brokers users
   */
  getQuotesList() {
    const tableActions = [
      { name: 'view', class: 'btn btn-light', img: 'eye.svg', title: 'ver cotação' },
      { name: 'edit', class: 'btn btn-light backs-hide', img: 'pencil-edit-button.svg', title: 'Editar' },
      { name: 'share', class: 'btn btn-light', img: 'share.svg', title: 'Compartilhar' },
      { name: 'download', class: 'btn btn-light', img: 'down-arrow.svg', title: 'baixar PDF' },
      { name: 'history', class: 'btn btn-light', img: 'history.svg', title: 'histórico de citações' }
    ];
    const url = AppApi.quotesUrl + 'list/';
    const reqParam = [
      { key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }, //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
      { key: 'company_id', value: this.company_id },
      { key: 'status', value: this.selectedStatus },
      { key: 'created_by_id', value: this.currentUser.created_by_id },
      { key: 'administrator', value: this.administrator }
    ];
    const tableColumns = [
      { title: 'ID #', data: 'id' },
      { title: 'PROPONENTE', data: 'customer_company_name' },
      { title: 'Produto', data: 'productname' }, //product.name
      { title: 'Profissão', data: 'professionname' }, //profession.name
      { title: 'Prêmio', data: 'total_insurance_cost' },
      { title: 'Data de Criação', data: 'created_at' },
      { title: 'Status', data: 'status' },
      { title: 'Ações', data: 'id' },
    ];
    if (!$.fn.dataTable.isDataTable('#quote-list')) {
      this.datatableService.commonDataTable('quote-list', url, 'full_numbers', tableColumns, 10, true, true, 'lt', 'irp', undefined, [0, 'undefined'], '', reqParam, tableActions, 7, [5], '', [4], [6], [], [], []);
    } else {
      this.datatableService.commonDataTableReload('quote-list', url, reqParam);
    }
  }

  /**
   * Function to get quote count
   */
  getQuoteCount() {
    let searchFor = $("input[type='search']").val();
    const requestData = {
      user_id: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id,
      company_id: this.company_id,
      status: this.selectedStatus,
      created_by_id: this.currentUser.created_by_id,
      administrator: this.administrator,
      search: { value: searchFor, regex: false },
    };
    this.showLoader = true;
    this.quotesRestService.postApi
      (AppApi.quotesUrl + 'list/count/', requestData).then((response: any) => {
        this.showLoader = false;
        if (response.code === 201) {
          this.quotesCount = response.data.quoteCount;
          this.formatedPrice = response.data.sumofQuote > 0 ? response.data.sumofQuote.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : this.formatedPrice;
        }
      });
  }

  /**
   * Function to open edit quote page
   * @param quoteId 
   */
  editQuote(quoteId) {
    this.router.navigateByUrl(`/quotes/edit/${btoa(quoteId)}`);
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
  closeModel(type) {
    this.modalRef.hide();
  }

  /**
   * Function to open share quotes model
   * @param shareQuote 
   */
  openShareQuoteModel(shareQuote: TemplateRef<any>) {
    this.modalRef = this.modalService.show(shareQuote);
  }

  /**
   * Function to close share quotes model
   * @param shareQuote 
   */
  closeShareQuoteModel(shareQuote: TemplateRef<any>) {
    this.modalRef.hide();
  }

  /**
   * Function to download quote pdf
   * @param quoteId 
   */
  downloadQuotePdf(status) {
    if (status == 'RASCUNHO') {
      Swal.fire({
        title: 'Por favor, complete a cotação',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
    } else {
      this.showLoader = true;
      this.quotesRestService
        .getApi(AppApi.quotesUrl + this.quoteId)
        .then((response) => {
          this.showLoader = false;
          if (response.data.quote_options.length > 0) {
            response.data.quote_options.forEach(element => {
              element.price = element.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              element.franchise = element.franchise.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            });
            this.quotesData = response.data;
            if (this.quotesData.quote_risk && this.quotesData.quote_risk.risk_three == 'false') {
              this.quotesData.quote_risk.date_of_first_contracting = this.quotesData.quote_risk.date_of_first_contracting ? this.changeDateFormatService.dateFormate(this.quotesData.quote_risk.date_of_first_contracting) : '';
              this.quotesData.quote_risk.continuity_Date = this.quotesData.quote_risk.continuity_Date ? this.changeDateFormatService.dateFormate(this.quotesData.quote_risk.continuity_Date) : ''
            }
            this.quotesDataExist = true;
          }
          var str = this.quotesData.retroactivity ? this.quotesData.retroactivity.name : '';
          if (str != 'none') {
            var res = str.split(" ");
            this.validity = res[0] * 12;
          } else {
            this.validity = 12;
          }
          setTimeout(() => {
            $('#quotesPdfDetail').trigger('click');
          }, 100);

        })
    }
  }

  /**
   * Function to copy quote
   */
  copyLink(val: string) {
    this.datatableService.copyLink(val, 'Copiada!');
    /*  this.modalRef.hide(); */
  }

  /**
   * Filter List
   * @param event 
   */
  filterList(event) {
    if (event) {
      this.selectedStatus = event;
      this.getQuotesList();
    } else {
      this.selectedStatus = 0;
      this.getQuotesList();
    }
  }

  /**
   * Function to export quote
   */
  exportQuotes(type) {
    let quoteExcelData = [];
    let searchFor = $("input[type='search']").val();
    const requestData = {
      start: 0,
      length: this.datatableService.resultCount,
      user_id: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id,
      company_id: this.company_id,
      status: this.selectedStatus,
      created_by_id: this.currentUser.created_by_id,
      administrator: this.administrator,
      search: { value: searchFor, regex: false },
    };
    this.showLoader = true;
    this.quotesRestService.postApi
      (AppApi.quotesUrl + 'list/', requestData).then((response: any) => {
        this.showLoader = false;
        if (response.code === 201) {
          if (type == 'export') {
            for (const resultData of response.data) {
              switch (resultData.status) {
                case 1: {
                  resultData.status = 'ATIVO';
                  break;
                }
                case 2: {
                  resultData.status = 'EXPIRADO';
                  break;
                }
                case 3: {
                  resultData.status = 'EMITIDO'; 
                  break;
                }
                case 4: {
                  resultData.status = 'RASCUNHO'; 
                  break;
                }
                case 5: {
                  resultData.status = 'NEGADO';
                  break;
                }
                case 6: {
                  resultData.status = 'EM EMISSÃO'; 
                  break;
                }
                default: {
                  //statements; 
                  break;
                }
              }
              quoteExcelData.push({
                'ID #': resultData.id,
                'STATUS': resultData.status,
                'CORRETOR': resultData.user && resultData.user.name ? resultData.user.name : '',
                'CORRETOR COMISSÃO': resultData.user && resultData.user.commission ? resultData.user.commission + ' %' : '',
                'PROPONENTE': resultData.customer_company_name,
                'TIPO DE PROPONENTE': resultData.customer_type == 2 ? 'Seguro para Pessoa Jurídica' : 'Seguro para Individuo',
                'TIPO DE SEGURO': resultData.quote_risk && resultData.quote_risk.risk_three == 'true' ? 'Seguro Novo' : 'Renovação',
                'DATA DE NASCIMENTO': resultData.customer_type == 1 ? resultData.date_of_birth : '',
                'TURNOVER': resultData.turnover && resultData.turnover.name ? resultData.turnover.name : '',
                'Endereço': resultData.customer_address,
                'NÚMERO': resultData.customer_address_number,
                'BAIRRO': resultData.district,
                'CIDADE': resultData.city,
                'UF': resultData.state,
                'CEP': resultData.zip_code,
                'PRODUTO': resultData.product ? resultData.product.name : '',
                'PROFISSÃO': resultData.profession ? resultData.profession.name : '',
                'ESPECIALIDADE': resultData.specialty && resultData.specialty.name ? resultData.specialty.name : '',
                'QUAL LIMITE VOCÊ DESEJA': resultData.liability && resultData.liability.name ? resultData.liability.name : '',
                'FRANQUIA': resultData.deductible && resultData.deductible.name ? resultData.deductible.name : '',
                'Prêmio Líquido': resultData.net_insurance_cost_with_commision ? resultData.net_insurance_cost_with_commision.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
                'Prêmio': resultData.total_insurance_cost ? resultData.total_insurance_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
                'Data de Criação': this.changeDateFormatService.dateFormate(resultData.created_at)
              });
            }
            this.excelService.exportAsExcelFile(quoteExcelData, 'quote_list_');
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
  }

  /**
   * Function to deactivate/Active quote
   * @param quoteId 
   */
  ativeDeactivateQuote(quoteId, currentStatus) {
    let status;
    if (currentStatus == 'EXPIRADO') {
      status = 2;
    } else if (currentStatus == 'ATIVO') {
      status = 1;
    } else {
      Swal.fire({
        title: 'Esta citação é ' + currentStatus,
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
      return false;
    }
    this.showLoader = true;
    this.quotesRestService
      .postApi(AppApi.StatusUpdate + quoteId, { status: status })
      .then((response) => {
        this.showLoader = false;
        if (response.status == 1) {
          this.getQuotesList();
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
      })
  }

  /**
   * Function to deactivate quotes after 15 days
   */
  deactivateQuoteAfter15Days() {
    this.quotesRestService.postApi
      (AppApi.quotesUrl + 'status/', {}).then((response: any) => {
      })
  }

  /**
   * Function to view quote details
   * @param quoteData 
   */
  viewQuoteDetail(quoteData) {
    if (quoteData.status == 'RASCUNHO') {
      Swal.fire({
        title: 'Por favor, complete a cotação',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
    } else {
      if (quoteData.status == 'ATIVO') {
        this.buttonblock = false;
        this.quotesData = quoteData
        this.showHideDetails = true;
        $('#viewQuoteOptionsDetail').click();
      } else {
        this.buttonblock = true;
        this.quotesData = quoteData
        this.showHideDetails = true;
        $('#viewQuoteOptionsDetail').click();
      }
    }
  }

  /**
   * Function to share the quote details
   * @param status 
   */
  shareQuoteDetail(status) {
    if (status == 'RASCUNHO') {
      Swal.fire({
        title: 'Por favor, complete a cotação',
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
    } else {
      $('#shareQuoteButton').click();
    }
  }

  /**
  * Function to close the quote detail modal and redirect to qotelist page
  */
  closeQuoteDetailModal() {
    this.modalRef.hide();
    this.router.navigateByUrl('/quotes');
  }

  /**
   * Function to open add proposal screen
   */
  addProposal() {
    this.modalRef.hide();
    this.router.navigateByUrl('/proposals/add/' + btoa(this.quoteId));
  }

  /**
   * Function To Get Quotes history List
   */
  getQuotesHistoryList(quoteId) {
    $('#quoteHistoryModal').trigger('click');
    const tableActions = [
      { name: 'view', class: 'btn btn-light', img: 'eye.svg', title: 'ver cotação' },
      { name: 'share', class: 'btn btn-light', img: 'share.svg', title: 'Compartilhar' },
      { name: 'download', class: 'btn btn-light', img: 'down-arrow.svg', title: 'baixar PDF' },
    ];
    const url = AppApi.quotesUrl + 'history-list/';
    const reqParam = [
      { key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }, //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
      { key: 'company_id', value: this.company_id },
      { key: 'status', value: this.selectedStatus },
      { key: 'created_by_id', value: this.currentUser.created_by_id },
      { key: 'administrator', value: this.administrator },
      { key: 'parent_id', value: quoteId },

    ];
    const tableColumns = [
      { title: 'ID #', data: 'id' },
      { title: 'PROPONENTE', data: 'customer_company_name' },
      { title: 'Produto', data: 'productname' }, //product.name
      { title: 'Profissão', data: 'professionname' }, //profession.name
      { title: 'Prêmio', data: 'total_insurance_cost' },
      { title: 'Data de Criação', data: 'created_at' },
      { title: 'Status', data: 'status' },
      { title: 'Ações', data: 'id' },
    ];
    if (!$.fn.dataTable.isDataTable('#quote-list-history')) {
      this.datatableService.commonDataTable('quote-list-history', url, 'full_numbers', tableColumns, 10, true, true, 'lt', 'irp', undefined, [0, 'undefined'], '', reqParam, tableActions, 7, [5], '', [4], [6], [], [], []);
    } else {
      this.datatableService.commonDataTableReload('quote-list-history', url, reqParam);
    }
  }

}
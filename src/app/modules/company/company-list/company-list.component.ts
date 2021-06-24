import { Component, OnInit } from '@angular/core';
import { Renderer, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserService } from "../../../common/services/user/current-user.service";
import { DatatableService } from '.././../../common/services/data-table/datatable.service';
import { Title } from "@angular/platform-browser";
import { UserRestService } from "../../../common/services/user/user-rest.service";
import { AppApi } from "../../../app-api";
import { ToastrService } from "ngx-toastr";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import Swal from 'sweetalert2';
import { ExcelService } from '../../../common/services/excel/excel.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
  providers: [DatatableService, UserRestService, ConfirmDialogService]
})
export class CompanyListComponent implements OnInit {
  userId: any;
  company_id;
  rejectResonForm: FormGroup;
  showLoader = false;
  listener: Function;
  modalRef: BsModalRef;
  currentUser: any = [];

  constructor(
    private title: Title,
    private renderer: Renderer,
    private router: Router,
    public currentUserService: CurrentUserService,
    private excelService: ExcelService,
    private datatableService: DatatableService,
    public userRestService: UserRestService,
    public toastrService: ToastrService,
    private modalService: BsModalService,
    private confirmDialogService: ConfirmDialogService
  ) {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = JSON.parse(currentUser);
    this.company_id = JSON.parse(localStorage.getItem('companyId'));
  }

  ngOnInit() {
    this.title.setTitle('Company List');
    this.rejectResonForm = new FormGroup({
      message: new FormControl('', [Validators.required]),
    });
    this.getCompanyList();
  }

  ngAfterViewInit(): void {
    this.listener = this.renderer.listenGlobal('document', 'click', (event) => {
      if (event.target.getAttribute('href') === 'company-list') {
        if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'view') {
          this.viewUserDetailPage(event.target.getAttribute('data-id'));
        } if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'edit') {
          this.editUserDetailPage(event.target.getAttribute('data-id'));
        } else if (event.target.hasAttribute('data-id') && event.target.getAttribute('name') === 'delete') {
          this.userId = event.target.getAttribute('data-id');
          this.deleteUser(event.target.getAttribute('data-id'));
        }
      } else if (event.target.getAttribute('id') === 'active-inactive') {
        this.ativeDeactivateUser(this.datatableService.selectedRow.id, this.datatableService.selectedRow.status);
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
  * Function To Get users List
  */
  getCompanyList() {
    const tableActions = [
      { name: 'view', class: 'btn btn-light', img: 'users.svg', title: 'Usuários' },
      { name: 'edit', class: 'btn btn-light', img: 'pencil-edit-button.svg', title: 'Editar' },
      //{ name: 'delete', class: 'btn btn-light', img: 'reject.svg', title: 'Excluir' }
    ];
    const url = AppApi.approvedCompanyListUrl;
    const reqParam = [{ key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }]; //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
    const tableColumns = [
      { title: 'Nome', data: 'name' },
      { title: 'Email', data: 'email' },
      { title: 'telefone', data: 'phone' },
      { title: 'Número Do Registro', data: 'name' },
      { title: 'Status', data: 'status' },
      { title: 'Ações', data: 'id' }
    ];
    if (!$.fn.dataTable.isDataTable('#company-list')) {
      this.datatableService.commonDataTable('company-list', url, 'full_numbers', tableColumns, 10, true, true, 'lt', 'irp', undefined, [0, 'undefined'], '', reqParam, tableActions, 5, '', '', [], [4], [], [], []);
    } else {
      this.datatableService.commonDataTableReload('company-list', url, reqParam);
    }
  }

  /**
   * Function to export company list to csv/excel
   */
  exportCompanyList(type) {
    let quoteExcelData = [];

    const requestData = {
      start: 0,
      type: '',
      company_id: this.company_id,
    };
    this.showLoader = true;
    this.userRestService.postApi
      (AppApi.listCompanyUrl + 'list/excel', requestData).then((response: any) => {
        this.showLoader = false;
        if (response.code === 201) {
          if (type == 'export') {
            for (const resultData of response.data) {
              quoteExcelData.push({
                'ID #': resultData.id,
                'EMAIL': resultData.email,
                'TELEFONE': resultData.phone
              });
            }
            this.excelService.exportAsExcelFile(quoteExcelData, 'company_list_');
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
   * Function to accept user request
   * @param userId 
   */
  acceptUser(userId, status) {
    if (status == 'PENDENTE') {
      Swal.fire({
        title: "Broker hasn't completed their registration yet",
        icon: 'error',
        timer: 5000,
        position: "top-right",
        toast: true,
        showCancelButton: false,
        showConfirmButton: false
      })
    } else {
      const payload = {
        user_id: userId,
        url: AppApi.frontEndBaseUrl + 'register-complete/',
        redirecturl: AppApi.frontEndBaseUrl + 'login/'
      }
      this.showLoader = true;
      this.userRestService
        .postApi(AppApi.approveUserUrl, payload)
        .then((response) => {
          this.showLoader = false;
          if (response.status === 1 && response.code === 201) {
            Swal.fire({
              title: response.message,
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.reloadTable();
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
   * Function to open reject reason model
   * @param rejectUserModal 
   */
  openRejectReasonModel(rejectUserModal: TemplateRef<any>) {
    this.modalRef = this.modalService.show(rejectUserModal);
  }

  /**
   * Function to open reject reson model
   * @param rejectUserModal 
   */
  closeRejectUserModel() {
    this.modalRef.hide();
    this.rejectResonForm.reset();
  }

  /**
   * Function to open reject reason model
   * @param enableDisableModal 
   */
  openEnableDisableModal(enableDisableModal: TemplateRef<any>) {
    this.modalRef = this.modalService.show(enableDisableModal);
  }

  /**
   * Function to open reject reson model
   * @param enableDisableModal 
   */
  closeEnableDisableModal(enableDisableModal: TemplateRef<any>) {
    this.modalRef.hide();
  }

  /**
   * Function to reject user request
   */
  rejectUser() {
    if (this.rejectResonForm.valid) {
      const payload = {
        user_id: this.userId,
        url: AppApi.frontEndBaseUrl + 'register-complete/',
        message: this.rejectResonForm.value.message,
        redirecturl: AppApi.frontEndBaseUrl + 'login/'
      }
      this.showLoader = true;
      this.userRestService
        .postApi(AppApi.rejectUserUrl, payload)
        .then((response) => {
          this.showLoader = false;
          if (response.status === 1 && response.code === 201) {
            Swal.fire({
              title: response.message,
              icon: 'success',
              timer: 5000,
              position: "top-right",
              toast: true,
              showCancelButton: false,
              showConfirmButton: false
            })
            this.closeRejectUserModel();
            this.reloadTable();
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
      this.currentUserService.validateAllFormFields(this.rejectResonForm);
    }
  }

  /**
   * Function to view user details page
   * @param userId 
   */
  viewUserDetailPage(userId) {
    this.router.navigate(['/company-users/' + userId]);
  }

  /**
   * Function to edit user details page
   * @param userId 
   */
  editUserDetailPage(userId) {
    this.router.navigate(['/company/edit/' + btoa(userId)]);
  }

  addBroker() {
    this.router.navigateByUrl('/company/add');
  }

  /**
   * Function to delete user
   * @param userId 
   */
  deleteUser(userId) {
    const reqParam = [{ key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }]; //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
    const object = this;
    this.confirmDialogService.confirmThis('Tem certeza de que deseja excluir usuário?', function () {
      object.userRestService
        .delete(AppApi.DeleteUserUrl + userId)
        .then((response) => {
          if (response.status == 1) {
            object.datatableService.commonDataTableReload('company-list', AppApi.approvedCompanyListUrl, reqParam);
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

        })
    }, function () {
    });
  }

  /**
   * Function to deactivate/Active user
   * @param userId 
   */
  ativeDeactivateUser(userId, currentStatus) {
    const object = this;
    let message;
    let status;
    if (currentStatus == 'INATIVO') {
      status = 3;
      message = 'Usuário ativado com sucesso'
    } else {
      status = 5;
      message = 'Usuário desativado com sucesso'
    }
    object.userRestService
      .postApi(AppApi.DeactiveUserUrl + userId, { status: status })
      .then((response) => {
        if (response.status == 1) {
          const reqParam = [{ key: 'user_id', value: this.currentUser.role_id == 3 ? 'All' : this.currentUser.id }]; //role_id 3 (admin), 1 (Broker), 2 (Broker Emp)
          this.datatableService.commonDataTableReload('company-list', AppApi.approvedCompanyListUrl, reqParam);
          Swal.fire({
            title: message,
            icon: 'success',
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
   * Function to reload users list table
   */
  reloadTable() {
    const reqParam = [];
    this.datatableService.commonDataTableReload('company-list', AppApi.approvedUserListUrl, reqParam);
  }

}

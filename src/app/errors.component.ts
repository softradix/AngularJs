import { Component, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-errors',
  template: `
   <ul *ngIf="shouldShowErrors()" class="validation-errors">
     <li style="color: red">{{getError()}}</li>
   </ul>
 `,
})


export class ShowErrorsComponent {
  private static readonly errorMessages = {
    required: (params) => 'Este campo é obrigatório',
    minlength: (params) => 'Deve ser o mínimo ' + params.requiredLength + ' Personagens',
    maxlength: (params) => 'Não deve ser maior que ' + params.requiredLength + ' Personagens',
    pattern: (params) => 'Deve ser válido',
    passwordMismatch: (params) => 'A senha e a confirmação da senha não correspondem',
    vaildEmail: (params) => params.message,
    numbersOnly: (params) => params.message,
    validPhone: (params) => params.message,
    onlyAlphabets: (params) => params.message,
    dateCheck: (params) => 'Proponente não pode ter menos de 18 anos',
    inValidCnpj: (params) => 'Digite o CNPJ válido.',
  };

  @Input()
  private control: AbstractControlDirective | AbstractControl;
  shouldShowErrors(): boolean {
    return this.control &&
      this.control.errors &&
      (this.control.dirty || this.control.touched);
  }

  listOfErrors(): string[] {
    return Object.keys(this.control.errors)
      .map(field => this.getMessage(field, this.control.errors[field], this.control));
  }

  getError(): string {
    var errors = Object.keys(this.control.errors)
      .map(field => this.getMessage(field, this.control.errors[field], this.control));
    return errors[0];
  }

  private getMessage(type: string, params: any, control: any) {
    var fname = this.getControlName(control);
    fname = fname.replace("_", " ").replace(" id", "").toLowerCase();
    fname = fname.replace(/\b\w/g, l => l.toUpperCase())
    var msg = ShowErrorsComponent.errorMessages[type](params);
    return msg;
  }

  getControlName(c: AbstractControl): string | null {
    const formGroup = c.parent.controls;
    return Object.keys(formGroup).find(name => c === formGroup[name]) || null;
  }

}
import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';

export class CustomValidators {

    static isValid: boolean;

    static vaildEmail(c: FormControl): ValidationErrors {
        const email = c.value;
        if (email) {
            const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            let isValid = true;
            const message = {
                vaildEmail: {
                    message: 'Digite um email válido'
                }
            };
            if (reg.test(email)) {
                isValid = true;
            } else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    static vaildNumber(c: FormControl): ValidationErrors {
        const value = c.value;
        const reg = /^[0-9]*$/;
        let isValid = true;
        const message = {
            vaildNumber: {
                message: 'Should be in numeric form & 10 digit'
            }
        };
        if (reg.test(value)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static validPhone(c: FormControl): ValidationErrors {
        const phone = c.value;
        const reg = /^\d{10}$/;
        let isValid = true;
        const message = {
            validPhone: {
                message: 'O telefone deve ter um número válido de 10 dígitos'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static Alphanumric(c: FormControl): ValidationErrors {
        const address1 = c.value;
        const reg = /^[a-zA-Z0-9]+$/;
        let isValid = true;
        const message = {
            address1: {
                message: 'Please provide valid value'
            }
        };
        if (reg.test(address1)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static Alphabetic(c: FormControl): ValidationErrors {
        const address2 = c.value;
        const reg = /^[a-zA-Z]+$/;
        let isValid = true;
        const message = {
            address2: {
                message: 'Please provide valid alphabets'
            }
        };
        if (reg.test(address2)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static vaildPhone(c: FormControl): ValidationErrors {
        const phone = c.value;
        const reg = /^\d{10}$/;
        let isValid = true;
        const message = {
            vaildPhone: {
                message: 'O telefone deve ter um número válido de 10 dígitos'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /**
     * @description : Validator "numbersOnly" allow user to enter only numbers in form field
     */
    static numbersOnly(c: FormControl): ValidationErrors {
        const inputFieldValue = c.value;
        const reg = /^[0-9]*$/;
        let isValid = true;
        const message = {
            numbersOnly: {
                message: 'Por favor insira apenas números'
            }
        };
        if (reg.test(inputFieldValue)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /**
     * @description : Validator "numbersOnly" allow user to enter only numbers in form field
     */
    static numbersOnlyWithDecimal(c: FormControl): ValidationErrors {
        const inputFieldValue = c.value;
        const reg = /^[0-9 .]*$/;
        let isValid = true;
        const message = {
            numbersOnly: {
                message: 'Por favor insira apenas números'
            }
        };
        if (reg.test(inputFieldValue)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static onlyAlphabets(c: FormControl): ValidationErrors {
        const phone = c.value;
        const reg = /^[a-zA-Z\s]+$/;
        let isValid = true;
        const message = {
            onlyAlphabets: {
                message: 'Should be alphabets only'
            }
        };
        if (reg.test(phone)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    // Alphanumeric Validation By Balwinder
    static alphaNumeric(c: FormControl): ValidationErrors {
        const add = c.value;
        const reg = /^[a-zA-Z0-9 ]*$/;
        let isValid = true;
        const message = {
            alphaNumeric: {
                message: 'Please enter valid alphaNumeric'
            }
        };
        if (reg.test(add)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }
    /**
     * 
     * @param c To validate first name
     */

    static validFirstName(c: FormControl): ValidationErrors {
        const name = c.value.trim();
        let isValid = true;
        const message = {
            validName: {
                message: 'Please provide First Name'
            }
        };
        if ((name)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /**
     * 
     * @param c To validate last name
     */

    static validLastName(c: FormControl): ValidationErrors {
        const name = c.value.trim();
        let isValid = true;
        const message = {
            validName: {
                message: 'Please provide Last Name'
            }
        };
        if ((name)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /**
     * 
     * @param c To validate email name
     */

    static validEmailName(c: FormControl): ValidationErrors {
        const name = c.value;
        let isValid = true;
        const message = {
            validName: {
                message: 'Please provide Email'
            }
        };
        if ((name)) {
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    static validPrice(c: FormControl): ValidationErrors {
        const value = c.value;
        let isValid = true;
        let message = {
            validServicePrice: {
                message: 'Service Charges Should be greater than zero'
            }
        };
        if ((value)) {
            if (value < 1) {
                message = {
                    validServicePrice: {
                        message: 'Service Charges Should be greater than zero'
                    }
                };
                isValid = false;
            } else {
                isValid = true;
            }
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }


    static requiredInformaionYourSelf(c: FormControl): ValidationErrors {
        const v1 = String(c.value).replace(/<[^>]+>/gm, '').trim();
        const name = String(v1).replace(/&nbsp;/, '');
        let isValid = true;
        let message = {
            validName: {
                message: 'Please provide details about yourself'
            }
        };
        if ((name)) {
            if (name !== 'undefined') {
                if (name.length > 1000) {
                    message = {
                        validName: {
                            message: 'Should not be greater than 1000 Characters'
                        }
                    };
                    isValid = false;
                }
            } else if (name === 'undefined') {
                isValid = false;
            } else {
                isValid = true;
            }
        } else {
            isValid = false;
        }
        return isValid ? null : message;
    }

    /**
     * Function to validate the cpf
     * @param c 
     */
    static vaildCPF(c: FormControl): ValidationErrors {
        const value = c.value;
        if (value) {
            const cpf = value.replace(/[_.-]/g, "");
            const cpfLength = cpf.length;
            let isValid = true;
            const message = {
                vaildEmail: {
                    message: 'Digite CPF válido'
                }
            };
            if (cpfLength >= 11) {
                isValid = true;
            } else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    /**
     * Function to validate the CNPJ
     * @param c 
     */
    static vaildCNPJ(c: FormControl): ValidationErrors {
        const value = c.value;
        if (value) {
            const cnpj = value.replace(/[_./-]/g, "");
            let isValid = true;
            const message = {
                vaildEmail: {
                    message: 'Digite CNPJ válido'
                }
            };
            if (cnpj.length >= 14) {
                isValid = true;
            } else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    /**
     * Function to validate the telephone
     * @param c 
     */
    static validTelephone(c: FormControl): ValidationErrors {
        const value = c.value;
        if (value) {
            const cnpj = value.replace(/[_./-]/g, "");
            let isValid = true;
            const message = {
                vaildEmail: {
                    message: 'Digite Telefone válido'
                }
            };
            if (cnpj.length >= 13) {
                isValid = true;
            } else {
                isValid = false;
            }
            return isValid ? null : message;
        }
    }

    
}

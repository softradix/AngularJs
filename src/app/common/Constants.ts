import { EventEmitter } from '@angular/core';
import { environment } from '../../environments/environment';

export class Constants {
    static loginbaseUrl = environment.loginBaseUrl;
    static baseUrl = environment.baseUrl;
    static frontEndBaseUrl = environment.frontendBaseUrl;
    static mediaUrl = environment.mediaUrl;
}

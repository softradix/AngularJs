import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'; // import app routing module
import { SharedModule } from './shared/shared.module'; // import the shared modules
import { CurrentUserService } from './common/services/user/current-user.service';
import { ApiService, Interceptor } from './common/services/rest-api/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuardService } from './common/services/auth-guard.service';
import { ExcelService } from './common/services/excel/excel.service';
import { ChangeDateFormatService } from './common/services/date-picker/change-date-format.service';
import { AuthRestService } from './common/services/auth/auth-rest.service';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { DeviceDetectorModule } from 'ngx-device-detector';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    SharedModule,
    BrowserAnimationsModule,
    DeviceDetectorModule
  ],
  exports: [SharedModule],
  providers: [CurrentUserService, ChangeDateFormatService, AuthRestService, CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true,
    },
    ApiService, AuthGuardService, ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }

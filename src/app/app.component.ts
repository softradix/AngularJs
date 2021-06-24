import { Component } from '@angular/core';
import { Location} from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserService } from './common/services/user/current-user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Instill';
  showSideBar: boolean;
  constructor(
    private router: Router,
    private location: Location,
    public currentUserService: CurrentUserService,
  ) {

    router.events.subscribe(val => {
      if (location.path() === '/login') {
        this.showSideBar = false;
      } else {
        this.showSideBar = true;
      }
    });
  }

  /**
   * Login function
   */
  public isLogin() {
    if (this.currentUserService.isUserLoggedIn()) {
      return true;
    } else {
      return false;
    }
  }
}

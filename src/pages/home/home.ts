import { Component } from '@angular/core';
import {  MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    private menu: MenuController,
    private user: UserProvider){
      // After we login and land on the home page, enable the menu for
      // current user
      this.enableMenu();
      // Once we land here call the getUserInfo() method to update
      // user info. 
      this.user.getUserInfo();
  }

  enableMenu(){
    this.menu.enable(true);
  }
}

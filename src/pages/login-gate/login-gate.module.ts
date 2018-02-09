import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginGatePage } from './login-gate';

@NgModule({
  declarations: [
    LoginGatePage,
  ],
  imports: [
    IonicPageModule.forChild(LoginGatePage),
  ],
})
export class LoginGatePageModule {}

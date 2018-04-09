import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Preference } from './preference';

@NgModule({
  declarations: [
    Preference,
  ],
  imports: [
    IonicPageModule.forChild(Preference),
  ],
})
export class PreferenceModule {}

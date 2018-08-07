import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams, Platform, AlertController } from 'ionic-angular';

import { PushService } from './../../app/services/push.service';
import { Storage } from '@ionic/storage';

import { Push, PushObject, PushOptions } from '@ionic-native/push';

/**
 * Generated class for the PushPoupuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-push-popup',
  templateUrl: 'push-popup.html',
})
export class PushPopupPage {

  constructor(
  	public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
    private platform: Platform,
    public pushService: PushService,
    private push: Push,
    public storage: Storage,
    private alertCtrl: AlertController) {

  	}

  ionViewDidLoad() {
    
  }

  yesClick() {
    localStorage.setItem('push_popup_status', 'yes');
    this.initPushNotification();
  }

  noClick() {
    localStorage.setItem('push_popup_status', 'no');
    this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
  }

  laterClick() {
    localStorage.setItem('push_popup_status', 'later');
    this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
  }

  initPushNotification() {
    const options: PushOptions = {
      android: {
        senderID: '653273040369'
      },
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);
    pushObject.on('registration').subscribe((data: any) => {
        this.sendTokenToServer(data.registrationId);
    },(error: any) => {
        console.log(error);
    });
    
    pushObject.on('notification').subscribe((data: any) => {
      console.log('message -> ' + data.message);
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
      //if application open, show popup
        
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly     
        console.log('Push notification clicked');
      }
    });

    pushObject.on('error').subscribe(error => {
      console.error('Error with Push plugin' + error);
      alert(error);
    });
  }

  sendTokenToServer(device_token) {
    let platform = this.platform.is('android') ? 'fcm' : 'apn';
    const environment = 'production';

    this.pushService.createPushable(platform, environment, device_token).subscribe(result => {
      this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
    }, error => {
      localStorage.setItem('push_popup_status', 'later');
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: 'The device token is not registered.',
        buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
                }
            }, {
                text: 'Ok',
                handler: () => {
                  this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
                }
            }]
      });

      alert.present();
    });
  }

}

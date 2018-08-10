import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Toast, Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Device } from '@ionic-native/device';
import { SessionService } from './../../app/services/session.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email: string;
  password: string;
  uuid: string;
  device_name: string;

  errorToast: Toast;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private sessionService: SessionService,
    private toastController: ToastController,
    private fb: Facebook,
    public storage: Storage,
    public platform: Platform,
    public device: Device
  ) {
    this.uuid = localStorage.getItem('tenant_uuid');
    this.platform.ready().then( () => {
        if(this.platform.is('ios')) {
          this.device_name = this.device.model;
        }else if (this.platform.is('android')) {
          this.device_name = (window as any).device.name;
        } else {
          this.device_name = '';
        }
        if(!this.device_name){
          this.device_name = 'iphone7, 2';
        }
        
      });
   }

  ionViewDidLoad() {

  }

  ionViewWillLeave() {
    if(this.errorToast) {
      this.errorToast.dismissAll();
    }
  }

  emailChanged(change) {
    this.email = change;
  }

  passwordChanged(change) {
    this.password = change;
  }

  login() {
    this.getTenantsURL();
  }

  getTenantsURL () {
    this.sessionService.tenantsURL(this.uuid).subscribe(result => {
      let url = result.body.url;
      localStorage.setItem('base_url', url);
      this.doLogin(url)
    });
  }

  doLogin(url) {
    let user_info = {
      email: this.email,
      password: this.password,
      device_name: this.device_name
    }
    this.sessionService.login(user_info, url).subscribe(result => {
      if(!result.success) {
        this.showError('Invalid login credentials. Please try again.');
      } else {
        this.showError('Success.');
        this.navCtrl.setRoot('PushPopupPage');

      }
    });
  }

  loginWithFacebook() {
    this.fb.login(['public_profile', 'email'])
      .then((fbres: FacebookLoginResponse) => {
        // log into api with response
        if(fbres.authResponse) {
          this.sessionService.facebook(fbres.authResponse.accessToken)
            .subscribe(res => {
              if(res['status'] === 'success' || res['success'] === true) {
                this.navCtrl.setRoot('PushPopupPage');
              } else {
                this.showError('There was an error logging in with Facebook.');
              }
            });
        } else {
          // let the catch below handle it
          throw new Error('Invalid FB Response');
        }
      })
      .catch(e => {
        console.log('Error logging in with Facebook', e);
        this.showError('There was an error logging in with Facebook.');
      });
  }

  goToSignup() {
    this.navCtrl.setPages([{ page: 'SignupPage'}]);
  }

  showError(message) {
    if(!this.errorToast) {
      this.errorToast = this.toastController.create({
        message,
        cssClass: 'error-toast',
        position: 'middle',
        showCloseButton: true,
        closeButtonText: 'OK',
      });

      this.errorToast.onDidDismiss(() => {
        this.errorToast = null;
      });

      this.errorToast.present();
    }
  }

  
}

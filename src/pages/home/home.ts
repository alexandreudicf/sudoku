import { Component } from '@angular/core';
import {AlertController, NavController, Platform} from 'ionic-angular';
import {RandomNumber} from "./RandomNumber";
import {AdMobPro} from "@ionic-native/admob-pro";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  level: string = "Facil";
  qntyVisibleNumbers: number = 38;
  listRandomNumbers: RandomNumber[][] = [];


  constructor(public navCtrl: NavController,public alertCtrl: AlertController,
              public admob: AdMobPro, public platform: Platform ) {


    let admobid = {banner: '' };

    if(platform.is('android')) {
      admobid.banner = 'ca-app-pub-8565632120848065/5791824874';
    } else if (platform.is('ios')) {
      admobid.banner = 'ca-app-pub-8565632120848065/8515859435';
    }

    platform.ready().then(() => {
      admob.createBanner({
        adId: admobid.banner,
        isTesting: false,
        autoShow: true,
        position: admob.AD_POSITION.BOTTOM_CENTER,
        adExtras : {
          color_bg: 'e7e7e8',
          color_bg_top: 'FFFFFF',
          color_border: 'FFFFFF',
          color_link: '000080',
          color_text: '808080',
          color_url: '008000'
        }
      });
    });

    this.startPlay();
  }

  startPlay() {
    this.initializeList();
    var tentativas = this.fillSquares();
    this.fillVisibleNumbers();

    console.log("Tentativas: " + tentativas);
  }

  changeLevel() {
    if (this.level == "Facil") {
      this.qntyVisibleNumbers = 30;
      this.level = "Medio"
    } else if (this.level == "Medio") {
      this.qntyVisibleNumbers = 28;
      this.level = "Dificil"
    }  else if (this.level == "Dificil") {
      this.qntyVisibleNumbers = 38;
      this.level = "Facil"
    }

    this.startPlay();
  }

  selectNumber(value: number) {
    this.getValuesFromTable((v) : boolean => {
      if (v.isSelected && v.isVisible) {
        //stop calling function
        return true;
      } else if (v.isSelected && v.value == value) {
        v.isVisible = true;
        v.isSelected = false;
        this.selectItem(v);
        if (this.verifyIsAllVisible()) {
          this.alertCtrl.create({
            title: 'Congratulations!',
            subTitle: 'You won!',
            buttons: ['OK']
          }).present();
        }
      } else if (v.isSelected && v.value != value) {
        this.alertCtrl.create({
          title: 'Sorry!',
          subTitle: 'Try again!',
          buttons: ['OK']
        }).present();
      }
    });
  }

  disableButton(value: number) {
    var numbers: number = 9;

    this.getValuesFromTable((v) => {
      if (v.value == value && v.isVisible) {
        numbers--;
      }
    });

    if (numbers == 0) {
      return true;
    }
    return false;
  }

  verifyIsAllVisible() {
    var isAllVisible = true;
      this.getValuesFromTable((v) => {
      if (!v.isVisible) {
        isAllVisible = false;
        return true;
      }
    });

    return isAllVisible;
  }

  fillVisibleNumbers() {
    do {
      let line:number = this.getRandomNumberInRange(0,8);
      let column:number = this.getRandomNumberInRange(0,8);

      if (this.listRandomNumbers[line][column].isVisible || this.verifyHowManyNumbersIsVisible(this.listRandomNumbers[line][column].value) > 5) {
        continue;
      }

      this.listRandomNumbers[line][column].isVisible = true;
      this.qntyVisibleNumbers--;

    } while (this.qntyVisibleNumbers != 0);
  }

  verifyHowManyNumbersIsVisible(value: number) {
    let qnty: number = 0;
    this.getValuesFromTable((v) => {
      if (v.value == value && v.isVisible) {
        qnty++;
      }
    });

    return qnty;
  }

  selectItem(itemValue: RandomNumber){

    if (itemValue.isSelected) {
      return;
    }

    this.getValuesFromTable((v) => {
      if (itemValue.value == v.value && itemValue != v && itemValue.isVisible && v.isVisible) {
        v.isSameNumberSelected = !itemValue.isSameNumberSelected;
      } else {
        v.isSameNumberSelected = false;
      }

      if (itemValue == v) {
        v.isSelected = !itemValue.isSelected;
      } else {
        v.isSelected = false;
      }
    });
  }

  fillSquares() {

    let valueIncrement :number = 1;
    let tentativas :number = 0;

    do {
      if (!this.populateBySquare(valueIncrement)) {
        this.eraseNumbers(valueIncrement);
        valueIncrement--;
        this.eraseNumbers(valueIncrement);
        tentativas++;
      } else {
        valueIncrement++;
      }
    } while (valueIncrement != 10);

    return tentativas;

  }

  eraseNumbers(value: number) {
    this.getValuesFromTable((v) => {
      if (v.value == value) {
        v.value = 0;
      }

    });
  }

  populateBySquare(valueIncrement: number) {
    for (var _i = 1;_i<=3;_i++) {
      for (var _j = 1;_j<=3; _j++) {

        let positionV = 0,positionH = 0,attempts = 100;
        let populated: boolean = false;
        do {
          let _l: number = this.getInitialPositionSquare(null,_i);
          let _c: number = this.getInitialPositionSquare(null,_j);
          positionV = this.getRandomNumberInRange(_l,_l+2);
          positionH = this.getRandomNumberInRange(_c,_c+2);

          attempts--;
          if (this.listRandomNumbers[positionV][positionH] != null && this.listRandomNumbers[positionV][positionH].value > 0) {
            continue;
          }
          populated = this.populate(positionV,positionH,valueIncrement);
        } while(!populated && attempts > 0);

        if (!populated || attempts == 0) {
          return false;
        }
      }
    }
    return true;
  }

  populate(vNumber: number ,hNumber: number ,value: number) {
    if (!this.verifyNumberIsValidOnHorizontalLine(vNumber,hNumber, value)
      || !this.verifyNumberIsValidOnVerticalLine(vNumber,hNumber, value)
      || !this.verifyNumberIsValidInSquare(vNumber,hNumber, value)) {
      return false;
    }
    this.listRandomNumbers[vNumber][hNumber].value = value;
    return true;
  }

  getInitialPositionSquare(positionHorizontalOrVertical: number ,relativeP: number) {
    let relativePosition:number = relativeP != null ? relativeP : (positionHorizontalOrVertical + 1) / 3;
    if (relativePosition <= 1) return 0;
    if (relativePosition > 1 && relativePosition <= 2) return 3;
    if (relativePosition > 2 && relativePosition <= 3) return 6;
    return 0;
  }

  verifyNumberIsValidInSquare(vNumber: number, hNumber: number, value: number) {
    let vInitial = this.getInitialPositionSquare(vNumber,null);
    let hInitial = this.getInitialPositionSquare(hNumber,null);

    for (var _line = vInitial; _line < (vInitial + 3); _line++) {
      for (var _column = hInitial; _column < (hInitial + 3); _column++) {

        if (_line == vNumber && _column == hNumber) {
          continue;
        }

        if (this.listRandomNumbers[_line][_column].value == value && this.listRandomNumbers[_line][_column].value != 0) {
          return false;
        }
      }
    }

    return true;
  }

  verifyNumberIsValidOnVerticalLine(vNumber: number, hNumber: number, value: number) {
    for (var _i = 0; _i < 9; _i++) {
      if (_i == vNumber) {
        continue;
      }

      if (this.listRandomNumbers[_i][hNumber].value == value && this.listRandomNumbers[_i][hNumber].value != 0) {
        return false;
      }
    }

    return true;
  }

  verifyNumberIsValidOnHorizontalLine(vNumber: number, hNumber: number, value: number) {
    for (var _i = 0; _i < 9; _i++) {
      if (_i == hNumber) {
        continue;
      }

      if (this.listRandomNumbers[vNumber][_i].value == value && this.listRandomNumbers[vNumber][_i].value != 0) {
        return false;
      }
    }

    return true;
  }

  getRandomNumberInRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getValuesFromTable(callback: (value : RandomNumber) => any) {
    for (var _i = 0; _i < 9; _i++) {
      for (var _j = 0; _j < 9; _j++) {
        var stopCallback = callback(this.listRandomNumbers[_i][_j]);
        if (stopCallback) {
          return;
        }
      }
    }
  }

  initializeList() {
    for (var _i = 0; _i < 9; _i++) {
      this.listRandomNumbers[_i] = [];
      for (var _j = 0; _j < 9; _j++) {
        this.listRandomNumbers[_i][_j] = new RandomNumber(0);
      }
    }
  }

}

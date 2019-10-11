import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IsencaoResponsabilidadeGuard } from './isencao-responsabilidade/isencao-responsabilidade.guard';
import { BisqService } from './corretora/bisq.service';
import { BraziliexService } from './corretora/braziliex.service';
import { ArbitragemService } from './arbitragem/arbitragem.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    IsencaoResponsabilidadeGuard,
    BisqService,
    BraziliexService,
    ArbitragemService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

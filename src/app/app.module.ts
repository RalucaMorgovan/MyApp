import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodolistComponent } from './todolist/todolist.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule,ReactiveFormsModule} from '@angular/forms'
import {RouterOutlet} from '@angular/router'
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular'

@NgModule({
  declarations: [
    AppComponent,
    TodolistComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    HttpClientModule,
    CommonModule,
    FullCalendarModule

    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

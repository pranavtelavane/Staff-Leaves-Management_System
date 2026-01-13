import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { RouterModule } from "@angular/router";
import { Header } from "../header/header";

@Component({
  selector: 'app-layout',
  standalone:true,
  imports: [Sidebar, RouterModule, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {

}

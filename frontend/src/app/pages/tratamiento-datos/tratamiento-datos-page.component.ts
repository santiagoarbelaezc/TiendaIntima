import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tratamiento-datos-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tratamiento-datos-page.component.html',
  styleUrl: './tratamiento-datos-page.component.scss'
})
export class TratamientoDatosPageComponent {}

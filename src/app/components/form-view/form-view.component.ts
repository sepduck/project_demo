import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'form-view',
  imports: [FormsModule, CommonModule, ButtonModule],
  templateUrl: './form-view.component.html',
  styleUrl: './form-view.component.css'
})
export class FormViewComponent {
  @Input() headerTitle: string = '';
  @Input() description: string = '';
  @Input() labelBtn: string = '';
  @Input() hasPermissionView: boolean = true;
  @Input() hasPermissionCreate: boolean = true;

  @Output() onCreatePage = new EventEmitter<void>();

  onCreatePageEmit(){
    this.onCreatePage.emit();
  }
}

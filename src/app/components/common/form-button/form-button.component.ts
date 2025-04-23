import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'form-button',
  imports: [],
  templateUrl: './form-button.component.html',
  styleUrl: './form-button.component.css'
})
export class FormButtonComponent {
  @Output() backClick = new EventEmitter<void>();
  @Output() submitClick = new EventEmitter<void>()
  onBackClick() {
    this.backClick.emit();
  }

  onSubmitClick() {
    this.submitClick.emit();
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'form-input',
  imports: [FormsModule, CommonModule, CheckboxModule, PasswordModule, InputTextModule, CheckboxModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.css'
})
export class FormInputComponent {
  @Input() placeholder: string = '';
  @Input() value: string | number = '';
  @Input() error: string | number = '';
  @Input() type: string = 'text';
  @Input() description: string = '';
  @Input() descriptionLabel: string = 'Default password';
  @Input() isInput: string = 'label';
  @Input() readOnly: boolean = false;
  @Input() label: string = '';
  // Checkbox
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() note: string = ''
  @Input() checkboxName: string = '';

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() ngModelChange = new EventEmitter<any>()
  @Output() onChange = new EventEmitter<any>()

  checkboxId: string = `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  isPasswordVisible: boolean = false;

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }

  onCheckboxChange(event: any) {
    this.checked = event;
    this.checkedChange.emit(this.checked);
  }
  onChangeEmit() {
    this.onChange.emit()
  }

  onNgModelChange() {
    this.ngModelChange.emit()
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

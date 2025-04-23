import { Component, Input } from '@angular/core';

@Component({
  selector: 'account-form',
  imports: [],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.css'
})
export class AccountFormComponent {

  @Input() headerTitle = '';
}

import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css'
})

// Dungf class exends de tai su dung
export class UserModalComponent {
  activeTab: string = 'tab1';
  setActiveTab(tab: string) { this.activeTab = tab; }

  @Input() headerTitle!: string;
  @Input() firstName!: string;
  @Input() lastName!: string;
  @Input() email!: string;
  @Input() phoneNumber!: string;
  @Input() isRandomPassword!: boolean;
  @Input() userName!: string;
  @Input() password!: string;
  @Input() verifyToken!: boolean;
  @Input() rolesSelect: any[] = []
  @Input() previewImageUrl: string | ArrayBuffer | null = null

  @Output() onImageClick: EventEmitter<any> = new EventEmitter<void>()
  @Output() roleChange: EventEmitter<any> = new EventEmitter<{ roleId: string, isSelected: boolean }>()
  @Output() saveUser: EventEmitter<any> = new EventEmitter<void>();
  @Output() onFileSelected: EventEmitter<any> = new EventEmitter<any>();

  emitImageClick() {
    this.onImageClick.emit();
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.previewImageUrl = reader.result;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  onRoleChange(role: any) {
    this.roleChange.emit({
      roleId: role.id,
      isSelected: role.isSelected
    })
  }

  onSave() {
    this.saveUser.emit();
  }

  onFile() {
    this.onFileSelected.emit()
  }
}

import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    constructor(private messageService: MessageService) { }

    /**
     * Hiển thị thông báo thành công
     * @param message Nội dung thông báo
     * @param title Tiêu đề thông báo (mặc định: "Thành công")
     * @param duration Thời gian hiển thị (ms, mặc định: 3000)
     */
    success(message: string, title: string = 'Thành công', duration: number = 3000): void {
        this.messageService.add({
            severity: 'success',
            summary: title,
            detail: message,
            life: duration
        });
    }

    /**
     * Hiển thị thông báo lỗi
     * @param message Nội dung thông báo
     * @param title Tiêu đề thông báo (mặc định: "Lỗi")
     * @param duration Thời gian hiển thị (ms, mặc định: 5000)
     */
    error(message: string, title: string = 'Lỗi', duration: number = 5000): void {
        this.messageService.add({
            severity: 'error',
            summary: title,
            detail: message,
            life: duration
        });
    }

    /**
     * Hiển thị thông báo cảnh báo
     * @param message Nội dung thông báo
     * @param title Tiêu đề thông báo (mặc định: "Cảnh báo")
     * @param duration Thời gian hiển thị (ms, mặc định: 4000)
     */
    warning(message: string, title: string = 'Cảnh báo', duration: number = 4000): void {
        this.messageService.add({
            severity: 'warn',
            summary: title,
            detail: message,
            life: duration
        });
    }

    /**
     * Hiển thị thông báo thông tin
     * @param message Nội dung thông báo
     * @param title Tiêu đề thông báo (mặc định: "Thông tin")
     * @param duration Thời gian hiển thị (ms, mặc định: 3000)
     */
    info(message: string, title: string = 'Thông tin', duration: number = 3000): void {
        this.messageService.add({
            severity: 'info',
            summary: title,
            detail: message,
            life: duration
        });
    }

    /**
     * Hiển thị thông báo xác nhận (Tương tự như window.confirm)
     * Phương thức này cần kết hợp với PrimeNG Confirmation Service
     * Đây là phiên bản đơn giản, có thể mở rộng sau
     */
    confirm(message: string): boolean {
        return window.confirm(message);
        // Trong tương lai có thể thay thế bằng ConfirmDialog của PrimeNG
    }

    /**
     * Xoá tất cả các thông báo hiện tại
     */
    clear(): void {
        this.messageService.clear();
    }
}
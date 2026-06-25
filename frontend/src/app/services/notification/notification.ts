import { Service, signal } from '@angular/core';

export interface ToastData {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
}

@Service()
export class NotificationService {
    private _toast = signal<ToastData | null>(null)
    readonly toast = this._toast.asReadonly()

    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') {
        this._toast.set({ message, type });
        setTimeout(() => {
            this.clear();
        }, 4000);
    }

    clear(): void {
        this._toast.set(null);
    }
}

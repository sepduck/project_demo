import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private isDarkMode = false;

    toggleTheme(): void {
        this.isDarkMode = !this.isDarkMode;
        const theme = this.isDarkMode ? 'dark-theme' : 'light-theme';

        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme);

        localStorage.setItem('theme', theme);
    }
    initializeTheme(): void {
        const stored = localStorage.getItem('darkMode');
        this.isDarkMode = stored === 'true';
        if (this.isDarkMode) {
            document.body.classList.add('dark-theme');
        }
    }
    getIsDarkMode(): boolean {
        return this.isDarkMode;
    }
}

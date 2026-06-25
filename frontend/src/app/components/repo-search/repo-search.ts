import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RepoValidator } from '../../directives/repo-validator/repo-validator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification/notification';
import { AnalysisService } from '../../services/analysis/analysis.service';

@Component({
  selector: 'app-repo-search',
  imports: [CommonModule, FormsModule, RepoValidator],
  templateUrl: './repo-search.html',
  styleUrl: './repo-search.scss',
})
export class RepoSearch {
  urlInput: string = '';

  @Output() searchTriggered = new EventEmitter<string>();
  protected analysisService = inject(AnalysisService);
  private notificationService = inject(NotificationService);

  onSubmit(form: any): void {
    if (form.invalid) {
      this.notificationService.show('Please enter a valid GitHub/GitLab repository URL!', 'warning');
      return;
    }
    this.searchTriggered.emit(this.urlInput);
  }
}

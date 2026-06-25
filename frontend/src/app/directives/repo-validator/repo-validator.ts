import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appRepoValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: RepoValidator,
      multi: true
    }
  ]
})
export class RepoValidator implements Validator {
  private gitRepoRegex = /^https?:\/\/(www\.)?(github|gitlab)\.com\/[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+(\.git)?$/;

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const isValid = this.gitRepoRegex.test(value);
    return isValid ? null : { invalidRepoUrl: true }
  }
}

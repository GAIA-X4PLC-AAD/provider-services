import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiService} from '@services/api.service';

@Injectable()
export class FilesProvider {

  private hasStaticFiles = false;
  private hasApiError = false;

  constructor(private apiService: ApiService) {

  }

  public gethasStaticFiles(): boolean {
    return this.hasStaticFiles;
  }

  public getHasApiError(): boolean {
    return this.hasApiError;
  }

  load() {
    return new Promise((resolve, reject) => {

      this.apiService.getFiles()
        .subscribe(response => {
            this.hasStaticFiles = response.length > 0;
            resolve(true);
          },
          error => {
            const httpError = error as HttpErrorResponse;
            if (httpError.status === 0) {
              this.hasApiError = true;
            }
            resolve(false);
          });
    });
  }
}

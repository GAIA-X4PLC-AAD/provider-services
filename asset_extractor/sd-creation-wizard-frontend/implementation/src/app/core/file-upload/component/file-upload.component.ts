import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ShaclFile} from '@models/shacl-file';
import {Shape} from '@models/shape';
import {ApiService} from '@services/api.service';
import {FormfieldControlService} from '@services/form-field.service';
import {FileValidator} from '../file-validator';
import { EventEmitter } from '@angular/core';
import { Input,Output } from '@angular/core';
import {Utils} from '@shared/utils';
import {environment} from 'src/environments/environment';



@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Output()
  notify:EventEmitter <boolean> = new EventEmitter();

  @Input() closeModal: (id: string) => void;
  file: File | null = null;
  fileJson: File | null = null;
  allowedExtensions = ['ttl', 'json'];
  form: FormGroup;
  requestError: boolean;
  shaclFileContent: ShaclFile;
  jsonFileContent: Map<string, string>;
  filteredShapes: Shape[];
  private subscription: Subscription | undefined;
  
  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    private formfieldService: FormfieldControlService,
    private httpClient: HttpClient 

  ) {
    this.form = this.formBuilder.group({
      file: new FormControl('', [Validators.required, FileValidator.fileExtensions(this.allowedExtensions)]),
      fileSource: new FormControl('', [Validators.required, FileValidator.fileExtensions(this.allowedExtensions)]),
      fileJson: new FormControl('', [FileValidator.fileExtensions(this.allowedExtensions)]),
      fileSourceJson: new FormControl('', [FileValidator.fileExtensions(this.allowedExtensions)])
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    //call submit programitically - don't wait for form submition button
    this.onSubmit();
  }

  onFileChange(event, fileSourceKey: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.patchValue({
        [fileSourceKey]: file
      });
    }
  }

  onSubmit(): void {
    /*const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
    };*/

    const extractorUrl = Utils.controlUrl(environment.extractorUrl);
    /*
    console.time('JSON File');
    this.httpClient.get(`${extractorUrl}/sendFiles/jsonFile`, { responseType: 'json' })
      .subscribe(() => console.timeEnd('JSON File'));
    console.time('Shacl File');
    this.httpClient.get(`${extractorUrl}/sendFiles/shaclFile`, { responseType: 'blob' })
      .subscribe(() => console.timeEnd('Shacl File'));
    */  

       // fetch the files from the server using HTTP requests
       this.subscription = forkJoin([
        this.httpClient.get(`${extractorUrl}/processShaclFile`, { responseType: 'blob' }), //this.httpClient.get(`${extractorUrl}/sendFiles/shaclFile`, { responseType: 'blob' }), 
        this.httpClient.get(`${extractorUrl}/processJsonLDFile`, { responseType: 'json' })//this.httpClient.get(`${extractorUrl}/sendFiles/jsonFile`, { responseType: 'json' })
      ]).subscribe(
        ([shaclFileBlob, jsonData]) => {
          // convert the Blob and JSON data to File objects
          console.time('converting the shacl');
          const shaclFile: File = new File([shaclFileBlob], 'domainMetadata.ttl', { type: 'application/x-turtle' });//{ type: 'text/plain' });
          console.timeEnd('converting the shacl')
          console.time('converting the json');
          const jsonStr = JSON.stringify(jsonData);
          const jsonFile: File = new File([jsonStr], 'domainMetadata.json', { type: 'application/json' });
          console.timeEnd('converting the json')

    
          // Set the form values as if the user had uploaded them
          this.form.get('fileSource')?.setValue(shaclFile);
          this.form.get('fileSourceJson')?.setValue(jsonFile);
    
          // Automatically call the API with the files
          this.apiService.uploadShaclAndJson(shaclFile, jsonFile).subscribe(
            res => {
              this.jsonFileContent = this.formfieldService.readJsonFile(res.matchedSubjects);
              this.shaclFileContent = this.formfieldService.readShaclFile(res.shaclModel, this.jsonFileContent);
    
              this.filteredShapes = this.formfieldService.updateFilteredShapes(this.shaclFileContent);
              if (this.filteredShapes.length > 1) {
                this.router.navigate(['/select-shape'], { state: { file: this.shaclFileContent } });
              } else {
                this.updateSelectedShape();
                this.router.navigate(['/form'], { state: { file: this.shaclFileContent } });
              }
            },
            err => {
              this.requestError = true;
            }
          );
        },
        error => {
          console.error('Error fetching files:', error);
        }
      );  
  }
  
  
  updateSelectedShape(): void {
    const shape = this.filteredShapes[0];
    if (shape !== undefined) {
      this.shaclFileContent.shapes.find(x => x.name === shape.name).selected = true;
    }
  }
}



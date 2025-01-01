import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormField} from '@models/form-field.model';
import {Shape} from '@models/shape';
import {FormfieldControlService} from '@services/form-field.service';
import {ValidationControlService} from '@services/validation.service';
import {Utils} from '@shared/utils';

@Component({
  selector: 'app-dynamic-form-or',
  templateUrl: './dynamic-form-or.component.html',
  styleUrls: ['./dynamic-form-or.component.scss']
})
export class DynamicFormOrComponent implements OnInit {

  @Input() input: FormField = new FormField();
  @Input() form: FormGroup = new FormGroup({});
  @Input() shapes: Shape[] = [];
  nestedFormGroup: FormGroup = new FormGroup({});
  radioButtonSelected = '';
  orType = '';
  shapeFields: FormField[] = [];
  orObjects: string[] = [];
  orObjectsFound: boolean[] = [];
  groupName = '';

  constructor(private formfieldService: FormfieldControlService, private validationService: ValidationControlService) {
  }

  ngOnInit(): void {
    this.radioButtonSelected = this.input.controlTypes[0];
    this.groupName = this.getRandomValue();
    if (this.input.or[0] !== undefined) {
      this.input.datatype = this.input.or[0]['datatype'];
      if (this.input.or[0]['datatype'] !== undefined && this.input.or[0]['datatype'].prefix === 'xsd') {
        this.orType = 'datatype';
      } else {
        this.orType = 'class';
        this.getOrObjects();
        this.updateFormValidity();
        this.updateShapeFields();
      }
    }
  }

  onItemChangeDatatype(item, i): void {
    this.radioButtonSelected = item;
    // update the datatype of the main input or
    if (this.input.or[i] !== undefined) {
      this.input.datatype = this.input.or[i]['datatype'];
    }
    this.form.removeControl(this.input.id);
    this.form.addControl(this.input.id, new FormControl('', this.validationService.getValidatorFn(this.input)));
  }

  onItemChangeObject(item, i): void {
    this.radioButtonSelected = item;
    this.updateShapeFields(i);
  }

  updateShapeFields(index = 0): void {
    const datatypeObject = this.input.or[index]['datatype'];
    const classObject = this.input.or[index]['clazz'];
    let shape: Shape;
    if (datatypeObject) {
      shape = this.shapes.find(x => x.name === this.input.or[index]['datatype'].value);
    }
    if (classObject) {
      shape = this.shapes.find(x => x.name === this.input.or[index]['clazz'].value);
    }
    if (shape) {
      // We append the children fields of the first shape from the or array of shapes
      this.input.childrenSchema = shape.schema;
      this.shapeFields = shape.fields;
      this.input.childrenFields = this.shapeFields;
    }

    if (this.input.childrenFields.length > 0) {
      // Remove existing FormControl (the service adds it as a simple form control, we want it as a form group)
      this.form.removeControl(this.input.id);
      // Add the form group in the form array
      let nestedForm: any;
      nestedForm = this.formfieldService.toGroup(this.input.childrenFields, nestedForm);
      const validator = this.validationService.getValidatorFn(this.input);
      const nestedFormGroup = new FormGroup(nestedForm, validator);
      this.form.addControl(this.input.id, nestedFormGroup);
      this.nestedFormGroup = nestedFormGroup;
    }
  }

  getRandomValue(): string {
    return Utils.getRandomValue();
  }

  getOrObjects(): void {
    this.input.or.forEach(object => {
      const datatypeObject = object['datatype'];
      const classObject = object['clazz'];
      if (datatypeObject) {
        this.orObjects.push(datatypeObject.value);
        this.orObjectsFound.push(this.getOrObjectFound(datatypeObject.value));
      }
      if (classObject) {
        this.orObjects.push(classObject.value);
        this.orObjectsFound.push(this.getOrObjectFound(classObject.value));
      }
    });
  }

  getOrObjectFound(objectName: string): boolean {
    let found = false;
    const shape = this.shapes.find(x => x.name === objectName);
    if (shape) {
      found = true;
    }
    return found;
  }

  updateFormValidity(): void {
    // check whether all shapes were not found
    // if that is the case, then remove the required validator from the field
    if (this.orObjectsFound.every(x => !x)) {
      this.input.required = false;
      this.form.removeControl(this.input.id);
      this.form.addControl(this.input.id, new FormControl('', this.validationService.getValidatorFn(this.input)));
    }
  }

}

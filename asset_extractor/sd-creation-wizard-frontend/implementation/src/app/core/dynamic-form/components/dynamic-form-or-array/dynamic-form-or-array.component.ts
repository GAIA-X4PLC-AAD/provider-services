import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Utils} from '@shared/utils';
import {FormField} from '@models/form-field.model';
import {Shape} from '@models/shape';
import {FormfieldControlService} from '@services/form-field.service';
import {ValidationControlService} from '@services/validation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-form-or-array',
  templateUrl: './dynamic-form-or-array.component.html',
  styleUrls: ['./dynamic-form-or-array.component.scss']
})
export class DynamicFormOrArrayComponent implements OnInit {

  @Input() input: FormField = new FormField();
  @Input() form: FormGroup = new FormGroup({});
  @Input() shapes: Shape[] = [];
  inputs: FormField[] = [];
  radioButtonsSelected = [];
  enableButton = true;
  displayAddButton = true;
  orType = '';
  formGroups: any = [];
  allformFields: FormField[];
  orObjects: string[] = [];
  orObjectsFound: boolean[] = [];
  radioGroupIds: string[] = [];

  constructor(private formfieldService: FormfieldControlService, private validationService: ValidationControlService, public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.allformFields = this.shapes.find(shape => shape.selected)?.fields;
    this.displayAddButton = this.input.maxCount === undefined || this.input.maxCount > this.input.minCount;
    this.inputs.push(this.input);
    this.radioGroupIds[0] = Utils.getRandomValue();
    if (this.input.or[0] !== undefined) {
      this.input.datatype = this.input.or[0]['datatype'];
      if (this.input.or[0]['datatype'] !== undefined && this.input.or[0]['datatype'].prefix === 'xsd') {
        this.orType = 'datatype';
        this.radioButtonsSelected.push(this.input.controlTypes[0]);
        // In the for loop we specify the limit (this.input.minCount-1) because an input is already added
        for (let i = 0; i < this.input.minCount - 1; i++) {
          this.addInput();
        }
      } else {
        this.orType = 'class';
        this.getOrObjects();
        this.radioButtonsSelected.push(this.orObjects[0]);
        this.updateFormBasedOnObjectChange();
        this.updateFormValidity();
      }
    }
  }

  onItemChange(item, i, j): void {
    this.radioButtonsSelected[i] = item;
    const formField = this.inputs[i];
    if (formField.or[j] !== undefined) {
      formField.datatype = formField.or[j]['datatype'];
    }
    this.form.removeControl(formField.id);
    this.form.addControl(formField.id, new FormControl('', this.validationService.getValidatorFn(formField)));
  }

  copyFormField(formField: FormField): FormField {
    const newFormField = Object.assign({}, formField);
    newFormField.id = Utils.getRandomValue();
    return newFormField;
  }

  addInput(): void {
    const newInput = this.copyFormField(this.input);
    // add to the list of inputs iterated on this component
    const datatypeSelected = this.radioButtonsSelected[this.inputs.length - 1];
    this.inputs.push(newInput);
    this.radioGroupIds.push(Utils.getRandomValue());
    // add datatype selected as the previous field
    this.radioButtonsSelected.push(datatypeSelected);
    // add to the the list of all form fields
    this.allformFields.push(newInput);
    // update shape with the new list
    this.shapes.find(shape => shape.selected).fields = this.allformFields;
    const newFormControl = this.formfieldService.toGroup([newInput]);
    // add to the main form
    this.form.addControl(newInput.id, newFormControl[newInput.id]);
    this.updateEnableButton();
  }


  deleteInput(index: number): void {
    // find input to be removed
    const inputToBeRemoved = this.inputs[index];
    // remove from the list of inputs iterated on this component
    this.inputs.splice(index, 1);
    // remove radio group id
    this.radioGroupIds.splice(index, 1);
    // remove the the list of all form fields
    const indexInFormFields = this.allformFields.indexOf(inputToBeRemoved, 0);
    if (index > -1) {
      this.allformFields.splice(indexInFormFields, 1);
    }
    // update shape with the new list
    this.shapes.find(shape => shape.selected).fields = this.allformFields;
    // remove from the main form
    this.form.removeControl(inputToBeRemoved.id);
    this.updateEnableButton();
  }

  updateEnableButton(): void {
    const maxCount = this.input.maxCount;
    if (maxCount !== undefined) {
      this.enableButton = this.inputs.length < maxCount;
    }
  }

  addFullWidthClass(i): boolean {
    return !this.displayAddButton || (i !== 0 && i < this.input.minCount);
  }

  addNonFullWidthClass(i): boolean {
    return this.displayAddButton && (i === 0 || this.input.minCount === 1
      || this.input.maxCount === 0 || i >= this.input.minCount);
  }

  //#region Handling or property for objects
  onItemChangeObject(item, i, j): void {
    // i denotes the index of form group
    // j denotes the index of or object selected
    this.radioButtonsSelected[i] = item;
    this.updateFormBasedOnObjectChange(j, i, this.inputs[i]);
  }

  updateFormBasedOnObjectChange(orIndex = 0, formGroupIndex = 0, input = this.input): void {
    input = this.updateFormField(orIndex, input);
    if (input.childrenFields.length > 0) {
      // Remove existing FormControl/FormGroup
      this.form.removeControl(input.id);
      // Add the form group in the form array
      let nestedForm: any;
      nestedForm = this.formfieldService.toGroup(input.childrenFields, nestedForm);
      const validator = this.validationService.getValidatorFn(input);
      const nestedFormGroup = new FormGroup(nestedForm, validator);
      this.form.addControl(input.id, nestedFormGroup);
      this.formGroups[formGroupIndex] = this.form.controls[input.id];
    }
  }

  updateFormField(index, input): FormField {
    // Get the fields of the first object
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
      input.childrenSchema = shape.schema;
      input.childrenFields = shape.fields;
    }
    return input;
  }

  addInputObject(): void {
    const newInput = this.copyFormField(this.input);
    // add to the list of inputs iterated on this component
    const datatypeSelected = this.radioButtonsSelected[this.inputs.length - 1];
    this.inputs.push(newInput);
    this.radioGroupIds.push(Utils.getRandomValue());
    // add datatype selected as the previous field
    this.radioButtonsSelected.push(datatypeSelected);
    // add to the the list of all form fields
    this.allformFields.push(newInput);
    // update shape with the new list
    this.shapes.find(shape => shape.selected).fields = this.allformFields;
    // create group form
    let nestedForm: any;
    nestedForm = this.formfieldService.toGroup(newInput.childrenFields, nestedForm);
    const validator = this.validationService.getValidatorFn(newInput);
    const nestedFormGroup = new FormGroup(nestedForm, validator);
    this.form.addControl(newInput.id, nestedFormGroup);
    this.formGroups.push(this.form.controls[newInput.id]);
    this.updateEnableButton();
  }

  deleteInputObject(index: number): void {
    // find input to be removed
    const inputToBeRemoved = this.inputs[index];
    // remove from the list of inputs iterated on this component
    this.inputs.splice(index, 1);
    // remove radio group id
    this.radioGroupIds.splice(index, 1);
    // remove the the list of all form fields
    const indexInFormFields = this.allformFields.indexOf(inputToBeRemoved, 0);
    if (index > -1) {
      this.allformFields.splice(indexInFormFields, 1);
    }
    // update shape with the new list
    this.shapes.find(shape => shape.selected).fields = this.allformFields;
    // remove from the forms groups array
    if (this.formGroups.length !== 1) {
      this.formGroups.splice(index, 1);
    }
    // remove from the main form
    this.form.removeControl(inputToBeRemoved.id);
    this.updateEnableButton();
  }

  //#endregion

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

  allShapesNotFound(): boolean {
    return this.orObjects.every(x => !x);
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

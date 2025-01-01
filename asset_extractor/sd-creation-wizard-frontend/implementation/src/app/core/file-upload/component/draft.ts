
    this.httpClient.get(`${extractorUrl}/sendFiles`, { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;

        // Parse the multipart data
        const boundary = '--myboundary'; // Replace with the actual boundary from the response headers
        const parts = data.split(boundary);

        // Iterate through the parts and extract JSON and TTL data
        let jsonContent: any, ttlContent: string;
        parts.forEach(part => {
          if (part.includes('Content-Type: application/json')) {
            jsonContent = JSON.parse(part.trim().split('\r\n\r\n')[1]);
          } else if (part.includes('Content-Type: application/x-turtle')) {
            ttlContent = part.trim().split('\r\n\r\n')[1];
          }
        });
      
        // Now you have the JSON and TTL data in jsonContent and ttlContent variables
        console.log(jsonContent);
        console.log(ttlContent);

        const jsonFile: File = new File([jsonContent], 'meta.json', { type: 'application/json' });
        const shaclFile: File = new File([ttlContent], 'meta.json', { type: ' application/x-turtle' });
        // Set the form values as if the user had uploaded them
        this.form.get('fileSource')?.setValue(shaclFile);
        this.form.get('fileSourceJson')?.setValue(jsonFile);
  
        // Automatically call the API with the files
        this.apiService.uploadShaclAndJson(shaclFile, jsonFile).subscribe(
          res => {
            console.log("res.shaclModel: ", res.shaclModel);
            console.log("res.matchedSubjects: ", res.matchedSubjects);
  
            this.jsonFileContent = this.formfieldService.readJsonFile(res.matchedSubjects);
            this.shaclFileContent = this.formfieldService.readShaclFile(res.shaclModel, this.jsonFileContent);
  
            console.log("shaclFile: ", this.shaclFileContent);
            console.log("jsonFile: ", this.jsonFileContent);
  
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
      };
      reader.readAsText(blob);
    });
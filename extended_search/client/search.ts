async function fetchData() {
    try {
        //just create result container inside the output division for the results to be listed there (need a parent div for result container to implement css fronnt end properly)
        const outputDiv = document.getElementById('outputDiv');
        const resultContainer = document.createElement('div');
        resultContainer.id = "resultContainer";
        outputDiv?.appendChild(resultContainer);
        
        
        const jsonContent = document.getElementById("jsonContent");
        const jsonElement = document.getElementById('scriptChoice');
        if (jsonContent) {
            const jsonDataStr = jsonContent.getAttribute('data-json');
            if (jsonDataStr) {
                const jsonData = JSON.parse(jsonDataStr);
                //create deopdown menu
                const dropdownMenu = document.createElement('select');
                dropdownMenu.name = 'selectedScript';
                dropdownMenu.required = true;
                const dropdownMenulabel = document.createElement('label');
                dropdownMenulabel.textContent = "Select a Script";
                jsonElement?.appendChild(dropdownMenulabel);

                const placeholderOption = document.createElement('option');
                placeholderOption.text = "Select";
                placeholderOption.value = "";    
                placeholderOption.disabled = true;
                placeholderOption.selected = true;                   
                dropdownMenu.add(placeholderOption);
            
                // Add each key (the folder name : py script file name) as an option in the dropdown menu
                Object.keys(jsonData).forEach((key) => {
                    Object.keys(jsonData[key]).forEach((scriptName) => {
                    const option = document.createElement('option');
                    option.text = key +' : ' + scriptName;
                    option.value = key + ':' + scriptName; //no spaces in the var value
                    dropdownMenu.add(option);
                    });
                });

                //append the dropdown menu
                jsonElement?.appendChild(dropdownMenu);     

                // Function to update the input fields based on the selected key
                function updateInputFields(selectedKey: string | number |null) {
                    if(selectedKey && typeof selectedKey === 'string'){
                        const folderName : string = selectedKey.substring(0, selectedKey.indexOf(':'));
                        const scriptName : string = selectedKey.substring(selectedKey.indexOf(':') + 1, selectedKey.length);
                        const selectedData = jsonData[folderName][scriptName];
                        const inputFieldsContainer = document.getElementById('inputFieldsContainer');
                        if (inputFieldsContainer) {
                            inputFieldsContainer.innerHTML = ''; // clear previous input fields
                            Object.keys(selectedData).forEach((attribute) => {
                                const attributeInfo = selectedData[attribute];
                                //label of the input field
                                const label = document.createElement('label');
                                label.textContent = attributeInfo["@description"];

                                const input = document.createElement('input');
                                input.required = true;
                                input.type = attributeInfo["@type"];
                                if(attributeInfo["@min"]) input.min = attributeInfo["@min"];
                                input.name = attribute.replace(/ /g,"_");//replace the white spaces of the attribs here to get it back on server with white spaces as in the json file!; //populate here with the name of the attribute to get it on server                            

                                //append them
                                inputFieldsContainer.appendChild(label);
                                inputFieldsContainer.appendChild(input);
                            });
                        }
                    }
                }
        
                // Listen for the input event on the dropdown menu
                dropdownMenu.addEventListener('change', (event) => {
                    const target = event.target as HTMLSelectElement;
                    const selectedKey = target? target.value : null;
                    updateInputFields(selectedKey);
                });
            }
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// called when the page loads
document.addEventListener('DOMContentLoaded', fetchData);
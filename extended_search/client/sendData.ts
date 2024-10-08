const form = document.getElementById('searchForm');

if (form) {
    form.onsubmit = async (event) => {
        event.preventDefault();
        // Convert FormData to URLSearchParams
        const formData = new FormData(form as HTMLFormElement);
        const urlEncodedData = new URLSearchParams();

        // Append each field from FormData into URLSearchParams
        formData.forEach((value, key) => {
            urlEncodedData.append(key, value as string);
        });
        
        // Send the form data to the server
        let response = await fetch('/searchSubmit', {
            method: 'POST',
            //body: new FormData(form as HTMLFormElement)
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Explicitly set the Content-Type header
            },
            body: urlEncodedData.toString() // Send URL-encoded form data
        });

       // response from server
       let responseData = await response.json();
       let result = responseData.result;

        // Call the function to display the JSON object
        //displayResults(result);
        const resultContainer = document.getElementById('resultContainer');
        if (resultContainer) {
        // Clear the previous results
        resultContainer.innerHTML = "";
        resultContainer.style.whiteSpace = "pre"; 
        resultContainer.style.float = 'left';
        resultContainer.style.clear = 'both';
        resultContainer.style.margin = '1em 0';
        resultContainer.textContent = `  ${JSON.stringify(result, null, 2)}`; 
        }
    }   
}

function displayResults(data : any) {
    const resultContainer = document.getElementById('resultContainer');
    
    if (resultContainer) {
      // Clear the previous results
      resultContainer.innerHTML = "";
      
      // Ensure white-space formatting is respected
      resultContainer.style.whiteSpace = "pre"; 
  
      // Check if there's no data at all
      if (Object.keys(data).length === 0) {
        resultContainer.textContent = "Ouch! No matching track was found!";
        return;
      }
  
      // Prepare the formatted result string
      let formattedResult = '';
      for (const [file, matches] of Object.entries(data)) {
        // Add the file name
        formattedResult += `'${file}': [\n`;
        
        if (Array.isArray(matches)) {
          // If matches is an array, display each item
          matches.forEach((match, index) => {
            formattedResult += `  '${match}'${index < matches.length - 1 ? ',' : ''}\n`;
          });
        } else if (typeof matches === 'string') {
          // If matches is a string
          formattedResult += `  '${matches}'\n`;
        } else if (typeof matches === 'object' && matches !== null) {
          // If matches is an object (non-null), convert it to a string
          formattedResult += `  ${JSON.stringify(matches, null, 2)}\n`;
        } else {
          // If matches is null, undefined, or of another type
          formattedResult += `  'No matching data available'\n`;
        }
  
        formattedResult += '],\n\n';
      }
  
      // Set the formatted result into the resultContainer
      resultContainer.textContent = formattedResult.trimEnd();
    }
}
  

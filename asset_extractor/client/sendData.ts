const form = document.getElementById('dataForm');

if (form) {
    form.onsubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(form as HTMLFormElement);
        
        // Send the form data to the server
        let response = await fetch('/submit', {
        method: 'POST',
        body: formData
        });

        const responseData = await response.json();  // Extract the JSON response

        // Process response from server        
        const result = responseData.result;
        const resultContainer = document.getElementById('resultContainer');
        if (resultContainer) {          
            resultContainer.innerHTML = ""; // clear previous results
            if (response.ok) {
                //alert(result);
                resultContainer.innerHTML = `<p class="log-text">${result}</p>`;
            } else {
                // Extract error message from the response if available
                let errorMessage = responseData.error || 'Failed to upload files';
                //alert(errorMessage);
                resultContainer.innerHTML = errorMessage;
            }
        };
    }
}


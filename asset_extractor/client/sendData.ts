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
        if (response.ok) {
        const result = responseData.result;
        alert(result);
        } else {
        // Extract error message from the response if available
        let errorMessage = responseData.error || 'Failed to upload files';
        alert(errorMessage);
        }
    };
}


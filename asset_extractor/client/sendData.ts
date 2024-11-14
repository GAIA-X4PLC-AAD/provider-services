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

        // Extract the JSON response
        const responseData = await response.json();    
        const uploadResult = responseData.result;
        const resultContainer = document.getElementById('resultContainer');
        
        if (resultContainer) {
            resultContainer.innerHTML = ""; // clear previous results
            if (response.ok) {
                resultContainer.innerHTML = `<p class="log-text">${uploadResult}</p>`;
                
                // Start listening to the /pythonCall endpoint for real-time updates
                const eventSource = new EventSource('/pythonCall');

                eventSource.onmessage = (event) => {
                    //server closed the sse connection (executing py finished) OR  
                    //if (!event || event.data === 'END') {
                    if (event.data.trim() === 'END_SSE_CONNECTION') {
                        eventSource.close();
                    } else {
                        const logMessage = event.data.replace(/\n/g, '<br>'); 
                        resultContainer.innerHTML += `<p class="log-text">${logMessage}</p>`;
                    };
                };
                eventSource.onerror = (err) => {
                    console.error("SSE connection error: ", err);
                    eventSource.close();
                };
            } else {
                // Extract error message from the response if available
                let errorMessage = responseData.error || 'Failed to upload files';
                resultContainer.innerHTML = `<p class="log-text-error">${errorMessage}</p>`;
            }
        }
    };
}

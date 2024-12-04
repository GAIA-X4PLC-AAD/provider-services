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
                //const sdWizardUrl = 'http://localhost:80/upload'; //sd creation wizard on port 80--see docker-compose.yml
                //window.open(sdWizardUrl);
                // Start listening to the /pythonCall endpoint for real-time updates
                const eventSource = new EventSource('/pythonCall');

                eventSource.onmessage = (event) => {
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

         // Poll the /openSdWizard endpoint for Python's notification
         pollOpenSdWizard();
        };
    }
    let pollingInterval: any | undefined;

    // Poll the `/openSdWizard` endpoint
    async function pollOpenSdWizard() {
        try {
            const response = await fetch('/openSdWizard', { method: 'GET' });
    
            if (response.ok) {
                if (response.status === 204) {
                    // No trigger yet; do nothing
                    return;
                }
    
                // Parse JSON only if there's a valid response body
                const data = await response.json();
                if (data.command === 'openSdWizard') {
                    console.log('Trigger received to open SD Wizard!');
                    window.open(data.url); // Open the SD Wizard page
                    
                    // Stop polling after opening the SD Wizard
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        console.log('Stopped polling for SD Wizard trigger.');
                    }
                }
            } else {
                console.error(`Polling failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error polling SD Wizard:', error);
        }
    }
    
    
    // Start polling at intervals (e.g., every 5 seconds)
    pollingInterval = setInterval(pollOpenSdWizard, 5000);
    

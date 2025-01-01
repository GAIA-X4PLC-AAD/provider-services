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

let pollingInterval: number | undefined  = undefined;
if (pollingInterval) {
    clearInterval(pollingInterval);
    console.log('Cleared previous polling interval.');
}

pollingInterval = window.setInterval(() => {
    console.log('Polling SD Wizard...');
    pollOpenSdWizard();
}, 5000);

const form = document.getElementById('dataForm');

if (form) {
    form.onsubmit = async (event) => {
        // User clicked submit again; disable the download button
        const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
        if (downloadButton) {
            downloadButton.disabled = true;
        }
        event.preventDefault();
    
        // Clear previous polling interval if it exists
        if (pollingInterval) {
            clearInterval(pollingInterval);
            console.log('Cleared previous polling interval before restarting.');
        }
    
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
                    if (event.data.trim() === 'END_SSE_CONNECTION') {
                        // Python process for asset.zip generating is done; enable download
                        if (downloadButton) {
                            downloadButton.disabled = false;
                            downloadButton.addEventListener('click', () => {
                                window.location.href = '/download';
                            });
                        }
                        console.log("SSE connection closed by server gracefully!!");
                        eventSource.close();
                    } else {
                        const logMessage = event.data.replace(/\n/g, '<br>');
                        resultContainer.innerHTML += `<p class="log-text">${logMessage}</p>`;
                    }
                };
    
                eventSource.onerror = (err) => {
                    console.error("SSE connection error: ", err);
                    eventSource.close();
                };
            } else {
                // Extract error message from the response if available
                const errorMessage = responseData.error || 'Failed to upload files';
                resultContainer.innerHTML = `<p class="log-text-error">${errorMessage}</p>`;
            }
        }
    
        // Restart polling for the wizard after form submission
        pollingInterval = window.setInterval(() => {
            console.log('Polling SD Wizard...');
            pollOpenSdWizard();
        }, 5000);
        console.log('Restarted polling interval for SD Wizard.');
    };
    
}

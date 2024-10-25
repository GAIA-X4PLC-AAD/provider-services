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
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Explicitly set the Content-Type header
        },
        body: urlEncodedData.toString() // Send URL-encoded form data
      });

      // response from server
      let responseData = await response.json();
      let result = responseData.result;

      // display the JSON object
      displayMatches(result,'resultContainer');
    }   
}

function displayMatches(result: Record<string, string[]>, containerId: string): void {
  const resultContainer = document.getElementById(containerId);

  if (resultContainer) {
    // Clear previous results
    resultContainer.innerHTML = "";

    // Counting total matches
    let totalMatches: number = 0;
    for (const logs of Object.values(result)) {
      totalMatches += logs.length;
    }

    // Start by showing the count of matches with two line breaks after
    let outputHTML: string = `<p class="match-count">Found ${totalMatches} matches</p>`;

    // Loop through each object in the JSON
    for (const [bjsonName, logArray] of Object.entries(result)) {
      // Format the bjson name and logs
      outputHTML += `<p class="bold-p">${bjsonName}</p>`;
      
      if (logArray.length === 0) {
        outputHTML += `<p class="log-text">No matches found.</p>`;
      } else {
        logArray.forEach((log: string) => {
          outputHTML += `<p class="log-text">${log}</p>`;
        });
      }
    }

    // Insert the formatted HTML into the container
    resultContainer.innerHTML = outputHTML;
  }
}

interface MediaType {
    value: string;
    text: string;
    type: string;
}

function creatMediaTypeSelect (mediaTypeDiv : HTMLElement, mediaTypes : MediaType[]){
    const mediaDropdownMenu = document.createElement('select');
    mediaDropdownMenu.id = 'mediaTypeSelect';
    mediaDropdownMenu.required = false;

    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select media type";
    placeholderOption.value = "";    
    placeholderOption.disabled = true;
    placeholderOption.selected = true;                   
    mediaDropdownMenu.add(placeholderOption);

    for(const mediaType of mediaTypes){
        const option = document.createElement('option');
        option.text = mediaType.text;
        option.value = mediaType.value;  
        mediaDropdownMenu.add(option);
    }

    mediaTypeDiv?.appendChild(mediaDropdownMenu);
    return mediaDropdownMenu;
}
async function createGUI() {
    try {
        const mediaTypes: MediaType[] = [
            { value: 'document', text: 'Document', type: '.txt,.pdf' },
            { value: 'image', text: 'Image', type: '.png,.jpg' },
            { value: 'routing', text: 'Routing', type: '.geojson' },
            { value: 'video', text: 'Video', type: '.mp4' },
            { value: '3DPreview', text: '3DPreview', type: '.geojson' }
        ];
        
        const mediaContainer = document.getElementById('mediaContainer') as HTMLElement;
        const addMediaBtn = document.getElementById('addMediaBtn') as HTMLButtonElement;
        const mediaTypeDiv = document.getElementById('mediaType') as HTMLElement;
        const mediaDropdownMenu = creatMediaTypeSelect(mediaTypeDiv,mediaTypes);
        
        
        // Function to add a new media file input based on selected media type
        function addMediaInput(mediaType: MediaType) {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'media-input';
        
            // Input for media file
            const mediaFileLabel = document.createElement('label');
            mediaFileLabel.textContent = `${mediaType.text} file: `;
            mediaDiv.appendChild(mediaFileLabel);
        
            const mediaFileInput = document.createElement('input');
            mediaFileInput.type = 'file';
            mediaFileInput.name = `${mediaType.value}File`;
            mediaFileInput.accept = mediaType.type;
            mediaFileInput.required = true;
            mediaDiv.appendChild(mediaFileInput);
        
            var br = document.createElement("br");
            mediaDiv.appendChild(br);
            const mediaFileDescription = document.createElement('textarea');
            //mediaFileDescription.type = 'text';
            mediaFileDescription.setAttribute("cols", "50");
            mediaFileDescription.setAttribute("rows", "5");
            mediaFileDescription.placeholder = 'Describe the media file';
            mediaFileDescription.name = `${mediaType.value}FileDescription`; //array of (MediaType)FileDescription
            mediaFileDescription.maxLength = 250;
            mediaDiv.appendChild(mediaFileDescription);

            //remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            mediaDiv.appendChild(removeButton);
            // Add the new media input section to the container
            mediaContainer.appendChild(mediaDiv);
            removeButton.addEventListener('click', function() {
            mediaContainer.removeChild(mediaDiv);
            });
        }
        
        // Event listener for the Add Media button
        addMediaBtn.addEventListener('click', () => {
            
            const selectedValue = mediaDropdownMenu.value;//mediaTypeDiv.getElementsByTagName('select')[0].value;
            if (!selectedValue) {
                alert('Please select a media type.');
                return;
            }
        
            // Find the selected media type in the mediaTypes array
            const selectedMediaType = mediaTypes.find(media => media.value === selectedValue);
            if (selectedMediaType) {
                addMediaInput(selectedMediaType);
            }
        });    
    } catch (error) {
        console.error('Error creating GUI:', error);
    }
}
document.addEventListener('DOMContentLoaded', createGUI);
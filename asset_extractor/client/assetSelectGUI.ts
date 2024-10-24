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
            { value: 'Document', text: 'Document', type: '.txt,.pdf' },
            { value: 'License', text: 'License', type: '.txt,.pdf,.md' },
            { value: 'Metadata', text: 'Metadata', type: '.json' },
            { value: 'Service', text: 'Service', type: '.bjson' },
            { value: 'Validation', text: 'Validation', type: '.xqar,.xml,.json' },
            { value: 'Image', text: 'Image', type: '.png,.jpg' },
            { value: 'Routing', text: 'Routing', type: '.geojson' },
            { value: 'Video', text: 'Video', type: '.mp4' },
            { value: '3DPreview', text: '3DPreview', type: '.geojson' }
        ];
        
        const mediaContainer = document.getElementById('mediaContainer') as HTMLElement;
        const mediaTypeDiv = document.getElementById('mediaType') as HTMLElement;
        const mediaDropdownMenu = creatMediaTypeSelect(mediaTypeDiv,mediaTypes);    
        
        // Function to add a new media file input based on selected media type
        function addMediaInput(mediaType : MediaType) {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'media-input'; // Apply the grid class
            
            // Label
            const mediaFileLabel = document.createElement('label');
            mediaFileLabel.textContent = `${mediaType.text}`;
            mediaDiv.appendChild(mediaFileLabel);
            
            // Input
            const mediaFileInput = document.createElement('input');
            mediaFileInput.type = 'file';
            mediaFileInput.name = `${mediaType.value}`;
            mediaFileInput.accept = mediaType.type;
            mediaFileInput.required = true;
            mediaDiv.appendChild(mediaFileInput);
            
            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'x';
            mediaDiv.appendChild(removeButton);
            
            // Add the new media input to the container
            mediaContainer.appendChild(mediaDiv);
            
            // Remove functionality
            removeButton.addEventListener('click', function() {
                mediaContainer.removeChild(mediaDiv);
            });
        }
        
        // Trigger addMediaInput when a media type is selected
        mediaDropdownMenu.addEventListener('change', () => {
            const selectedValue = mediaDropdownMenu.value;

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
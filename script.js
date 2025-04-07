// Determine if we're running on GitHub Pages or locally
const isGitHubPages = window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/PDUViewer' : '';

// Helper function to clean paths
function cleanPath(path) {
  return path.replace('/PDUViewer/', '').replace(/^\/+/, '');
}

// Handles loading the events for <model-viewer>'s slotted progress bar
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
  } else {
    progressBar.classList.remove('hide');
  }
};

// Get the model-viewer element
const modelViewer = document.querySelector('#active-model');
modelViewer.addEventListener('progress', onProgress);

// Load devices from JSON and create carousel items
async function loadDevices() {
  try {
    console.log('Začínam načítavať zariadenia...');
    const response = await fetch(basePath + '/devices.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Načítané dáta:', data);

    // Populate filter options
    const typeFilter = document.getElementById('type-filter');
    const inputFilter = document.getElementById('input-filter');
    
    // Get unique types and inputs
    const types = [...new Set(data.devices.map(device => device.specifications.type))];
    const inputs = [...new Set(data.devices.map(device => device.specifications.input))];
    
    // Add type options
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });
    
    // Sort inputs numerically
    const sortedInputs = inputs.sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
    
    // Add input options
    sortedInputs.forEach(input => {
      const option = document.createElement('option');
      option.value = input;
      option.textContent = input;
      inputFilter.appendChild(option);
    });

    // Add event listeners for filters
    typeFilter.addEventListener('change', () => filterDevices(data.devices));
    inputFilter.addEventListener('change', () => filterDevices(data.devices));

    // Initial render
    filterDevices(data.devices);
  } catch (error) {
    console.error('Chyba pri načítavaní zariadení:', error);
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.innerHTML = `<div class="error-message">Chyba pri načítavaní zariadení: ${error.message}</div>`;
    }
  }
}

function filterDevices(devices) {
  const typeFilter = document.getElementById('type-filter').value;
  const inputFilter = document.getElementById('input-filter').value;
  
  const filteredDevices = devices.filter(device => {
    const typeMatch = !typeFilter || device.specifications.type === typeFilter;
    const inputMatch = !inputFilter || device.specifications.input === inputFilter;
    return typeMatch && inputMatch;
  });
  
  renderDevices(filteredDevices);
}

function renderDevices(devices) {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  
  // Clear existing items
  carousel.innerHTML = '';
  
  // Create carousel items for each device
  devices.forEach((device, index) => {
    console.log('Vytváram položku pre:', device.name);
    
    // Clean paths
    const thumbnailPath = cleanPath(device.thumbnail);
    const modelPath = cleanPath(device.modelPath);
    
    const item = document.createElement('div');
    item.className = 'carousel-item';
    if (index === 0) item.classList.add('selected');
    
    item.innerHTML = `
      <img src="${basePath}/${thumbnailPath}" alt="${device.name}">
      <h3>${device.name}</h3>
      <p class="device-description">${device.description}</p>
      <div class="device-specs">
        <p><strong>Type:</strong> ${device.specifications.type}</p>
        <p><strong>Input:</strong> ${device.specifications.input}</p>
        <div class="features">
          ${device.specifications.features.map(feature => 
            `<span class="feature">${feature}</span>`
          ).join('')}
        </div>
      </div>
    `;
    
    // Add click event listener
    item.addEventListener('click', () => {
      console.log('Kliknuté na:', device.name);
      console.log('Načítavam model:', modelPath);
      modelViewer.src = `${basePath}/${modelPath}`;
      // Highlight selected item
      document.querySelectorAll('.carousel-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
    
    carousel.appendChild(item);
  });
}

// Load devices when the page loads
document.addEventListener('DOMContentLoaded', loadDevices);
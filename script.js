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
    const response = await fetch('/PDUViewer/devices.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Načítané dáta:', data);

    const carousel = document.querySelector('.carousel');
    if (!carousel) {
      throw new Error('Carousel element nebol nájdený!');
    }
    
    // Clear existing items
    carousel.innerHTML = '';
    
    // Create carousel items for each device
    data.devices.forEach((device, index) => {
      console.log('Vytváram položku pre:', device.name);
      
      const item = document.createElement('div');
      item.className = 'carousel-item';
      if (index === 0) item.classList.add('selected');
      
      item.innerHTML = `
        <img src="${device.thumbnail}" alt="${device.name}">
        <h3>${device.name}</h3>
        <p class="device-description">${device.description}</p>
        <div class="device-specs">
          <p><strong>Type:</strong> ${device.specifications.type}</p>
          <p><strong>Category:</strong> ${device.specifications.category}</p>
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
        console.log('Načítavam model:', device.modelPath);
        modelViewer.src = device.modelPath;
        // Highlight selected item
        document.querySelectorAll('.carousel-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
      
      carousel.appendChild(item);
    });

    console.log('Načítavanie zariadení dokončené');
  } catch (error) {
    console.error('Chyba pri načítavaní zariadení:', error);
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      carousel.innerHTML = `<div class="error-message">Chyba pri načítavaní zariadení: ${error.message}</div>`;
    }
  }
}

// Load devices when the page loads
document.addEventListener('DOMContentLoaded', loadDevices);
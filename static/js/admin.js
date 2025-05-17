// Admin.js - Scripts for the Tourist Management System admin panel

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const mobileToggle = document.querySelector('.admin-mobile-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Destinations management
    const destinationsList = document.getElementById('destinations-list');
    const addDestinationForm = document.getElementById('add-destination-form');
    const editDestinationForm = document.getElementById('edit-destination-form');
    const imagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('destination-image');
    const editImageUrlInput = document.getElementById('edit-destination-image');
    const editImagePreview = document.getElementById('edit-image-preview');
    
    // Image preview functionality
    if (imageUrlInput && imagePreview) {
        imageUrlInput.addEventListener('input', function() {
            updateImagePreview(this.value, imagePreview);
        });
    }
    
    if (editImageUrlInput && editImagePreview) {
        editImageUrlInput.addEventListener('input', function() {
            updateImagePreview(this.value, editImagePreview);
        });
    }
    
    // Update image preview
    function updateImagePreview(url, previewElement) {
        if (url && isValidUrl(url)) {
            previewElement.src = url;
            previewElement.style.display = 'block';
        } else {
            previewElement.style.display = 'none';
        }
    }
    
    // Fetch and display destinations
    function fetchDestinations() {
        if (!destinationsList) return;
        
        showLoading(destinationsList);
        
        fetch('/api/admin/destinations')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderDestinations(data.destinations);
                } else {
                    showError(destinationsList, data.message || 'Failed to load destinations');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(destinationsList, 'An error occurred while fetching destinations');
            });
    }
    
    // Render destinations list
    function renderDestinations(destinations) {
        if (!destinationsList) return;
        
        if (destinations.length === 0) {
            destinationsList.innerHTML = '<tr><td colspan="5" class="text-center">No destinations found</td></tr>';
            return;
        }
        
        let html = '';
        destinations.forEach(destination => {
            html += `
                <tr>
                    <td><img src="${destination.image_url}" alt="${destination.name}" class="img-thumbnail"></td>
                    <td>${destination.name}</td>
                    <td>${formatPrice(destination.price)}</td>
                    <td>${destination.description.substring(0, 50)}...</td>
                    <td class="admin-actions">
                        <button class="admin-btn admin-btn-primary admin-btn-sm edit-destination-btn" 
                            data-id="${destination.id}" 
                            data-name="${destination.name}" 
                            data-description="${destination.description}" 
                            data-image="${destination.image_url}" 
                            data-price="${destination.price}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="admin-btn admin-btn-danger admin-btn-sm delete-destination-btn" data-id="${destination.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        destinationsList.innerHTML = html;
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-destination-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const name = this.dataset.name;
                const description = this.dataset.description;
                const imageUrl = this.dataset.image;
                const price = this.dataset.price;
                
                openEditDestinationModal(id, name, description, imageUrl, price);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-destination-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                if (confirm('Are you sure you want to delete this destination?')) {
                    deleteDestination(id);
                }
            });
        });
    }
    
    // Open edit destination modal
    function openEditDestinationModal(id, name, description, imageUrl, price) {
        document.getElementById('edit-destination-id').value = id;
        document.getElementById('edit-destination-name').value = name;
        document.getElementById('edit-destination-description').value = description;
        document.getElementById('edit-destination-image').value = imageUrl;
        document.getElementById('edit-destination-price').value = price;
        
        // Update image preview
        updateImagePreview(imageUrl, document.getElementById('edit-image-preview'));
        
        // Show modal
        document.getElementById('edit-destination-modal').classList.add('show');
    }
    
    // Close edit destination modal
    document.getElementById('close-edit-modal')?.addEventListener('click', function() {
        document.getElementById('edit-destination-modal').classList.remove('show');
    });
    
    // Add destination
    if (addDestinationForm) {
        addDestinationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('destination-name').value;
            const description = document.getElementById('destination-description').value;
            const imageUrl = document.getElementById('destination-image').value;
            const price = document.getElementById('destination-price').value;
            
            // Validate inputs
            if (!name || !description || !imageUrl || !price) {
                showAlert('All fields are required', 'danger');
                return;
            }
            
            // Disable submit button
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
            
            // Send request to add destination
            fetch('/api/admin/destinations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    imageUrl: imageUrl,
                    price: parseFloat(price)
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Destination added successfully', 'success');
                    addDestinationForm.reset();
                    imagePreview.style.display = 'none';
                    fetchDestinations();
                } else {
                    showAlert(data.message || 'Failed to add destination', 'danger');
                }
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while adding the destination', 'danger');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }
    
    // Edit destination
    if (editDestinationForm) {
        editDestinationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('edit-destination-id').value;
            const name = document.getElementById('edit-destination-name').value;
            const description = document.getElementById('edit-destination-description').value;
            const imageUrl = document.getElementById('edit-destination-image').value;
            const price = document.getElementById('edit-destination-price').value;
            
            // Validate inputs
            if (!name || !description || !imageUrl || !price) {
                showAlert('All fields are required', 'danger', 'edit-alerts');
                return;
            }
            
            // Disable submit button
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
            
            // Send request to update destination
            fetch(`/api/admin/destinations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    imageUrl: imageUrl,
                    price: parseFloat(price)
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Destination updated successfully', 'success', 'edit-alerts');
                    setTimeout(() => {
                        document.getElementById('edit-destination-modal').classList.remove('show');
                        fetchDestinations();
                    }, 1500);
                } else {
                    showAlert(data.message || 'Failed to update destination', 'danger', 'edit-alerts');
                }
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while updating the destination', 'danger', 'edit-alerts');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }
    
    // Delete destination
    function deleteDestination(id) {
        fetch(`/api/admin/destinations/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Destination deleted successfully', 'success');
                fetchDestinations();
            } else {
                showAlert(data.message || 'Failed to delete destination', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred while deleting the destination', 'danger');
        });
    }
    
    // Helper functions
    function showAlert(message, type, containerId = 'alerts') {
        const alertsContainer = document.getElementById(containerId);
        if (!alertsContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `admin-alert admin-alert-${type}`;
        alert.textContent = message;
        
        alertsContainer.innerHTML = '';
        alertsContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 3000);
    }
    
    function showLoading(container) {
        container.innerHTML = '<tr><td colspan="5" class="text-center"><div class="admin-loader"></div></td></tr>';
    }
    
    function showError(container, message) {
        container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${message}</td></tr>`;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Initialize
    fetchDestinations();
});

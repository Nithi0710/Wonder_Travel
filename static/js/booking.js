// Booking.js - Handles the booking process

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const bookingSteps = document.querySelectorAll('.booking-step');
    const bookingSections = document.querySelectorAll('.booking-section');
    const prevButtons = document.querySelectorAll('.booking-prev');
    const nextButtons = document.querySelectorAll('.booking-next');
    const bookingForm = document.getElementById('booking-form');
    
    // Current step
    let currentStep = 0;
    
    // Booking data
    const bookingData = {
        destinationId: document.getElementById('destination-id')?.value,
        numAdults: 0,
        startDate: '',
        endDate: '',
        travelers: [],
        contactEmail: '',
        contactPhone: ''
    };
    
    // Initialize steps visibility
    function initializeSteps() {
        bookingSections.forEach((section, index) => {
            if (index === currentStep) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        updateStepIndicators();
    }
    
    // Update step indicators
    function updateStepIndicators() {
        bookingSteps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }
    
    // Navigate to the next step
    function nextStep() {
        if (validateCurrentStep()) {
            bookingSections[currentStep].classList.remove('active');
            currentStep++;
            bookingSections[currentStep].classList.add('active');
            updateStepIndicators();
            window.scrollTo(0, 0);
            
            // If it's the traveler details step, generate forms
            if (currentStep === 2) {
                generateTravelerForms();
            }
            
            // If it's the summary step, show booking summary
            if (currentStep === 4) {
                generateBookingSummary();
            }
        }
    }
    
    // Navigate to the previous step
    function prevStep() {
        bookingSections[currentStep].classList.remove('active');
        currentStep--;
        bookingSections[currentStep].classList.add('active');
        updateStepIndicators();
        window.scrollTo(0, 0);
    }
    
    // Validate the current step
    function validateCurrentStep() {
        switch (currentStep) {
            case 0: // Number of Adults
                const numAdultsInput = document.getElementById('num-adults');
                const numAdults = parseInt(numAdultsInput.value);
                
                if (isNaN(numAdults) || numAdults < 1 || numAdults > 10) {
                    showValidationError(numAdultsInput, 'Please enter a valid number of adults (1-10)');
                    return false;
                }
                
                bookingData.numAdults = numAdults;
                return true;
                
            case 1: // Journey Dates
                const startDateInput = document.getElementById('start-date');
                const endDateInput = document.getElementById('end-date');
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (isNaN(startDate.getTime())) {
                    showValidationError(startDateInput, 'Please select a valid start date');
                    return false;
                }
                
                if (isNaN(endDate.getTime())) {
                    showValidationError(endDateInput, 'Please select a valid end date');
                    return false;
                }
                
                if (startDate < today) {
                    showValidationError(startDateInput, 'Start date cannot be in the past');
                    return false;
                }
                
                if (endDate <= startDate) {
                    showValidationError(endDateInput, 'End date must be after start date');
                    return false;
                }
                
                bookingData.startDate = startDateInput.value;
                bookingData.endDate = endDateInput.value;
                return true;
                
            case 2: // Traveler Details
                const travelerForms = document.querySelectorAll('.traveler-form');
                bookingData.travelers = [];
                
                for (let i = 0; i < travelerForms.length; i++) {
                    const form = travelerForms[i];
                    const nameInput = form.querySelector('.traveler-name');
                    const ageInput = form.querySelector('.traveler-age');
                    
                    if (!nameInput.value.trim()) {
                        showValidationError(nameInput, 'Please enter traveler name');
                        return false;
                    }
                    
                    const age = parseInt(ageInput.value);
                    if (isNaN(age) || age < 1 || age > 120) {
                        showValidationError(ageInput, 'Please enter a valid age (1-120)');
                        return false;
                    }
                    
                    bookingData.travelers.push({
                        name: nameInput.value.trim(),
                        age: age
                    });
                }
                
                return true;
                
            case 3: // Contact Information
                const emailInput = document.getElementById('contact-email');
                const phoneInput = document.getElementById('contact-phone');
                
                if (!validateEmail(emailInput.value)) {
                    showValidationError(emailInput, 'Please enter a valid email address');
                    return false;
                }
                
                if (!validatePhone(phoneInput.value)) {
                    showValidationError(phoneInput, 'Please enter a valid phone number');
                    return false;
                }
                
                bookingData.contactEmail = emailInput.value;
                bookingData.contactPhone = phoneInput.value;
                return true;
                
            default:
                return true;
        }
    }
    
    // Show validation error
    function showValidationError(inputElement, message) {
        // Remove any existing error messages
        const existingError = inputElement.parentElement.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and insert error message
        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        errorElement.textContent = message;
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        
        inputElement.parentElement.appendChild(errorElement);
        
        // Highlight the input
        inputElement.style.borderColor = '#dc3545';
        
        // Remove error when input changes
        inputElement.addEventListener('input', function() {
            const error = this.parentElement.querySelector('.validation-error');
            if (error) {
                error.remove();
            }
            this.style.borderColor = '';
        }, { once: true });
    }
    
    // Generate traveler forms based on the number of adults
    function generateTravelerForms() {
        const travelerFormsContainer = document.getElementById('traveler-forms');
        travelerFormsContainer.innerHTML = '';
        
        for (let i = 0; i < bookingData.numAdults; i++) {
            const travelerForm = document.createElement('div');
            travelerForm.className = 'traveler-form';
            travelerForm.innerHTML = `
                <h4>Traveler ${i + 1}</h4>
                <div class="form-group">
                    <label class="form-label" for="traveler-name-${i}">Full Name</label>
                    <input type="text" class="form-control traveler-name" id="traveler-name-${i}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="traveler-age-${i}">Age</label>
                    <input type="number" class="form-control traveler-age" id="traveler-age-${i}" min="1" max="120" required>
                </div>
            `;
            
            travelerFormsContainer.appendChild(travelerForm);
        }
    }
    
    // Generate booking summary
    function generateBookingSummary() {
        const summaryContainer = document.getElementById('booking-summary');
        const destinationName = document.getElementById('destination-name')?.textContent;
        const destinationPrice = parseFloat(document.getElementById('destination-price')?.dataset?.price || 0);
        const totalPrice = destinationPrice * bookingData.numAdults;
        
        summaryContainer.innerHTML = `
            <h3 class="summary-title">Booking Summary</h3>
            
            <div class="summary-item">
                <span>Destination:</span>
                <span>${destinationName}</span>
            </div>
            
            <div class="summary-item">
                <span>Journey Dates:</span>
                <span>${formatDate(bookingData.startDate)} - ${formatDate(bookingData.endDate)}</span>
            </div>
            
            <div class="summary-item">
                <span>Number of Travelers:</span>
                <span>${bookingData.numAdults}</span>
            </div>
            
            <div class="summary-item">
                <span>Price per Person:</span>
                <span>${formatPrice(destinationPrice)}</span>
            </div>
            
            <div class="summary-total">
                <span>Total Price:</span>
                <span>${formatPrice(totalPrice)}</span>
            </div>
        `;
    }
    
    // Handle form submission
 function handleSubmit(event) {
    event.preventDefault();

    // Show loading state
    const submitButton = document.querySelector('.booking-submit');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    // ✅ Paste fetch here
    fetch("/api/save_booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to payment page
            window.location.href = `/payment?booking_id=${data.booking_id}`;
        } else {
            alert('Booking failed: ' + data.message);
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
}

    function syncHiddenFields() {
        document.getElementById("hidden-num-adults").value = document.getElementById("num-adults").value;
        document.getElementById("hidden-start-date").value = document.getElementById("start-date").value;
        document.getElementById("hidden-end-date").value = document.getElementById("end-date").value;
        document.getElementById("hidden-contact-email").value = document.getElementById("contact-email").value;
        document.getElementById("hidden-contact-phone").value = document.getElementById("contact-phone").value;
    }

    // Helper functions
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function validatePhone(phone) {
        // Simple validation for phone numbers (adjust as needed)
        return /^\d{10,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    // Initialize datepicker for journey dates if available
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput && endDateInput) {
        // Set min date to today
        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0];
        startDateInput.min = todayFormatted;
        endDateInput.min = todayFormatted;
        
        // Update end date min value when start date changes
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            
            // If end date is before new start date, reset it
            if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = '';
            }
        });
    }
    
    // Event listeners
    if (prevButtons.length > 0) {
        prevButtons.forEach(button => {
            button.addEventListener('click', prevStep);
        });
    }
    
    if (nextButtons.length > 0) {
        nextButtons.forEach(button => {
            button.addEventListener('click', nextStep);
        });
    }
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleSubmit);
    }
    document.getElementById("travelers-json").value = JSON.stringify(bookingData.travelers);

  function handleSubmit(event) {
    event.preventDefault();

    const submitButton = document.querySelector('.booking-submit');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    // Sync hidden fields (optional if using hidden inputs)
    syncHiddenFields();

    // Submit actual form via POST to Flask
    fetch(window.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(new FormData(document.getElementById("booking-form")))
    })
    .then(response => response.text())
    .then(data => {
        // Check for redirect via manual detection
        if (data.includes("Booking Confirmation") || data.includes("Success")) {
            // Success page already loaded
            document.open();
            document.write(data);
            document.close();
        } else if (data.includes("booking_id=")) {
            // Redirect manually if booking ID is in the URL
            const bookingIdMatch = data.match(/booking_id=(\\d+)/);
            const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;
            if (bookingId) {
                window.location.href = `/success?booking_id=${bookingId}`;
            } else {
                alert('Booking processed but success ID not found.');
            }
        } else {
            document.body.innerHTML = data; // Show error or debug response
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
}

    
    // Initialize steps
    initializeSteps();
});

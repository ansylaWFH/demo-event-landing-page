import React, { useState, useEffect } from 'react';

// Main App component for the VSL landing page
const App = () => {
    // State to hold form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        quantity: '1',
        ticketType: 'regular',
    });
    // State to show the loading modal
    const [isLoading, setIsLoading] = useState(false);
    // State to manage the current page view
    const [currentPage, setCurrentPage] = useState('landing');
    // State to control the visibility of the booking form modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    // State to track if Paystack script is ready
    const [isPaystackReady, setIsPaystackReady] = useState(false);

    // Effect to dynamically load the Paystack script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;

        const handleScriptLoad = () => {
            // A small delay to ensure the PaystackPop object is fully initialized.
            setTimeout(() => {
                setIsPaystackReady(true);
                console.log('Paystack script loaded and ready.');
            }, 200); // 200ms delay for robustness
        };

        script.addEventListener('load', handleScriptLoad);
        document.body.appendChild(script);

        // Cleanup function to remove the script when the component unmounts
        return () => {
            script.removeEventListener('load', handleScriptLoad);
            document.body.removeChild(script);
        };
    }, []);
    
    // Ticket types and their prices
    const ticketTypes = [
        { label: 'Regular Ticket', value: 'regular', price: 50 },
        { label: 'VIP Pass', value: 'vip', price: 150 },
    ];
    
    // Calculates the total price in kobo (cents) for Paystack
    const calculateTotalAmount = () => {
        const price = ticketTypes.find(t => t.value === formData.ticketType)?.price || 0;
        return price * parseInt(formData.quantity || '0', 10) * 100;
    };

    // Displays the total price in Ghana Cedis for the user
    const totalPriceDisplay = calculateTotalAmount() / 100;

    // Handles changes in form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Function to handle the Paystack payment
    const handlePaystackPayment = () => {
        if (!formData.name || !formData.email || parseInt(formData.quantity, 10) < 1) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (!isPaystackReady) {
            console.error('Paystack script not ready. Please wait.');
            alert('Payment service is still loading. Please try again in a moment.');
            return;
        }

        setIsLoading(true);

        const handler = window.PaystackPop.setup({
            key: 'pk_live_87c3c567301e82e5685926742d23cb2458d4a1ae', // Live public key
            email: formData.email,
            amount: calculateTotalAmount(),
            ref: (new Date()).getTime().toString(),
            currency: 'GHS', // <--- Explicitly setting the currency to Ghana Cedis
            callback: (response) => {
                console.log('Payment successful. Reference:', response.reference);
                setIsLoading(false);
                setCurrentPage('success');
                setShowBookingModal(false);
            },
            onClose: () => {
                console.log('Payment modal closed.');
                setIsLoading(false);
            },
        });
        
        handler.openIframe();
    };


    // Renders the main VSL landing page with the "Book Now" button
    const renderLandingPage = () => (
        <div className="relative min-h-screen p-4 flex items-center justify-center bg-gray-900 overflow-hidden">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-20"></div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-2xl bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform transition-all duration-500">
                {/* Headline */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                        Experience Accra's Culture Like Never Before
                    </h1>
                </div>

                {/* Video Sales Letter (VSL) Section */}
                <div className="relative w-full h-0 pb-[56.25%] mb-8 rounded-2xl overflow-hidden shadow-xl">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Sales Letter"
                    ></iframe>
                </div>

                {/* Call-to-Action */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Secure Your Spot Now!</h3>
                    <p className="text-lg text-gray-300 mb-6">Limited tickets available for the exclusive AccraEssentials event.</p>
                    <button
                        onClick={() => setShowBookingModal(true)}
                        className="w-full px-8 py-4 text-xl font-bold text-white transition-transform transform rounded-xl hover:scale-105 shadow-lg bg-green-600"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );

    // Renders the success page after form submission
    const renderSuccessPage = () => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 transition-colors duration-500">
            <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-xl text-center">
                <h2 className="text-4xl font-extrabold text-green-600 mb-4">You're All Set!</h2>
                <p className="text-gray-700 mb-6">A confirmation email has been sent to your inbox. We look forward to seeing you at AccraEssentials!</p>
                <button
                    onClick={() => setCurrentPage('landing')}
                    className="mt-8 px-8 py-3 text-lg font-bold text-white transition-transform transform bg-blue-600 rounded-xl hover:scale-105"
                >
                    Return to Main Page
                </button>
            </div>
        </div>
    );

    // Renders the booking form in a modal
    const renderBookingModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-gray-900 rounded-3xl shadow-2xl p-8 text-white">
                <button 
                    onClick={() => setShowBookingModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <form className="space-y-6">
                    <h3 className="text-2xl font-bold text-center mb-4">Book Your Tickets</h3>
                    
                    {/* Form Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 text-lg border-2 rounded-xl bg-white bg-opacity-20 border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-3 text-lg border-2 rounded-xl bg-white bg-opacity-20 border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Ticket Type</label>
                        <div className="flex w-full overflow-hidden border-2 rounded-xl border-gray-500 bg-white bg-opacity-20">
                            {ticketTypes.map(type => (
                                <button
                                    type="button"
                                    key={type.value}
                                    onClick={() => setFormData(prevData => ({ ...prevData, ticketType: type.value }))}
                                    className={`flex-1 px-4 py-3 text-center text-lg font-semibold transition-colors
                                                ${formData.ticketType === type.value
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'}`}
                                >
                                    {type.label} (GH₵{type.price}.00)
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="1"
                            min="1"
                            className="w-full px-4 py-3 text-lg border-2 rounded-xl bg-white bg-opacity-20 border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                    
                    {/* Total Price & Payment Button */}
                    <div className="mt-8 flex justify-between items-center">
                        <h3 className="text-2xl font-bold">
                            Total: GH₵{totalPriceDisplay.toFixed(2)}
                        </h3>
                        <button
                            type="button"
                            onClick={handlePaystackPayment}
                            disabled={isLoading || !isPaystackReady || !formData.name || !formData.email || parseInt(formData.quantity, 10) < 1}
                            className={`px-8 py-3 text-lg font-bold text-white transition-transform transform rounded-xl hover:scale-105 shadow-lg
                                        ${(isLoading || !isPaystackReady) ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'}`}
                        >
                            {(isLoading || !isPaystackReady) ? (
                                'Loading...'
                            ) : (
                                'Pay Now'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="font-sans">
            <script src="https://js.paystack.co/v1/inline.js"></script>
            {currentPage === 'landing' && renderLandingPage()}
            {currentPage === 'success' && renderSuccessPage()}
            {showBookingModal && renderBookingModal()}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="p-8 text-center bg-white rounded-3xl">
                        <svg className="mx-auto h-12 w-12 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">Processing Payment...</h3>
                        <p className="mt-2 text-sm text-gray-500">Please wait, simulating transaction.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

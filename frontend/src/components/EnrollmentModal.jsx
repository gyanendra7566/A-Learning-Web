import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';

const EnrollmentModal = ({ course, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/enrollments/initiate', {
        courseId: course._id,
        studentDetails: formData
      });

      setPaymentData(response.data.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/enrollments/confirm', {
        transactionId: paymentData.transactionId
      });

      alert('🎉 Enrollment successful! You now have access to the course.');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Enroll in Course' : 'Complete Payment'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Student Details
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  by {course.instructor?.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                  </span>
                  <span className="badge bg-secondary-100 text-secondary-700">
                    {course.level}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Step 2: QR Code Payment
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-6 mb-4">
                  <QRCodeSVG
                    value={paymentData?.qrCodeData}
                    size={200}
                    level="H"
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Scan QR code with any UPI app</p>
                  <p className="font-semibold text-gray-900">UPI ID: {paymentData?.upiId}</p>
                  <p className="text-3xl font-bold text-primary-600">₹{paymentData?.amount}</p>
                  <p className="text-xs text-gray-500">Transaction ID: {paymentData?.transactionId}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Payment Instructions
                </h4>
                <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                  <li>Open any UPI app (Google Pay, PhonePe, Paytm)</li>
                  <li>Scan the QR code or use UPI ID</li>
                  <li>Complete the payment of ₹{paymentData?.amount}</li>
                  <li>Click "Payment Done" after successful payment</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : '✅ Payment Done'}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Note: This is a demo. In production, payment would be verified automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;

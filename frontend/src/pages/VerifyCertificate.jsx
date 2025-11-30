import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyCertificate();
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/verify/${certificateId}`
      );
      setCertificate(response.data.certificate);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="card text-center bg-white shadow-xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Certificate Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/" className="btn-primary inline-block">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificate Verified!
          </h1>
          <p className="text-lg text-gray-600">
            This certificate is authentic and valid
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="card bg-white shadow-2xl">
          <div className="border-l-8 border-green-500 pl-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Certificate Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                  <p className="font-mono font-bold text-lg text-primary-600">
                    {certificate.certificateId}
                  </p>
                </div>
                <span className="badge bg-green-100 text-green-700 text-sm">
                  ✓ Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student Name</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {certificate.studentName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Course Title</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {certificate.courseName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Grade Achieved</p>
                  <p className="font-bold text-green-600 text-2xl">
                    {certificate.grade}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Issued Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(certificate.issuedDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(certificate.completionDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Certificate Status</p>
                  {certificate.isValid ? (
                    <span className="badge bg-green-100 text-green-700">
                      ✓ Valid & Active
                    </span>
                  ) : (
                    <span className="badge bg-red-100 text-red-700">
                      ✗ Revoked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Issued by <span className="font-semibold text-primary-600">ELearning Platform</span>
          </p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            Visit Our Website →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CertificateView = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/certificates/${certificateId}`);
      setCertificate(response.data.certificate);
      setLoading(false);
    } catch (error) {
      console.error('Fetch certificate error:', error);
      setLoading(false);
      alert('Failed to load certificate');
      navigate('/student/certificates');
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Open download in new tab
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/${certificateId}/download`;
      
      // Get token
      const token = localStorage.getItem('token');
      
      // Create a temporary link with authorization
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      setDownloading(false);
      alert('Failed to download certificate');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Certificate',
        text: `I've completed ${certificate.course.title}!`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate verification link copied to clipboard!');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate not found</h2>
          <button onClick={() => navigate('/student/certificates')} className="btn-primary">
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/certificates')}
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold mb-4 inline-block"
          >
            ← Back to Certificates
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="card bg-white shadow-2xl mb-8">
          {/* Certificate Border */}
          <div className="border-8 border-primary-500 rounded-lg p-8">
            <div className="border-2 border-primary-300 rounded-lg p-12 text-center">
              {/* Title */}
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Certificate of Completion
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-8"></div>

              {/* Content */}
              <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
              <h2 className="text-4xl font-bold text-primary-600 mb-6">
                {certificate.student?.name}
              </h2>
              <p className="text-lg text-gray-600 mb-4">has successfully completed the course</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {certificate.course?.title}
              </h3>

              {/* Grade */}
              <div className="inline-block bg-green-50 border-2 border-green-500 rounded-lg px-8 py-4 mb-8">
                <p className="text-sm text-gray-600 mb-1">Grade Achieved</p>
                <p className="text-4xl font-bold text-green-600">{certificate.grade}</p>
              </div>

              {/* Date */}
              <p className="text-gray-600 mb-8">
                Issued on {formatDate(certificate.issuedDate)}
              </p>

              {/* Certificate ID */}
              <p className="text-sm text-gray-500">
                Certificate ID: {certificate.certificateId}
              </p>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-primary-600 font-bold text-lg">ELearning Platform</p>
                <p className="text-sm text-gray-500">https://elearning.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="font-bold text-xl text-gray-900 mb-4">Certificate Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>

            <button
              onClick={handleShare}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share Certificate
            </button>

            <button
              onClick={() => window.open(`/verify-certificate/${certificate.certificateId}`, '_blank')}
              className="btn-secondary flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verify Certificate
            </button>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="card mt-6">
          <h3 className="font-bold text-xl text-gray-900 mb-4">Certificate Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="font-semibold text-gray-900">{certificate.student?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Course Title</p>
              <p className="font-semibold text-gray-900">{certificate.course?.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Grade Achieved</p>
              <p className="font-semibold text-green-600 text-lg">{certificate.grade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issued Date</p>
              <p className="font-semibold text-gray-900">{formatDate(certificate.issuedDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{certificate.certificateId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className="badge bg-green-100 text-green-700">
                ✓ Valid & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;

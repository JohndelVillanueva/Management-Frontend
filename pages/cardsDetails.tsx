import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { DocumentTextIcon, UserIcon, CalendarIcon, DocumentIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import UploadModal from "../modals/UploadModal";

const CardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('Card ID from params:', id);
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  console.log("Component rendering...");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch card details
        const cardRes = await fetch(`http://localhost:3000/cards/${id}`);
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          setCard(cardData);
        }

        // Fetch submissions for this card
        const submissionsRes = await fetch(`http://localhost:3000/submission/${id}`);
        
        if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');
  
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData);
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const handleSubmissionSuccess = async () => {
    if (!id) return;
    
    try {
      const res = await fetch(`http://localhost:3000/submission/${id}`);
      const data = await res.json();
      setSubmissions(data);
      setModalOpen(false);
    } catch (err) {
      console.error("Error refreshing submissions:", err);
    }
  };

  const departmentName = card?.department?.name || "Department";
  const files = card?.files || [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with updated upload button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {card?.title || 'Card Details'}
            </h1>
            <p className="text-gray-600">
              {card?.department?.name || 'No Department'} • {submissions.length} submissions
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            aria-label="Upload file"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Card Description */}
        {card?.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{card.description}</p>
          </div>
        )}

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              onClick={() => navigate(`/submissions/${submission.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {submission.title || 'Untitled Submission'}
                      </h3>
                      <p className="text-xs text-gray-500">{submission.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>
                      {submission.user ? `${submission.user.first_name} ${submission.user.last_name}` : 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    <span>{submission.files?.length || 0} files</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State with updated upload button */}
        {submissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600 mb-6">Be the first to submit a file for this card</p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium mx-auto"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>Upload First File</span>
            </button>
          </div>
        )}
      </div>

      <UploadModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        onSubmissionSuccess={handleSubmissionSuccess}
        cardId={id}
        departmentId={card?.department?.id}
      />
    </div>
  );
};

ReactModal.setAppElement("#root");

export default CardDetails;
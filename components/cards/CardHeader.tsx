import { ArrowLeftIcon, DocumentTextIcon, CalendarIcon, UserIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Card } from "../types/types";

interface CardHeaderProps {
  card: Card;
  filesCount: number;
  onBack: () => void;
  onUpload: () => void;
  uploading: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const CardHeader: React.FC<CardHeaderProps> = ({ 
  card, 
  filesCount, 
  onBack, 
  onUpload, 
  uploading 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Cards</span>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <DocumentTextIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4 max-w-3xl">
                  {card.description || 'No description provided'}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium text-gray-700">{card.departmentNames}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {formatDate(card.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{filesCount} files</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onUpload}
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHeader;
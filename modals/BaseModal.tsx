import React from 'react';
import ReactModal from 'react-modal';

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string; // e.g., 'max-w-md' | 'max-w-lg' | 'max-w-xl'
  containerClassName?: string; // e.g., 'w-[28rem] h-[28rem]'
  contentClassName?: string; // override content area classes
};

const styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    border: 'none',
    background: 'transparent',
  } as React.CSSProperties,
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 50,
  } as React.CSSProperties,
};

// Ensure accessibility root
ReactModal.setAppElement('#root');

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = 'max-w-lg',
  containerClassName = '',
  contentClassName,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      style={styles}
      contentLabel={title || 'Modal'}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${widthClassName} ${containerClassName} mx-auto overflow-hidden flex flex-col max-h-[90vh]`}> 
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="pr-3">
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-3 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className={contentClassName ?? 'px-6 pt-4 pb-4 flex-1 overflow-auto'}>{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">{footer}</div>
        )}
      </div>
    </ReactModal>
  );
};

export default BaseModal;



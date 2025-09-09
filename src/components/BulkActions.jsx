import React, { useState } from 'react';
import { 
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import toast from 'react-hot-toast';

const BulkActions = ({ 
  selectedItems = [], 
  onClearSelection, 
  actions = [], 
  onAction,
  className = ""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [actionParams, setActionParams] = useState({});

  const defaultActions = [
    {
      id: 'status_change',
      label: 'Change Status',
      icon: ClockIcon,
      requiresParams: true,
      params: {
        type: 'select',
        label: 'New Status',
        options: [
          { value: 'OPEN', label: 'Open' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'RESOLVED', label: 'Resolved' },
          { value: 'CLOSED', label: 'Closed' }
        ]
      },
      confirmMessage: 'Are you sure you want to change the status of selected items?'
    },
    {
      id: 'assign',
      label: 'Assign To',
      icon: UserIcon,
      requiresParams: true,
      params: {
        type: 'select',
        label: 'Assign to',
        options: [
          { value: 'admin1', label: 'Admin User 1' },
          { value: 'admin2', label: 'Admin User 2' },
          { value: 'support1', label: 'Support Agent 1' }
        ]
      },
      confirmMessage: 'Assign selected items to the chosen user?'
    },
    {
      id: 'priority_change',
      label: 'Set Priority',
      icon: ExclamationTriangleIcon,
      requiresParams: true,
      params: {
        type: 'select',
        label: 'Priority Level',
        options: [
          { value: 'LOW', label: 'Low' },
          { value: 'MEDIUM', label: 'Medium' },
          { value: 'HIGH', label: 'High' },
          { value: 'URGENT', label: 'Urgent' }
        ]
      },
      confirmMessage: 'Change priority for selected items?'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: PencilIcon,
      requiresParams: false,
      confirmMessage: 'Export selected items to CSV?'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: TrashIcon,
      requiresParams: false,
      confirmMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
      variant: 'danger'
    }
  ];

  const allActions = [...defaultActions, ...actions];

  const handleActionClick = (action) => {
    setCurrentAction(action);
    setIsDropdownOpen(false);
    
    if (action.requiresParams) {
      setActionParams({});
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!currentAction) return;

    try {
      const result = await onAction(currentAction.id, selectedItems, actionParams);
      
      if (result !== false) {
        toast.success(`${currentAction.label} completed successfully`);
        onClearSelection();
      }
    } catch (error) {
      toast.error(`Failed to ${currentAction.label.toLowerCase()}: ${error.message}`);
    } finally {
      setShowConfirmModal(false);
      setCurrentAction(null);
      setActionParams({});
    }
  };

  const handleParamChange = (value) => {
    if (currentAction.params.type === 'select') {
      setActionParams({ [currentAction.params.label.toLowerCase().replace(' ', '_')]: value });
    }
    setShowConfirmModal(true);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden sm:flex space-x-2">
            {allActions.slice(0, 2).map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    action.variant === 'danger'
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            >
              More Actions
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {allActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                        action.variant === 'danger'
                          ? 'text-red-700 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parameter Input Modal */}
      {currentAction && currentAction.requiresParams && !showConfirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setCurrentAction(null)}
          title={currentAction.label}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Configure settings for {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}
            </p>
            
            {currentAction.params.type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentAction.params.label}
                </label>
                <select
                  className="input-field"
                  onChange={(e) => handleParamChange(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select {currentAction.params.label.toLowerCase()}
                  </option>
                  {currentAction.params.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <Modal.Footer>
            <button
              onClick={() => setCurrentAction(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentAction && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title={`Confirm ${currentAction.label}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${
                currentAction.variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <currentAction.icon className={`h-6 w-6 ${
                  currentAction.variant === 'danger' ? 'text-red-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentAction.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            
            <p className="text-gray-600">
              {currentAction.confirmMessage}
            </p>

            {/* Show parameters if any */}
            {Object.keys(actionParams).length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Settings:</h4>
                {Object.entries(actionParams).map(([key, value]) => (
                  <div key={key} className="text-sm text-gray-600">
                    <span className="font-medium">{key.replace('_', ' ')}: </span>
                    {value}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Modal.Footer>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className={currentAction.variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            >
              {currentAction.label}
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default BulkActions;

import React from 'react';
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FormInput = React.memo(({
  field,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  required = false,
  showToggle = false,
  value,
  error,
  showPassword,
  onTogglePassword,
  onChange
}) => {
  const isPassword = type === 'password';

  // Memoize the change handler
  const handleChange = React.useCallback((e) => {
    onChange(field, e.target.value);
  }, [field, onChange]);

  // Memoize the password toggle handler
  const handleToggleClick = React.useCallback(() => {
    onTogglePassword?.();
  }, [onTogglePassword]);

  return (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={field}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-10' : ''} ${showToggle ? 'pr-10' : ''} ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
          value={value}
          onChange={handleChange}
          required={required}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={handleToggleClick}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;

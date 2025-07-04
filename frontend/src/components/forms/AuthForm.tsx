// src/components/AuthForm.tsx
import React from 'react';
import Button from '../LoginButton';

interface Field {
  name: string;
  label: string;
  type: string;
  value: string;
  classsName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

interface AuthFormProps {
  title: string;
  fields: Field[];
  error?: string | null;
  isLoading?: boolean;
  className?: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;

}

export default function AuthForm({
  title,
  fields,
  error,
  isLoading = false,
  className = 'text-center text-black font-bold',
  onSubmit,
  submitLabel,
}: AuthFormProps) {
  return (
    <div className="max-w-sm mx-auto p-6 bg-white text-black rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-center">{title}</h2>
      <form
        onSubmit={onSubmit}
         className={`space-y-4 ${className}`}>

        noValidate
      
        {fields.map(({ name, label, type, value, onChange, placeholder }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium mb-1">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"             // Make sure it's a submit button
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          label={isLoading ? 'Loading...' : submitLabel}  // pass label as prop
        />
      </form>
    </div>
  );
}

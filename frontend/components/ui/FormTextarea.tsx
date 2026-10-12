"use client";

import {
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";

interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      label,
      required = false,
      error,
      description,
      className = "",
      ...props
    },
    ref
  ) => {
    const fieldId =
      props.id ?? props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}

            {required && (
              <span className="ml-1 text-red-500">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={fieldId}
          {...props}
          className={`
            min-h-[110px]
            w-full
            resize-y
            rounded-lg
            border
            bg-white
            px-3
            py-2.5
            text-sm
            text-slate-700
            outline-none
            transition
            dark:bg-slate-800
            dark:text-slate-100
            dark:placeholder:text-slate-500

            placeholder:text-slate-400

            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/10

            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:text-slate-400
            dark:disabled:bg-slate-900

            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-200 dark:border-slate-700"
            }

            ${className}
          `}
        />

        {description && !error && (
          <p className="text-xs text-slate-400">
            {description}
          </p>
        )}

        {error && (
          <p className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
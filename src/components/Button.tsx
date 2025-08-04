import React, { forwardRef } from "react";

export type ButtonProps = React.ComponentPropsWithoutRef<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`px-4 py-2 bg-green-500 text-white rounded ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

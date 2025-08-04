import React, { forwardRef } from "react";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`px-4 py-2 border rounded focus:outline-none focus:ring ${
          className || ""
        }`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

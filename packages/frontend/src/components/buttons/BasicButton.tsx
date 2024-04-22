import React, { forwardRef } from "react";

export interface BasicButtonProps {
  text: string;
  onClick?: () => void;
  styling?: string;
  disabled?: boolean;
}
const BasicButton = forwardRef<HTMLButtonElement, BasicButtonProps>(
  ({ text, onClick, styling, disabled }, ref) => {
    return (
      <button
        ref={ref}
        className={`bg-white text-black sm:font-light font-extralight m-1 p-2 rounded-md hover:scale-105 ${
          styling ?? ""
        }`}
        onClick={onClick}
        type="button"
        disabled={disabled}
      >
        {text}
      </button>
    );
  }
);

BasicButton.displayName = "BasicButton";

export default BasicButton;

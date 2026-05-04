// Utility function to restrict phone number input to only numbers, +, spaces, and hyphens
export const handlePhoneInput = (e) => {
  const value = e.target.value;
  // Allow only numbers, +, spaces, and hyphens
  const sanitized = value.replace(/[^0-9+\s-]/g, '');
  if (sanitized !== value) {
    e.target.value = sanitized;
    // Trigger onChange event manually for react-hook-form
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(e.target, sanitized);
      const event = new Event('input', { bubbles: true });
      e.target.dispatchEvent(event);
    }
  }
};

// onKeyPress handler to prevent non-numeric input
export const handlePhoneKeyPress = (e) => {
  // Allow control keys (backspace, delete, tab, escape, enter, arrows, etc.)
  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (controlKeys.includes(e.key)) {
    return;
  }
  
  // Allow only numbers, +, space, and hyphen
  if (!/[0-9+\s-]/.test(e.key)) {
    e.preventDefault();
  }
};

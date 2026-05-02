"use client";
import Link from "next/link";

export default function Button({
  children,
  variant = "primary", // primary | secondary | outline | ghost
  size = "md", // sm | md | lg
  isLoading = false,
  disabled,
  className = "",
  ...props
}) {
  const sizeClasses = size === "sm" ? "px-3 py-2 text-sm" : size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5";
  const variantClass =
    variant === "secondary" ? "btn-secondary" :
    variant === "outline" ? "btn-outline" :
    variant === "ghost" ? "btn-ghost" : "btn-primary";

  const content = isLoading ? (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
      <span>Loading...</span>
    </span>
  ) : (
    children
  );

  // Link behavior: if href provided, render Next Link for navigation
  if (props.href) {
    const { href, onClick, ...rest } = props;
    return (
      <Link href={href} className={`btn ${variantClass} ${sizeClasses} ${className}`} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`btn ${variantClass} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}



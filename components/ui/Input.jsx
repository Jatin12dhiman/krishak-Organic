export default function Input({ label, error, required, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1 block text-sm text-neutral-700">{label} {required ? <span className="text-red-600">*</span> : null}</span> : null}
      <input
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-0 transition focus:border-neutral-400"
        onClick={(e) => {
          if (props.type === "date" || props.type === "time") {
            try {
              e.target.showPicker();
            } catch (err) {
              console.error("showPicker not supported", err);
            }
          }
        }}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}



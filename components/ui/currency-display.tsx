import { currency } from "@/lib/config";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency: currencyCode,
  className = "",
}: CurrencyDisplayProps) {
  return (
    <span className={className}>{currency.format(amount, currencyCode)}</span>
  );
}

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  currency: currencyCode,
  placeholder = "0",
  className = "",
  disabled = false,
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(e.target.value) || 0;
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
        {currency.getSymbol(currencyCode)}
      </span>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-8 pr-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        disabled={disabled}
      />
    </div>
  );
}

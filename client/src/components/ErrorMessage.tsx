type ErrorMessageProps = {
  message: string;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

export default ErrorMessage;

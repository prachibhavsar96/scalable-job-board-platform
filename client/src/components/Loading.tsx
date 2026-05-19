type LoadingProps = {
  message?: string;
};

function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
      {message}
    </div>
  );
}

export default Loading;

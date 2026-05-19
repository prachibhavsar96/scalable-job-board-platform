import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getCompanies } from "../api/companies";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import type { Company } from "../types";
import { getApiErrorMessage } from "../utils/apiError";

function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getCompanies();

        setCompanies(response);
      } catch (loadError) {
        const message = getApiErrorMessage(
          loadError,
          "Could not load companies. Make sure the backend is running."
        );

        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompanies();
  }, []);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Companies</h1>
        <p className="mt-2 text-slate-600">
          Explore companies currently hiring on the platform.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <Loading message="Loading companies..." />
      ) : companies.length === 0 && !error ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          No companies are listed yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="block h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <h2 className="text-lg font-semibold text-slate-950">
                {company.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-brand-700">
                {company.location}
              </p>
              <p className="mt-4 leading-6 text-slate-600">
                {company.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                {company.jobs?.length || 0} open jobs
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default Companies;

import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  /** Rendered outside the router (top-level boundary) -> use plain links. */
  outsideRouter?: boolean;
}

export default function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please reload the page.",
  outsideRouter = false,
}: ErrorFallbackProps) {
  const linkClass =
    "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-liturgical-blue">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-liturgical-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Reload
          </button>
          {outsideRouter ? (
            <a href="/" className={linkClass}>
              Go home
            </a>
          ) : (
            <Link to="/" className={linkClass}>
              Go home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorFallback from "./ErrorFallback";

/** Router-level error element: 404s and errors thrown while rendering a route. */
export default function RouteError() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorFallback
        title="Page not found"
        message="The page you are looking for doesn't exist or has been moved."
      />
    );
  }

  // A lazily-loaded chunk can disappear after a new deployment.
  const message =
    error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message)
      ? "A new version of the app is available. Please reload the page."
      : undefined;

  return <ErrorFallback message={message} />;
}

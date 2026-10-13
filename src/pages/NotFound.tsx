import ErrorFallback from "../components/ui/ErrorFallback";

export default function NotFound() {
  return (
    <ErrorFallback
      title="Page not found"
      message="The page you are looking for doesn't exist or has been moved."
    />
  );
}

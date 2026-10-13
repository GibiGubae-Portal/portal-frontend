import { Component, ErrorInfo, ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface State {
  hasError: boolean;
}

/** Last line of defence: a render error shows a recovery screen, not a blank page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <ErrorFallback outsideRouter />;
    return this.props.children;
  }
}

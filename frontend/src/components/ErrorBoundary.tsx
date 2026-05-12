import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="p-4 bg-danger-50 dark:bg-danger-500/10 rounded-full inline-flex">
              <AlertTriangle className="w-12 h-12 text-danger" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>

            <p className="text-default-500 text-sm">
              An unexpected error occurred. Please try again or return to the
              home page.
            </p>

            {this.state.error && (
              <pre className="bg-default-100 dark:bg-default-50 p-4 rounded-lg text-xs text-left text-danger overflow-auto max-h-32 border border-default-200">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onPress={this.handleReset}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button
                variant="ghost"
                onPress={() => {
                  this.handleReset();
                  window.location.href = "/";
                }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

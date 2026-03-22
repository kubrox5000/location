import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message.startsWith('{')) {
          const errInfo = JSON.parse(this.state.error.message);
          if (errInfo.error.includes('Missing or insufficient permissions')) {
            errorMessage = 'You do not have permission to perform this action. Please make sure you are logged in as an admin.';
          } else {
            errorMessage = `Database Error: ${errInfo.error}`;
          }
        } else if (this.state.error) {
          errorMessage = this.state.error.message;
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mb-6 text-gray-600">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-gray-900 px-6 py-2 text-white transition-colors hover:bg-gray-800"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

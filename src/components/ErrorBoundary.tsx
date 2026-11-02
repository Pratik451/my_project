import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Something went wrong / समस्या देखा पर्यो
            </h1>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              अंकुर सहकारी वेब पोर्टल लोड गर्दा प्राविधिक समस्या उत्पन्न भयो। कृपया पृष्ठ पुन: लोड गर्नुहोस् वा स्थानीय डाटा रिसेट गर्नुहोस्।
              <br />
              <span className="text-xs text-slate-500 mt-1 block">
                An unexpected application error occurred. You can reload the page or reset local data to restore defaults.
              </span>
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-100 rounded-xl text-left overflow-auto max-h-36 text-xs font-mono text-slate-800 border border-slate-200">
                <span className="font-bold text-rose-600">Error:</span> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
              >
                ↻ पृष्ठ पुन: लोड गर्नुहोस् (Reload)
              </button>
              
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition cursor-pointer"
              >
                डाटा रिसेट गर्नुहोस् (Reset Defaults)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

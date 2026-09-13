import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
            <div className="bg-rose-100 p-3 rounded-full w-max mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="font-bold text-lg text-gray-900 mb-2">Ups, ada yang error</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || 'Terjadi kesalahan tak terduga.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

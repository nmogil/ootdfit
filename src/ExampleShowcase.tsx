import { useState, useEffect } from "react";

interface ExampleShowcaseProps {
  onGetStarted?: () => void;
}

export function ExampleShowcase({ onGetStarted }: ExampleShowcaseProps) {
  const [showAfter, setShowAfter] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Process Flow Header */}
          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-2 sm:gap-8 mb-6 px-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Upload</span>
              </div>
              <div className="w-4 sm:w-12 h-0.5 bg-gradient-to-r from-primary/30 to-primary/60"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Transform</span>
              </div>
              <div className="w-4 sm:w-12 h-0.5 bg-gradient-to-r from-primary/30 to-primary/60"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Collage</span>
              </div>
            </div>
          </div>

          {/* Before/After Images */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className={`order-2 lg:order-1 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium group-hover:scale-105 transition-transform duration-200">
                    Before
                  </span>
                </div>
                <img
                  src="/example_before.png"
                  alt="Original outfit photo - mirror selfie"
                  className="w-full h-auto max-h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className={`order-1 lg:order-2 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium group-hover:scale-105 transition-transform duration-200">
                    After
                  </span>
                </div>
                <img
                  src="/example_after.png"
                  alt="Transformed collage with labeled outfit pieces"
                  className="w-full h-auto max-h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="bg-gradient-to-r from-primary to-primary-hover rounded-full p-4 shadow-xl border-4 border-white animate-pulse hover:animate-none hover:scale-110 transition-transform duration-200">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className={`text-center mt-8 pt-6 border-t border-gray-100 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              See It In Action - Try Free ✨
            </button>
            <p className="text-sm text-gray-500 mt-3">No signup required • See results instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
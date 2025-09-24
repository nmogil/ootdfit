export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-600">
          Created by{' '}
          <a
            href="https://www.mogilventures.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200"
          >
            Mogil Ventures, LLC
          </a>
        </p>
      </div>
    </footer>
  );
}
import "./globals.css";


export const metadata = {
  title: "SiteSeekers",
  description: "Hiring for contractors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}

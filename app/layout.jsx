import Script from 'next/script';

export const metadata = {
  title: 'CGSPACE.NYC Signage',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F4F1EA' }}>
        {children}
        {/* ⚡ 使用 Next.js 官方特使组件注入视觉引擎，强行突破系统拦截 */}
        <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      </body>
    </html>
  )
}

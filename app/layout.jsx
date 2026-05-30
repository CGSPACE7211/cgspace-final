export const metadata = {
  title: 'CGSPACE.NYC Signage',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ⚡ 注入热激活引擎，一秒复活极致冷冽视觉 */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F4F1EA' }}>
        {children}
      </body>
    </html>
  )
}

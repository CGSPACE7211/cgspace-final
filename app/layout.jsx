export const metadata = {
  title: 'CGSPACE.NYC Signage',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F4F1EA' }}>
        {children}
      </body>
    </html>
  )
}

import './_assets/style/globals.css'

export const metadata = {
  title: 'Mage Terra',
  description: 'Build your magical kingdom with dominoes!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link href="https://fonts.googleapis.com/css?family=Amaranth&display=swap" rel="stylesheet"></link>
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}

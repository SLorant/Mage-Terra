import './_assets/style/globals.css'
import { ErrorBoundary } from 'react-error-boundary'

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
      <ErrorBoundary
        fallback={
          <div className="xl:w-1/3 h-1/3 w-full md:w-1/2 absolute z-50 darkbg rounded-sm flex flex-col justify-around items-center">
            <h2 className="px-8 text-center text-2xl xl:text-3xl mt-8  text-white ">Something went wrong!</h2>
            <div className="flex">
              <button
                className="w-[275px] h-14 mt-8  text-2xl bg-lightpurple text-[#130242] 
          transition ease-in-out duration-200 hover:bg-grey mb-8">
                return to main page
              </button>
            </div>
          </div>
        }>
        <body suppressHydrationWarning={true}>{children}</body>
      </ErrorBoundary>
    </html>
  )
}

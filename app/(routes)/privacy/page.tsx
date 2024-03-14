'use client'

import ParallaxImages from '@/app/_components/ParallaxImages'
import { BackButton } from '@/app/_components/Vectors'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push(`/`)
  }
  return (
    <main className={`flex h-full flex-col items-center justify-center text-white  font-sans`}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="md:block hidden">
        <ParallaxImages />
      </div>
      <div className="h-full relative overflow-auto w-full  px-8 md:px-16 xl:px-28  md:w-2/3 2xl:w-1/2 darkbg z-50 flex flex-col items-center justify-start">
        <button className="z-30 absolute top-6 left-10" onClick={handleGoBack}>
          <BackButton />
        </button>
        <h1 className="text-3xl mt-10 pb-4">Privacy policy</h1>
        <p>
          MageTerra is an online multiplayer game developed by Lorant Sutus. This Privacy Policy outlines how we collect, use, and protect data in MageTerra.
        </p>
        <h3 className="text-xl mt-2 py-4">Information We Collect</h3>

        <ol>
          <li>
            <strong>Generated ID:</strong> MageTerra may generate and store a unique identifier in your browser's local storage to facilitate gameplay and
            provide a personalized experience. This identifier is not linked to any personal information and is used solely for game functionality.
          </li>
          <li>
            <strong>Firebase Realtime Database:</strong> MageTerra utilizes Firebase Realtime Database provided by Google to store game-related data, such as
            player scores, and game progress. However, we do not collect any personally identifiable information through Firebase Realtime Database.
          </li>
        </ol>

        <h3 className="text-xl mt-2 py-4">Data Security</h3>

        <ul>
          <li>
            <strong>Local Storage:</strong> The generated ID stored in your browser's local storage is encrypted and securely transmitted between your device
            and our servers to prevent unauthorized access.
          </li>
          <li>
            <strong>Firebase Realtime Database:</strong> We implement industry-standard security measures to protect the data stored in Firebase Realtime
            Database.
          </li>
        </ul>

        <h3 className="text-xl mt-2 py-4">Third-Party Services</h3>

        <p>
          MageTerra may utilize third-party services, such as Firebase Realtime Database, for certain game functionalities. These third-party services may have
          their own privacy policies governing the collection and use of data. We encourage you to review the privacy policies of these third-party services for
          more information.
        </p>

        <h3 className="text-xl mt-2 py-4">Changes to This Privacy Policy</h3>

        <p>
          We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated Privacy
          Policy on our website. Your continued use of MageTerra after the posting of the updated Privacy Policy constitutes your acceptance of the changes.
        </p>

        <h3 className="text-xl mt-2 py-4">Contact Us</h3>

        <p className="mb-10">
          If you have any questions or concerns about this Privacy Policy or the data practices of MageTerra, please contact us at [Your Contact Email].
        </p>
      </div>
    </main>
  )
}

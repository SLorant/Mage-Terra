"use client";

import ParallaxImages from "@/src/components/ParallaxImages";
import { BackButton } from "@/src/components/Vectors";
import { Link, useNavigate } from "react-router";

export default function Contact() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(`/`);
  };
  return (
    <main
      className={`flex h-full flex-col items-center justify-center text-white  font-sans`}
    >
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="md:block hidden">
        <ParallaxImages />
      </div>
      <div className="h-full md:h-2/3 relative overflow-auto w-full  px-8 md:px-16 xl:px-28 md:w-2/3  lg:w-1/2 2xl:w-5/12 darkbg z-50 flex flex-col items-center justify-start">
        <button className="z-30 absolute top-6 left-10" onClick={handleGoBack}>
          <BackButton />
        </button>
        <h1 className="text-4xl mt-10 pb-32 md:pb-6">Contact</h1>
        <div className="flex justify-center items-center gap-2">
          <p className="hidden md:flex md:text-lg">
            This project was made by Lorant Sutus
          </p>
          <p className="md:hidden flex md:text-lg">
            Project was made by Lorant Sutus
          </p>
          <Link
            to={"https://www.linkedin.com/in/l%C3%B3r%C3%A1nt-sutus-a32123238/"}
          >
            <img
              className="w-6 md:w-8"
              src="/logos/linkedin.svg"
              alt=""
              height={80}
              width={80}
            ></img>
          </Link>

          <Link target="blank" to={"https://github.com/SLorant"}>
            <img
              className="w-6 md:w-8"
              src="/logos/github.svg"
              alt=""
              height={80}
              width={80}
            ></img>
          </Link>
        </div>
        <div className="flex justify-center items-center gap-2 mt-8 md:mt-6">
          <p className="md:text-lg">Illustrations made by Adrienn Kovacs</p>
          <Link target="blank" to={"https://www.behance.net/adriennkovcs2"}>
            <img
              className="w-6 md:w-8"
              src="/logos/behance.svg"
              alt=""
              height={80}
              width={80}
            ></img>
          </Link>
        </div>
        <p className="md:text-lg md:mt-0 mt-2 py-6">
          Contact us: contact.mageterra@gmail.com
        </p>
        <img
          className="w-80"
          src="/examples/avatars.png"
          alt="avatars"
          height={80}
          width={80}
        ></img>
      </div>
    </main>
  );
}

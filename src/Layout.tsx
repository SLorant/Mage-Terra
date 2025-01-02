import React from "react";
import { Outlet } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import "./assets/style/globals.css";

export const metadata = {
  title: "Mage Terra",
  description: "Build your magical kingdom with dominoes!",
};

export default function RootLayout() {
  return (
    /*  <html lang="en" className="light" style={{ colorScheme: "light" }}> */
    <ErrorBoundary
      fallback={
        <main className="w-[100vw] h-[100vh] flex items-center justify-center">
          <div className="xl:w-1/3 h-1/3 w-full md:w-1/2 absolute z-50 darkbg rounded-sm flex flex-col justify-around items-center">
            <h2 className="px-8 text-center text-2xl xl:text-3xl mt-8 text-white">
              Something went wrong!
            </h2>
            <div className="flex">
              <a
                href={"/"}
                className="w-[275px] h-14 text-2xl bg-lightpurple text-[#130242] 
                    transition ease-in-out duration-200 hover:bg-grey mb-8 cursor-pointer flex items-center justify-center"
              >
                return to main page
              </a>
            </div>
          </div>
        </main>
      }
    >
      <Outlet />
    </ErrorBoundary>
  );
}

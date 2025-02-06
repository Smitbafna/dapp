// import { Link } from "@heroui/link";
// import { Button } from "@heroui/button";
// import { siteConfig } from "@/config/site";
import DefaultLayout from "@/layouts/default";
import { title1,title2,title, subtitle } from "@/components/primitives";
// import { useState } from "react";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="aurora-bg flex flex-col items-center justify-center gap-8 py-8 md:py-10 text-white cursor-default">
      <div className="inline-block max-w-lg text-center justify-center">
          {/* Title with spotlight effect on hover and pointer cursor */}
          <div className="flex flex-col items-center">
            <span className={`${title1()} font-extrabold text-black animate-move-up hover:relative hover:text-white  cursor-pointer`}>
              Decentralized...
            </span>
            <span className={`${title2()} font-bold text-black animate-move-up hover:relative hover:text-white  cursor-pointer`}>
              Anonymous..
            </span>
            <span className={`${title()} font-bold text-black animate-move-up hover:relative hover:text-white  cursor-pointer`}>
              Encrypted.
            </span>
          </div>

          {/* Subtitle with solid white color */}
          <div className={`${subtitle({ class: "mt-4" })} font-bold text-grey animate-move-up`}>
          
          <span className="inline-block transform  cursor-pointer relative hover:text-black px-2">
            Empowering communities with a 
              
            </span> 
            <span className="inline-block transform  cursor-pointer relative hover:text-black px-2">
            fully decentralized, anonymous lottery for 
            </span> 
            <span className="inline-block transform  cursor-pointer relative hover:text-black px-2">
            fundraisers, entertainment, and DAO treasury distributions.
              
            </span> 
            
          </div>

        </div>
      </section>
    </DefaultLayout>
  );
}

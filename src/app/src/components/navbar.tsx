import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
} from "@/components/icons";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  return (<>
    {/* <Logo className="h-16 w-16 transform -translate-x-1000" /> */}
    <HeroUINavbar maxWidth="xl" position="sticky" className="py-3" style={{ backgroundColor: 'rgb(232, 220, 244)' }}>
      
     <NavbarContent className="basis-1/5 sm:basis-full flex items-center justify-start ">
  <NavbarBrand className="gap-3 max-w-fit flex items-center">
    <Link
      className="flex flex-row justify-start items-center " // Flex column to stack text
      color="foreground"
      href="/"
    >
      <p className="font-extrabold text-inherit text-4xl">I-CaliL</p>
      <Logo className="h-1 w-1 " />
      <p className="font-extrabold text-inherit text-4xl">ttery</p>
    </Link>
  </NavbarBrand>
</NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-4">
          <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <TwitterIcon className="text-default-500 text-xl" /> {/* Increase icon size */}
          </Link>
          <Link isExternal href={siteConfig.links.discord} title="Discord">
            <DiscordIcon className="text-default-500 text-xl" />
          </Link>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500 text-xl" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>

      
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500 text-xl" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-3">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                href="#"
                size="lg"
                className="text-xl"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
    <HeroUINavbar maxWidth="xl" position="sticky" className="py-0" style={{ backgroundColor: 'rgb(199, 168, 229)' }}>
  <NavbarContent className="flex justify-center gap-14">
    <NavbarItem className="pl-20"> {/* Added padding-left here */}
      <Link href="/home" className="text-lg font-bold text-black hover:text-gray-700">
        Home
      </Link>
    </NavbarItem>
    <NavbarItem>
      <Link href="/createlottery" className="text-lg font-bold text-black hover:text-gray-700">
        Create Lottery
      </Link>
    </NavbarItem>
    <NavbarItem>
      <Link href="/enterlottery" className="text-lg font-bold text-black hover:text-gray-700">
        Enter Lottery
      </Link>
    </NavbarItem>
    <NavbarItem>
      <Link href="/propose" className="text-lg font-bold text-black hover:text-gray-700">
        Propose
      </Link>
    </NavbarItem>
  </NavbarContent>
</HeroUINavbar>






    </>
  );
};
